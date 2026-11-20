import { Router } from "express";
import { AnalyticsRepository } from "../repositories/AnalyticsRepository";
import { AnalyticsService } from "../services/AnalyticsService";
import { AnalyticsController } from "../controllers/AnalyticsController";
import { authenticateUser, requireRole } from "../middlewares/auth";

const router = Router();
const analyticsRepository = new AnalyticsRepository();
const analyticsService = new AnalyticsService(analyticsRepository);
const analyticsController = new AnalyticsController(analyticsService);

router.get("/", authenticateUser, requireRole(["ADMIN"]), analyticsController.getAnalytics);

export default router;
