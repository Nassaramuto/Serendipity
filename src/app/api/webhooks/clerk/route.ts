/**
 * Clerk Webhook Handler
 * Syncs Clerk users to the database
 */

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/server/db";

export async function POST(req: Request) {
  // Get the webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with the secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Handle the event
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const email = email_addresses[0]?.email_address;
    if (!email) {
      return new Response("No email address", { status: 400 });
    }

    const name = [first_name, last_name].filter(Boolean).join(" ").trim() || null;

    try {
      await db.user.create({
        data: {
          clerkId: id,
          email,
          name,
          photoUrl: image_url,
        },
      });

      console.log(`Created user: ${id}`);
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response("Error creating user", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const email = email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ").trim() || null;

    try {
      await db.user.update({
        where: { clerkId: id },
        data: {
          email,
          name,
          photoUrl: image_url,
        },
      });

      console.log(`Updated user: ${id}`);
    } catch (error) {
      console.error("Error updating user:", error);
      // User might not exist yet, that's okay
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (!id) {
      return new Response("No user id", { status: 400 });
    }

    try {
      await db.user.delete({
        where: { clerkId: id },
      });

      console.log(`Deleted user: ${id}`);
    } catch (error) {
      console.error("Error deleting user:", error);
      // User might not exist, that's okay
    }
  }

  return new Response("OK", { status: 200 });
}
