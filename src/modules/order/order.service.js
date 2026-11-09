const prisma = require("../../db/prisma");
const AppError = require("../../utils/AppError");
const { mapAddress, mapOrder, decimalToNumber } = require("../../utils/serializers");

function generateOrderNo() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `PMI-${stamp}-${rand}`;
}

async function upsertAddress(userId, body) {
  const data = {
    email: body.email,
    phone: body.phone,
    firstName: body.first_name,
    lastName: body.last_name,
    country: body.country || "Bangladesh",
    address: body.address,
    additionalInfo: body.additional_info,
    town: body.town,
    city: body.city,
    postCode: body.post_code,
  };

  const address = await prisma.customerAddress.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });

  return mapAddress(address);
}

async function getAddressByUserId(userId, requestedId) {
  const address = await prisma.customerAddress.findUnique({
    where: { userId: Number(requestedId) },
  });

  // Frontend calls /customer-address/:userId
  if (!address || Number(requestedId) !== userId) {
    // Allow own address only
    if (Number(requestedId) !== userId) {
      throw new AppError("Forbidden", 403);
    }
    return null;
  }

  return mapAddress(address);
}

async function loadCartItemsForPurchase(userId, itemIds) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        where: { id: { in: itemIds.map(Number) } },
        include: {
          product: { include: { category: true } },
          ticket: { include: { event: true } },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError("No cart items selected", 400);
  }

  if (cart.items.length !== itemIds.length) {
    throw new AppError("Some cart items were not found", 400);
  }

  return cart;
}

async function createOrderFromCartItems({
  userId,
  itemIds,
  paymentMethod = "cash",
  expectedType,
}) {
  const cart = await loadCartItemsForPurchase(userId, itemIds);

  for (const item of cart.items) {
    if (item.itemType !== expectedType) {
      throw new AppError(`Only ${expectedType} items can be purchased here`, 400);
    }
  }

  let grandTotal = 0;
  const orderItemsData = cart.items.map((item) => {
    if (item.itemType === "product") {
      const unit = decimalToNumber(item.product.price) || 0;
      const total = unit * item.quantity;
      grandTotal += total;
      return {
        itemType: "product",
        productId: item.productId,
        productName: item.product.title,
        categoryId: item.product.categoryId,
        categoryName: item.product.category?.title || null,
        image: item.product.thumbnailWeb,
        quantity: item.quantity,
        unitPrice: unit,
        totalPrice: total,
        discountPrice: 0,
      };
    }

    const unit = decimalToNumber(item.ticket.price) || 0;
    const total = unit * item.quantity;
    grandTotal += total;
    return {
      itemType: "ticket",
      ticketId: item.ticketId,
      productName: item.ticket.title,
      categoryId: item.ticket.eventId,
      categoryName: item.ticket.event?.title || "Event Ticket",
      image: item.ticket.imageUrl,
      quantity: item.quantity,
      unitPrice: unit,
      totalPrice: total,
      discountPrice: 0,
    };
  });

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        orderNo: generateOrderNo(),
        status: "paid",
        paymentMethod,
        grandTotalPrice: grandTotal,
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    await tx.cartItem.deleteMany({
      where: { id: { in: cart.items.map((i) => i.id) } },
    });

    return created;
  });

  return mapOrder(order);
}

async function purchaseProducts(userId, body) {
  return createOrderFromCartItems({
    userId,
    itemIds: body.item_ids || [],
    paymentMethod: body.payment_method || "cash",
    expectedType: "product",
  });
}

async function purchaseTickets(userId, body) {
  return createOrderFromCartItems({
    userId,
    itemIds: body.item_ids || [],
    paymentMethod: body.payment_method || "cash",
    expectedType: "ticket",
  });
}

async function getLatestOrder(userId) {
  const order = await prisma.order.findFirst({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  if (!order) return null;
  return mapOrder(order);
}

module.exports = {
  upsertAddress,
  getAddressByUserId,
  purchaseProducts,
  purchaseTickets,
  getLatestOrder,
};
