import { Router } from "express";
import { TelegramService } from "../services/TelegramService";
import { ContactController } from "../controllers/ContactController";
import { optionalUser } from "../middlewares/auth";

const router = Router();
const telegramService = new TelegramService();
const contactController = new ContactController(telegramService);

router.post("/", optionalUser, contactController.submitContact);

export default router;
