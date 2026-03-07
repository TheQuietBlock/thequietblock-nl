import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false;

const rateLimit = new Map<string, number>();
const MIN_INTERVAL = 60_000;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const json = (body: Record<string, unknown>, status: number) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });

  const now = Date.now();
  const lastTime = rateLimit.get(clientAddress) ?? 0;
  if (now - lastTime < MIN_INTERVAL) {
    return json({ success: false, message: 'Too many requests. Please wait a minute.' }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, message: 'Invalid request body.' }, 400);
  }

  const username = String(body.username ?? '').trim();
  const motivation = String(body.motivation ?? '').trim();

  if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
    return json({ success: false, message: 'Invalid Minecraft username.' }, 422);
  }

  if (motivation.length < 10 || motivation.length > 500) {
    return json({ success: false, message: 'Motivation must be 10\u2013500 characters.' }, 422);
  }

  try {
    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST,
      port: Number(import.meta.env.SMTP_PORT),
      secure: false,
      auth: {
        user: import.meta.env.SMTP_USER,
        pass: import.meta.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${import.meta.env.MAIL_FROM_NAME}" <${import.meta.env.MAIL_FROM}>`,
      to: import.meta.env.MAIL_TO,
      subject: `Whitelist Application: ${username}`,
      text: [
        'New whitelist application received.',
        '',
        `Username:   ${username}`,
        `Motivation: ${motivation}`,
        '',
        `IP: ${clientAddress}`,
        `Time: ${new Date().toISOString()}`,
      ].join('\n'),
    });

    rateLimit.set(clientAddress, now);
    return json({ success: true, message: 'Application submitted successfully.' }, 200);
  } catch {
    return json({ success: false, message: 'Failed to send application. Please try again later.' }, 500);
  }
};
