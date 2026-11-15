const prisma = require("../../db/prisma");
const AppError = require("../../utils/AppError");
const { getPagination, buildPagination } = require("../../utils/pagination");
const { decimalToNumber } = require("../../utils/serializers");

function mapOrder(order) {
  return {
    id: order.id,
    orderNo: order.orderNo,
    status: order.status,
    paymentMethod: order.paymentMethod,
    grandTotalPrice: decimalToNumber(order.grandTotalPrice),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    user: order.user
      ? {
          id: order.user.id,
          name: order.user.name,
          email: order.user.email,
          phone: order.user.phone,
        }
      : null,
    items: (order.items || []).map((item) => ({
      id: item.id,
      itemType: item.itemType,
      productId: item.productId,
      ticketId: item.ticketId,
      productName: item.productName,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      image: item.image,
      quantity: item.quantity,
      unitPrice: decimalToNumber(item.unitPrice),
      totalPrice: decimalToNumber(item.totalPrice),
      discountPrice: decimalToNumber(item.discountPrice),
    })),
  };
}

async function listOrders(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const where = {};

  if (query.status) where.status = query.status;

  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) {
      const end = new Date(query.to);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (query.itemType === "product" || query.itemType === "ticket") {
    where.items = { some: { itemType: query.itemType } };
  }

  if (query.search?.trim()) {
    const s = query.search.trim();
    where.OR = [
      { orderNo: { contains: s, mode: "insensitive" } },
      { user: { name: { contains: s, mode: "insensitive" } } },
      { user: { phone: { contains: s, mode: "insensitive" } } },
      { user: { email: { contains: s, mode: "insensitive" } } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        user: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return {
    orders: rows.map(mapOrder),
    meta: buildPagination({ page, perPage, total }),
  };
}

async function getOrder(id) {
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { user: true, items: true },
  });
  if (!order) throw new AppError("Order not found", 404);
  return mapOrder(order);
}

async function updateOrderStatus(id, status) {
  const existing = await prisma.order.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Order not found", 404);

  const order = await prisma.order.update({
    where: { id: existing.id },
    data: { status },
    include: { user: true, items: true },
  });

  return mapOrder(order);
}

module.exports = { listOrders, getOrder, updateOrderStatus };
