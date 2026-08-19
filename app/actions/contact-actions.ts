"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { ContactFormInput } from "@/lib/schemas/contact-schema";
import { sendTelegramContactMessage } from "@/lib/services/telegram-service";
import { ServiceError } from "@/lib/errors";

export interface ServerActionResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Server Action for landing page visitors to send feedback/contact directly to Telegram Bot.
 * Supports both anonymous visitors and authenticated campus users.
 */
export async function submitTelegramContactAction(
  input: ContactFormInput
): Promise<ServerActionResponse<{ success: boolean; messageId?: number }>> {
  try {
    // 1. Get optional Clerk user session metadata
    const { userId } = await auth();
    let userEmail: string | undefined;

    if (userId) {
      const user = await currentUser();
      userEmail = user?.emailAddresses[0]?.emailAddress;
    }

    // 2. Obtain client IP from headers for rate limiting
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    // 3. Dispatch to Telegram Service
    const result = await sendTelegramContactMessage({
      input,
      clientIp,
      authenticatedUserId: userId || undefined,
      authenticatedUserEmail: userEmail,
    });

    return {
      ok: true,
      data: {
        success: result.success,
        messageId: result.messageId,
      },
    };
  } catch (error) {
    if (error instanceof ServiceError) {
      return {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }

    console.error("[Submit Contact Action Error]:", error);
    return {
      ok: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while sending your message.",
      },
    };
  }
}
