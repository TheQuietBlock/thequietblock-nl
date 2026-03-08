import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,16}$/;
const RATE_LIMIT_MS = 10_000;
const ipCooldown = new Map<string, number>();

function json(message: string, success = false, status = 200) {
  return new Response(JSON.stringify({ success, message }), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function cleanupCooldowns(now: number) {
  for (const [key, expiresAt] of ipCooldown.entries()) {
    if (expiresAt <= now) ipCooldown.delete(key);
  }
}

async function parseBody(request: Request) {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    return request.json();
  }
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const now = Date.now();
  cleanupCooldowns(now);

  const key = clientAddress || request.headers.get("x-forwarded-for") || "unknown";
  const lastSeen = ipCooldown.get(key);
  if (lastSeen && lastSeen > now) {
    return json("Please wait before submitting again.", false, 429);
  }

  const body = await parseBody(request);
  const username = String(body.username || "").trim();
  const motivation = String(body.motivation || "").trim();
  const contact = String(body.contact || "").trim();
  const website = String(body.website || "").trim();
  const consent = String(body.consent || "").trim();

  if (website) return json("Spam check triggered.", false, 400);
  if (!consent || !["true", "on", "1"].includes(consent.toLowerCase())) {
    return json("Consent is required before submission.", false, 400);
  }
  if (!USERNAME_RE.test(username)) {
    return json("Invalid username format.", false, 400);
  }
  if (motivation.length < 10 || motivation.length > 500) {
    return json("Motivation must be between 10 and 500 characters.", false, 400);
  }

  ipCooldown.set(key, now + RATE_LIMIT_MS);

  const host = import.meta.env.SMTP_HOST;
  const user = import.meta.env.SMTP_USER;
  const pass = import.meta.env.SMTP_PASS;
  const to = import.meta.env.APPLY_TO;
  const from = import.meta.env.APPLY_FROM || user;
  const replyTo = import.meta.env.APPLY_REPLY_TO || from;

  if (!host || !user || !pass || !to || !from) {
    return json("Application delivery is not configured yet for this environment.", false, 503);
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(import.meta.env.SMTP_PORT || 587),
      secure: String(import.meta.env.SMTP_SECURE || "false") === "true",
      auth: {
        user,
        pass
      }
    });

    await transporter.sendMail({
      from,
      to,
      replyTo,
      subject: `[TQB Apply] ${username}`,
      text: [
        "New whitelist application",
        "",
        `Username: ${username}`,
        `Contact: ${contact || "not provided"}`,
        "",
        "Motivation:",
        motivation
      ].join("\n")
    });

    return json("Application submitted. Staff will review it shortly.", true, 200);
  } catch (error) {
    console.error("Failed to send application email", error);
    return json("Submission failed while sending email. Try again later.", false, 500);
  }
};

export const GET: APIRoute = async () => json("Method not allowed.", false, 405);
