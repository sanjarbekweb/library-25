import { ContactFormInput, contactFormSchema } from "../schemas/contact.schema";
import { ApiError } from "../utils/ApiError";

const RATE_LIMIT_WINDOW_MS = 3 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 3;
const ipSubmissions = new Map<string, number[]>();

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const timestamps = ipSubmissions.get(identifier) || [];
  const recent = timestamps.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    return true;
  }

  recent.push(now);
  ipSubmissions.set(identifier, recent);
  return false;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const CATEGORY_LABELS: Record<string, string> = {
  FEEDBACK: "💬 General Feedback",
  FEATURE_REQUEST: "💡 Feature Suggestion",
  BUG_REPORT: "🐛 Bug Report",
  GENERAL_INQUIRY: "❓ General Inquiry",
};

export class TelegramService {
  async sendContactMessage(
    input: ContactFormInput,
    clientIp: string = "127.0.0.1",
    authenticatedUserId?: string,
    authenticatedUserEmail?: string
  ): Promise<{ success: boolean; messageId?: number }> {
    const parseResult = contactFormSchema.safeParse(input);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || "Invalid input fields";
      throw new ApiError(400, issue, "VALIDATION_ERROR");
    }

    const { name, emailOrHandle, category, message, honeypot } = parseResult.data;

    // Honeypot check for bots
    if (honeypot && honeypot.trim().length > 0) {
      return { success: true, messageId: 0 };
    }

    // Rate limiting check
    if (isRateLimited(clientIp)) {
      throw new ApiError(
        429,
        "You have sent several messages recently. Please wait a few minutes before trying again.",
        "TOO_MANY_REQUESTS"
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("[Telegram Service]: Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID. Message logged only.");
      console.log("[Contact Submission]:", { name, emailOrHandle, category, message });
      return { success: true, messageId: 1 };
    }

    const categoryTitle = CATEGORY_LABELS[category] || "📬 Landing Contact";
    const senderName = name ? escapeHtml(name) : "Not specified";
    const contactInfo = escapeHtml(emailOrHandle);
    const cleanMessage = escapeHtml(message);
    const authStatus = authenticatedUserId
      ? `Signed In (ID: <code>${escapeHtml(authenticatedUserId)}</code>${authenticatedUserEmail ? ` | Email: ${escapeHtml(authenticatedUserEmail)}` : ""})`
      : "Anonymous Landing Visitor";

    const text = [
      `<b>${categoryTitle}</b>`,
      ``,
      `👤 <b>Sender:</b> ${senderName}`,
      `📫 <b>Contact:</b> <code>${contactInfo}</code>`,
      `🛡 <b>User Status:</b> ${authStatus}`,
      `🌐 <b>Client IP:</b> <code>${escapeHtml(clientIp)}</code>`,
      ``,
      `📝 <b>Message:</b>`,
      `<blockquote>${cleanMessage}</blockquote>`,
      ``,
      `⏰ <i>Sent at: ${new Date().toISOString()}</i>`,
    ].join("\n");

    const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      console.error("[Telegram Service Error]:", data);
      throw new ApiError(500, "Failed to deliver contact message to Telegram notification queue.", "TELEGRAM_DELIVERY_FAILED");
    }

    return {
      success: true,
      messageId: data.result?.message_id,
    };
  }
}
