import { Request, Response, NextFunction } from "express";
import { TelegramService } from "../services/TelegramService";

export class ContactController {
  constructor(private telegramService: TelegramService) {}

  submitContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const forwardedFor = req.headers["x-forwarded-for"];
      const clientIp = typeof forwardedFor === "string"
        ? forwardedFor.split(",")[0].trim()
        : req.ip || "127.0.0.1";

      const result = await this.telegramService.sendContactMessage(
        req.body,
        clientIp,
        req.user?.id,
        req.user?.email
      );

      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
