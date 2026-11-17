const multer = require("multer");
const AppError = require("../utils/AppError");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(
      new AppError(
        "Only image files are allowed (jpeg, png, webp, gif)",
        400,
      ),
      false,
    );
  }
  return cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10,
  },
});

function mapMulterError(err) {
  if (!err) return null;

  if (err instanceof AppError) return err;

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return new AppError("Image must be 5MB or smaller", 400);
    }
    if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
      return new AppError("Too many files uploaded", 400);
    }
    return new AppError(err.message || "Upload failed", 400);
  }

  return err;
}

function wrapMulter(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) return next(mapMulterError(err));
      return next();
    });
  };
}

const uploadSingleImage = wrapMulter(upload.single("image"));
const uploadMultipleImages = wrapMulter(upload.array("images", 10));

module.exports = {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
};
