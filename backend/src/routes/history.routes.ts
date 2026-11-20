import { Router } from "express";
import { HistoryRepository } from "../repositories/HistoryRepository";
import { HistoryService } from "../services/HistoryService";
import { HistoryController } from "../controllers/HistoryController";
import { authenticateUser, requireRole } from "../middlewares/auth";

const router = Router();
const historyRepository = new HistoryRepository();
const historyService = new HistoryService(historyRepository);
const historyController = new HistoryController(historyService);

router.get("/my-loans", authenticateUser, historyController.getMyLoans);
router.get(
  "/traceability/:barcode",
  authenticateUser,
  requireRole(["ASSISTANT", "ADMIN"]),
  historyController.getCopyTraceability
);
router.get(
  "/copy/:copyId",
  authenticateUser,
  requireRole(["ASSISTANT", "ADMIN"]),
  historyController.getCopyHistory
);
router.get(
  "/audits",
  authenticateUser,
  requireRole(["ASSISTANT", "ADMIN"]),
  historyController.getAllAuditLogs
);

export default router;
