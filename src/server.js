const env = require("./config/env");
const prisma = require("./db/prisma");
const createApp = require("./app");

const app = createApp();
let server;

async function start() {
  await prisma.$connect();

  server = app.listen(env.port, () => {
    console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
  });
}

function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  const exit = async (code) => {
    await prisma.$disconnect().catch(() => {});
    process.exit(code);
  };

  if (!server) {
    return exit(1);
  }

  server.close(() => {
    exit(0);
  });

  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    exit(1);
  }, 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  shutdown("uncaughtException");
});

start().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
