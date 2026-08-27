import { ContactFormInput, ContactFormSchema } from "@/lib/schemas/contact-schema";
import { ServiceError } from "@/lib/errors";

// In-memory sliding window rate limiter for public contact submissions
const RATE_LIMIT_WINDOW_MS = 3 * 60 * 1000; // 3 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 3;
const ipSubmissions = new Map<string, number[]>();

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const timestamps = ipSubmissions.get(identifier) || [];
  
  // Filter out timestamps outside current window
  const recent = timestamps.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  
  if (recent.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    return true;
  }

  recent.push(now);
  ipSubmissions.set(identifier, recent);
  return false;
}

/**
 * Escapes special HTML characters to prevent parsing errors when Telegram API uses HTML parse mode.
 */
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

export interface SendTelegramMessageOptions {
  input: ContactFormInput;
  clientIp?: string;
  authenticatedUserId?: string;
  authenticatedUserEmail?: string;
}

/**
 * Sends formatted contact message directly to configured Telegram Bot.
 */
export async function sendTelegramContactMessage({
  input,
  clientIp = "127.0.0.1",
  authenticatedUserId,
  authenticatedUserEmail,
}: SendTelegramMessageOptions): Promise<{ success: boolean; messageId?: number }> {
  // 1. Zod Validation
  const parseResult = ContactFormSchema.safeParse(input);
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0]?.message || "Invalid input fields";
    throw new ServiceError("INVALID_INPUT", issue);
  }

  const { name, emailOrHandle, category, message, honeypot } = parseResult.data;

  // 2. Honeypot check (Bot trap)
  if (honeypot && honeypot.trim().length > 0) {
    // Silently succeed for bot scripts without dispatching to Telegram
    return { success: true, messageId: 0 };
  }

  // 3. Rate limiting check
  if (isRateLimited(clientIp)) {
    throw new ServiceError(
      "TOO_MANY_REQUESTS",
      "You have sent several messages recently. Please wait a few minutes before trying again."
    );
  }

  // 4. Validate Environment Variables
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("[Telegram Service]: Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in env.");
    throw new ServiceError(
      "CONFIGURATION_ERROR",
      "Telegram bot contact system is not configured. Please add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to environment configuration."
    );
  }

  // 5. Format Telegram HTML Message
  const categoryTitle = CATEGORY_LABELS[category] || "📬 Landing Contact";
  const senderName = name ? escapeHtml(name) : "Not specified";
  const contactInfo = escapeHtml(emailOrHandle);
  const cleanMessage = escapeHtml(message);
  const authStatus = authenticatedUserId
    ? `Signed In (ID: <code>${escapeHtml(authenticatedUserId)}</code>${authenticatedUserEmail ? ` | Email: ${escapeHtml(authenticatedUserEmail)}` : ""})`
    : "Anonymous Landing Visitor";
  const formattedDate = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    dateStyle: "medium",
    timeStyle: "short",
  }) + " UTC";

  const telegramPayloadText = [
    `<b>${categoryTitle}</b>`,
    ``,
    `<b>👤 Name:</b> ${senderName}`,
    `<b>📧 Contact:</b> ${contactInfo}`,
    `<b>🔐 User Auth:</b> ${authStatus}`,
    `<b>🕒 Date:</b> ${formattedDate}`,
    ``,
    `<b>📝 Message:</b>`,
    cleanMessage,
    ``,
    `<i>Sent via libra25 Landing Page Contact Form</i>`,
  ].join("\n");

  // 6. Send request to Telegram Bot API
  try {
    const telegramEndpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramPayloadText,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const resData = await response.json();

    if (!response.ok || !resData.ok) {
      console.error("[Telegram Bot API Error]:", resData);
      let errMsg = resData.description || "Failed to deliver message to Telegram bot.";
      if (resData.description?.includes("chat not found")) {
        errMsg = "Telegram chat not found. Please open your bot in Telegram and click 'START' to authorize it, and verify your TELEGRAM_CHAT_ID in .env.";
      }
      throw new ServiceError("TELEGRAM_API_ERROR", errMsg);
    }

    return {
      success: true,
      messageId: resData.result?.message_id,
    };
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }

    console.error("[Telegram Dispatch Error]:", error);
    throw new ServiceError(
      "INTERNAL_SERVER_ERROR",
      "An unexpected network error occurred while connecting to Telegram API."
    );
  }
}
