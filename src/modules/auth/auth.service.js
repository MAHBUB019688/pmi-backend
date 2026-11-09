const prisma = require("../../db/prisma");
const AppError = require("../../utils/AppError");
const env = require("../../config/env");
const { generateOtp, otpExpiresAt } = require("../../utils/otp");
const { signAccessToken } = require("../../utils/token");
const { mapUser, mapCartItem } = require("../../utils/serializers");
const { sendWelcomeEmail } = require("../../utils/mail");

async function invalidateOtps(phone, purpose) {
  await prisma.otpCode.updateMany({
    where: { phone, purpose, consumed: false },
    data: { consumed: true },
  });
}

async function createOtp({ phone, purpose, userId = null, payload = null }) {
  await invalidateOtps(phone, purpose);
  const code = generateOtp();

  const otp = await prisma.otpCode.create({
    data: {
      phone,
      purpose,
      userId,
      code,
      payload: payload || undefined,
      expiresAt: otpExpiresAt(),
    },
  });

  if (!env.isProduction || env.exposeOtp) {
    console.log(`[OTP] ${purpose} ${phone} => ${code}`);
  }

  return otp;
}

async function verifyOtpRecord({ phone, purpose, code }) {
  const otp = await prisma.otpCode.findFirst({
    where: {
      phone,
      purpose,
      code,
      consumed: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new AppError("Invalid OTP", 400);
  }

  if (otp.expiresAt < new Date()) {
    throw new AppError("OTP expired", 400);
  }

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { consumed: true },
  });

  return otp;
}

async function ensureCart(userId) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: {
          product: { include: { category: true } },
          ticket: true,
        },
      },
    },
  });
}

async function buildAuthPayload(user) {
  const cart = await ensureCart(user.id);
  const token = signAccessToken(user);

  return {
    token,
    user: {
      ...mapUser(user),
      cart: {
        items: cart.items.map(mapCartItem),
      },
    },
  };
}

async function sendRegisterOtp(data) {
  const existingPhone = await prisma.user.findUnique({
    where: { phone: data.phone },
  });
  if (existingPhone) {
    throw new AppError("Phone already registered", 422, undefined, {
      phone: ["Phone already registered"],
    });
  }

  if (data.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new AppError("Email already registered", 422, undefined, {
        email: ["Email already registered"],
      });
    }
  }

  const otp = await createOtp({
    phone: data.phone,
    purpose: "register",
    payload: data,
  });

  return {
    message: "OTP sent successfully",
    data: env.exposeOtp ? { otp: otp.code } : null,
  };
}

async function verifyRegisterOtp({ phone, otp }) {
  const record = await verifyOtpRecord({
    phone,
    purpose: "register",
    code: otp,
  });

  const payload = record.payload || {};
  if (!payload.name || !payload.phone) {
    throw new AppError("Registration data expired. Please sign up again.", 400);
  }

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email || null,
      phone: payload.phone,
      dateOfBirth: payload.date_of_birth
        ? new Date(payload.date_of_birth)
        : null,
      gender: payload.gender || null,
      isVerified: true,
    },
  });

  await ensureCart(user.id);
  const auth = await buildAuthPayload(user);

  if (user.email) {
    sendWelcomeEmail(user).catch((error) => {
      console.error("[mail] Welcome email failed:", error.message);
    });
  } else {
    console.warn("[mail] Welcome email skipped: user has no email");
  }

  return {
    message: "Registration successful",
    data: auth,
  };
}

async function resendRegisterOtp({ phone }) {
  const pending = await prisma.otpCode.findFirst({
    where: { phone, purpose: "register", consumed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!pending?.payload) {
    throw new AppError("No pending registration found for this phone", 400);
  }

  const otp = await createOtp({
    phone,
    purpose: "register",
    payload: pending.payload,
  });

  return {
    message: "OTP resent successfully",
    data: env.exposeOtp ? { otp: otp.code } : null,
  };
}

async function sendLoginOtp({ phone }) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const otp = await createOtp({
    phone,
    purpose: "login",
    userId: user.id,
  });

  return {
    message: "OTP sent successfully",
    data: env.exposeOtp ? { otp: otp.code } : null,
  };
}

async function verifyLoginOtp({ phone, otp }) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  await verifyOtpRecord({ phone, purpose: "login", code: otp });
  const auth = await buildAuthPayload(user);

  return {
    message: "Login successful",
    data: auth,
  };
}

async function firebaseLogin({ token }) {
  // Optional Firebase Admin verification. Falls back to decoding for local/dev
  // when FIREBASE_PROJECT_ID is not configured.
  let decoded;

  if (env.firebaseProjectId) {
    try {
      const admin = require("firebase-admin");
      if (!admin.apps.length) {
        admin.initializeApp({
          projectId: env.firebaseProjectId,
        });
      }
      decoded = await admin.auth().verifyIdToken(token);
    } catch (error) {
      console.error("Firebase verify failed:", error.message);
      throw new AppError("Invalid Firebase token", 401);
    }
  } else {
    // Dev fallback: accept a JSON payload string for local testing only
    try {
      decoded = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
    } catch {
      throw new AppError(
        "Firebase is not configured. Set FIREBASE_PROJECT_ID or use OTP login.",
        503,
      );
    }
  }

  const phone = decoded.phone_number || decoded.phone || null;
  const email = decoded.email || null;
  const name = decoded.name || email || phone || "Social User";
  const firebaseUid = decoded.uid || decoded.user_id || decoded.sub;

  if (!firebaseUid) {
    throw new AppError("Invalid Firebase token", 401);
  }

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { firebaseUid },
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    },
  });

  if (!user) {
    if (!phone && !email) {
      throw new AppError("Firebase account missing phone/email", 400);
    }

    user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || `fb_${firebaseUid.slice(0, 12)}`,
        firebaseUid,
        isVerified: true,
      },
    });
  } else if (!user.firebaseUid) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { firebaseUid, isVerified: true },
    });
  }

  const auth = await buildAuthPayload(user);
  return {
    message: "Login successful",
    data: auth,
  };
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);

  return {
    profile: mapUser(user),
  };
}

async function setRestricted(userId, isRestricted) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isRestricted: Boolean(isRestricted) },
  });

  return mapUser(user);
}

module.exports = {
  sendRegisterOtp,
  verifyRegisterOtp,
  resendRegisterOtp,
  sendLoginOtp,
  verifyLoginOtp,
  firebaseLogin,
  getProfile,
  setRestricted,
  ensureCart,
  buildAuthPayload,
};
