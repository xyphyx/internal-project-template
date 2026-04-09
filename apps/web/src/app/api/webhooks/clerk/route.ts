import { env } from "@/env";
import { internal } from "@convex/_generated/api";
import { getFunctionName } from "convex/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
};

async function fetchInternalMutation(
  fnRef: Parameters<typeof getFunctionName>[0],
  args: Record<string, unknown>
): Promise<void> {
  const deployKey = env.CONVEX_DEPLOY_KEY;
  if (!deployKey) {
    throw new Error("CONVEX_DEPLOY_KEY is not configured");
  }
  const path = getFunctionName(fnRef);
  const response = await fetch(`${env.NEXT_PUBLIC_CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Convex ${deployKey}`,
    },
    body: JSON.stringify({ path, format: "convex_encoded_json", args: [args] }),
  });
  if (!response.ok) {
    throw new Error(`Convex mutation failed: ${await response.text()}`);
  }
  const json = await response.json();
  if (json.status !== "success") {
    throw new Error(`Convex mutation error: ${json.errorMessage}`);
  }
}

export async function POST(req: Request) {
  const webhookSecret = env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "CLERK_WEBHOOK_SECRET is not configured" }, { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(webhookSecret);

  let event: ClerkWebhookEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const email = event.data.email_addresses?.[0]?.email_address ?? "";
      const nameParts = [event.data.first_name, event.data.last_name].filter(Boolean);
      const args: Record<string, unknown> = { clerkId: event.data.id, email };
      if (nameParts.length > 0) args.name = nameParts.join(" ");
      if (event.data.image_url) args.imageUrl = event.data.image_url;
      await fetchInternalMutation(internal.functions.users.upsert, args);
      break;
    }
    case "user.deleted":
      await fetchInternalMutation(internal.functions.users.deleteByClerkId, {
        clerkId: event.data.id,
      });
      break;
  }

  return NextResponse.json({ received: true });
}
