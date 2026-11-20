import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { syncUserFromClerk, deactivateUserFromClerk } from "@/lib/services/user-service";
import { ServiceError } from "@/lib/errors";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("❌ Missing CLERK_WEBHOOK_SECRET environment variable");
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_CONFIG_ERROR", message: "Webhook secret is not configured" } },
      { status: 500 }
    );
  }

  // Get Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "Missing required svix headers" } },
      { status: 400 }
    );
  }

  // Read request body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify Svix signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("❌ Error verifying Clerk webhook signature:", err);
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_SIGNATURE", message: "Webhook verification failed" } },
      { status: 400 }
    );
  }

  const eventType = evt.type;

  // 1. Inbox Deduplication: Check if message has already been processed
  const existingMessage = await prisma.inboxMessage.findUnique({
    where: { eventId: svix_id },
  });

  if (existingMessage) {
    return NextResponse.json({
      ok: true,
      data: { deduplicated: true, eventId: svix_id, status: "already_processed" },
    });
  }

  // 2. Record inbox message as deduplication guard
  try {
    await prisma.inboxMessage.create({
      data: {
        eventId: svix_id,
        source: "CLERK_WEBHOOK",
        payload: (payload ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({
        ok: true,
        data: { deduplicated: true, eventId: svix_id, status: "concurrent_duplicate" },
      });
    }
    throw err;
  }

  try {
    let resultData: Record<string, unknown> = { eventType };

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;

      const primaryEmail =
        email_addresses?.find((e) => e.id === evt.data.primary_email_address_id)?.email_address ||
        email_addresses?.[0]?.email_address;

      if (!primaryEmail) {
        return NextResponse.json(
          { ok: false, error: { code: "MISSING_EMAIL", message: "User primary email not found in webhook" } },
          { status: 422 }
        );
      }

      const role = (public_metadata?.role as "STUDENT" | "ASSISTANT" | "ADMIN") || "STUDENT";

      const user = await syncUserFromClerk({
        clerkId: id,
        email: primaryEmail,
        firstName: first_name || "Student",
        lastName: last_name || "User",
        role,
      });

      resultData = { userId: user.id, clerkId: user.clerkId };
    } else if (eventType === "user.deleted") {
      const { id } = evt.data;
      if (id) {
        await deactivateUserFromClerk(id);
      }
      resultData = { clerkId: id, status: "deactivated" };
    }

    return NextResponse.json({ ok: true, data: resultData });
  } catch (error) {
    console.error(`❌ Webhook handling error for event ${eventType}:`, error);

    if (error instanceof ServiceError) {
      return NextResponse.json(
        { ok: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred processing webhook" } },
      { status: 500 }
    );
  }
}
