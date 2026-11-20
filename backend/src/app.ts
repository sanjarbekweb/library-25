import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { getEnv } from "./config/env";
import { requestContext } from "./middlewares/requestContext";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import healthRoutes from "./routes/health.routes";
import bookRoutes from "./routes/book.routes";
import circulationRoutes from "./routes/circulation.routes";
import reservationRoutes from "./routes/reservation.routes";
import userRoutes from "./routes/user.routes";
import feedbackRoutes from "./routes/feedback.routes";
import historyRoutes from "./routes/history.routes";
import analyticsRoutes from "./routes/analytics.routes";
import contactRoutes from "./routes/contact.routes";

export function createApp() {
  const env = getEnv();
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(requestContext);
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true, exposedHeaders: ["X-Request-Id"] }));
  app.use(express.json({ limit: "1mb" }));

  // Probes stay outside authentication. /api/health is kept for existing callers.
  app.use("/api/health", healthRoutes);
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "Library Backend is running" });
  });

  app.use(clerkMiddleware());

  app.use("/api/v1/books", bookRoutes);
  app.use("/api/v1/circulation", circulationRoutes);
  app.use("/api/v1/reservations", reservationRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/feedback", feedbackRoutes);
  app.use("/api/v1/history", historyRoutes);
  app.use("/api/v1/analytics", analyticsRoutes);
  app.use("/api/v1/contact", contactRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
