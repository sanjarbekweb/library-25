import { Router } from "express";
import { getEnv } from "../config/env";
import { prisma } from "../utils/prisma";

const router = Router();

/** Liveness: the process is serving requests. Never depends on external systems. */
router.get("/live", (_req, res) => {
  res.json({ status: "ok" });
});

/** Readiness: the database answers within a short deadline. */
router.get("/ready", async (_req, res) => {
  let timer: NodeJS.Timeout | undefined;
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), getEnv().DB_READY_TIMEOUT_MS);
      }),
    ]);
    res.json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "unavailable", dependency: "database" });
  } finally {
    clearTimeout(timer);
  }
});

export default router;
