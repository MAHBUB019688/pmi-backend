const prisma = require("../../db/prisma");
const AppError = require("../../utils/AppError");
const { ensureCart } = require("../auth/auth.service");
const { mapCartItem } = require("../../utils/serializers");

async function getCartWithItems(userId) {
  const cart = await ensureCart(userId);
  const full = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: { include: { category: true } },
          ticket: true,
        },
        orderBy: { id: "desc" },
      },
    },
  });

  return {
    items: full.items.map(mapCartItem),
  };
}

async function addToCart(userId, { item_id, item_type, quantity }) {
  const qty = Math.max(1, Number(quantity) || 1);
  const cart = await ensureCart(userId);

  if (item_type === "product") {
    const product = await prisma.product.findUnique({
      where: { id: Number(item_id) },
    });
    if (!product || !product.status) {
      throw new AppError("Product not found", 404);
    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        itemType: "product",
        productId: product.id,
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + qty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          itemType: "product",
          productId: product.id,
          quantity: qty,
        },
      });
    }
  } else if (item_type === "ticket") {
    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(item_id) },
    });
    if (!ticket || !ticket.status) {
      throw new AppError("Ticket not found", 404);
    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        itemType: "ticket",
        ticketId: ticket.id,
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + qty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          itemType: "ticket",
          ticketId: ticket.id,
          quantity: qty,
        },
      });
    }
  } else {
    throw new AppError("Invalid item type", 400);
  }

  return getCartWithItems(userId);
}

async function updateCart(userId, { id, quantity }) {
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) {
    throw new AppError("Quantity must be at least 1", 400);
  }

  const cart = await ensureCart(userId);
  const item = await prisma.cartItem.findFirst({
    where: { id: Number(id), cartId: cart.id },
  });

  if (!item) throw new AppError("Cart item not found", 404);

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: qty },
  });

  return getCartWithItems(userId);
}

async function removeCartItem(userId, id) {
  const cart = await ensureCart(userId);
  const item = await prisma.cartItem.findFirst({
    where: { id: Number(id), cartId: cart.id },
  });

  if (!item) throw new AppError("Cart item not found", 404);

  await prisma.cartItem.delete({ where: { id: item.id } });
  return getCartWithItems(userId);
}

module.exports = {
  getCartWithItems,
  addToCart,
  updateCart,
  removeCartItem,
};
