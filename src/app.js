const express = require("express");
const cors = require("cors"); //Allow your Next.js frontend to read API responses.
const helmet = require("helmet"); // Helps protect against certain browser-based attacks.
const env = require("./config/env");
const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin:
        env.corsOrigin === "*"
          ? true
          : env.corsOrigin.split(",").map((origin) => origin.trim()),
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "PMI Ecommerce API",
      data: { version: "1.0.0" },
    });
  });

  app.use("/api", routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
