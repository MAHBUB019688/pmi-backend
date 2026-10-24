const { PrismaClient } = require("@prisma/client");
const env = require("../config/env");

// This code creates and exports a Prisma Client instance that your Express.js application can reuse to communicate with your database, such as PostgreSQL or MySQL.

function createPrismaClient() {
  return new PrismaClient({
    log: env.isProduction ? ["error"] : ["warn", "error"],
  });
}

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!env.isProduction) {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
