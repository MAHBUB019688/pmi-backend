const prisma = require("../../db/prisma");
const { decimalToNumber } = require("../../utils/serializers");

function parseDateRange(from, to) {
  const where = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }
  return where;
}

async function getDashboard({ from, to, vendorId }) {
  const dateWhere = parseDateRange(from, to);
  const orderWhere = { ...dateWhere };

  // vendorId reserved for future vendor-scoped dashboards
  void vendorId;

  const [
    totalProducts,
    totalOrders,
    salesAgg,
    pendingOrders,
    cancelledOrders,
    totalCustomers,
    pendingVendorApprovals,
    orders,
    orderItems,
    recentOrders,
    vendorRequests,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count({ where: orderWhere }),
    prisma.order.aggregate({
      where: {
        ...orderWhere,
        status: { in: ["paid", "completed"] },
      },
      _sum: { grandTotalPrice: true },
    }),
    prisma.order.count({ where: { ...orderWhere, status: "pending" } }),
    prisma.order.count({ where: { ...orderWhere, status: "cancelled" } }),
    prisma.user.count(),
    prisma.vendor.count({ where: { status: "pending" } }),
    prisma.order.findMany({
      where: {
        ...orderWhere,
        status: { in: ["paid", "completed", "pending"] },
      },
      select: {
        createdAt: true,
        grandTotalPrice: true,
        status: true,
      },
    }),
    prisma.orderItem.findMany({
      where: {
        itemType: "product",
        order: {
          ...orderWhere,
          status: { in: ["paid", "completed"] },
        },
      },
      select: {
        productName: true,
        categoryName: true,
        totalPrice: true,
        quantity: true,
      },
    }),
    prisma.order.findMany({
      where: orderWhere,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.vendor.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const overviewMap = new Map();
  for (const order of orders) {
    const date = order.createdAt.toISOString().slice(0, 10);
    const entry = overviewMap.get(date) || { date, count: 0, sales: 0 };
    entry.count += 1;
    if (order.status === "paid" || order.status === "completed") {
      entry.sales += decimalToNumber(order.grandTotalPrice) || 0;
    }
    overviewMap.set(date, entry);
  }
  const ordersOverview = [...overviewMap.values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  const productSales = new Map();
  const categorySales = new Map();
  let productTotal = 0;
  let categoryTotal = 0;

  for (const item of orderItems) {
    const value = decimalToNumber(item.totalPrice) || 0;
    productTotal += value;
    categoryTotal += value;

    const pName = item.productName || "Unknown";
    const p = productSales.get(pName) || { name: pName, value: 0 };
    p.value += value;
    productSales.set(pName, p);

    const cName = item.categoryName || "Uncategorized";
    const c = categorySales.get(cName) || { name: cName, value: 0 };
    c.value += value;
    categorySales.set(cName, c);
  }

  const topSellingProducts = [...productSales.values()]
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
    .map((row) => ({
      ...row,
      percent: productTotal ? Number(((row.value / productTotal) * 100).toFixed(2)) : 0,
    }));

  const salesByCategory = [...categorySales.values()]
    .sort((a, b) => b.value - a.value)
    .map((row) => ({
      ...row,
      percent: categoryTotal
        ? Number(((row.value / categoryTotal) * 100).toFixed(2))
        : 0,
    }));

  return {
    kpis: {
      totalProducts,
      totalOrders,
      totalSales: decimalToNumber(salesAgg._sum.grandTotalPrice) || 0,
      pendingOrders,
      cancelledOrders,
      totalCustomers,
      pendingVendorApprovals,
    },
    ordersOverview,
    topSellingProducts,
    salesByCategory,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNo: order.orderNo,
      status: order.status,
      paymentMethod: order.paymentMethod,
      grandTotalPrice: decimalToNumber(order.grandTotalPrice),
      createdAt: order.createdAt,
      user: order.user,
      itemsCount: order.items.length,
    })),
    vendorRequests: vendorRequests.map((v) => ({
      id: v.id,
      businessName: v.businessName,
      contactName: v.contactName,
      email: v.email,
      phone: v.phone,
      status: v.status,
      createdAt: v.createdAt,
    })),
  };
}

module.exports = { getDashboard };
