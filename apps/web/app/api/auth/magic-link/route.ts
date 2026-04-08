/**
 * /api/auth/magic-link — Magic Link lifecycle
 *
 * POST /api/auth/magic-link  (Admin) — send magic link email to guest
 * GET  /api/auth/magic-link  (Guest)  — verify token, create RoomSession, set cookie
 */
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { verifyAdminToken } from "@/lib/internal-auth";
import { getStore } from "@/lib/store";
import { env } from "@/lib/env";
import {
  mlRedisKey,
  roomSessionCookieOptions,
  COOKIE_ROOM_SESSION,
  isInAppBrowser,
} from "@/lib/session";
import { z } from "zod";

function getRedis(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL ?? "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
  });
}

// ─── POST — Admin: send magic link ───────────────────────────────────────────
const SendSchema = z.object({
  bookingId:  z.string().uuid(),
  roomType:   z.string().min(1),
  guestName:  z.string().min(1),
  guestEmail: z.string().email(),
  checkOut:   z.string().datetime(),
});

export async function POST(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = SendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request", issues: parsed.error.issues }, { status: 400 });
  }

  const token = randomUUID();
  const redis = getRedis();

  await redis.set(
    mlRedisKey(token),
    JSON.stringify(parsed.data),
    { ex: env.magicLinkTtlSeconds }
  );

  const magicUrl = `${env.siteUrl}/api/auth/magic-link?t=${token}`;
  const resend = new Resend(env.resendApiKey);

  const { guestName, guestEmail, roomType, checkOut } = parsed.data;
  const checkOutDate = new Date(checkOut).toLocaleDateString("vi-VN", {
    weekday: "long", day: "2-digit", month: "2-digit", year: "numeric"
  });

  const roomLabel: Record<string, string> = {
    "phi-thuyen-2": "Phi Thuyền 2 giường",
    "phi-thuyen-1": "Phi Thuyền 1 giường",
    "homestay-2":   "Nhà gỗ 2 giường",
    "homestay-1":   "Nhà gỗ 1 giường",
  };

  const html = `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f8f4;font-family:Georgia,serif">
<div style="max-width:480px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(26,74,62,0.08)">
  <div style="background:#1a4a3e;padding:32px 32px 24px;text-align:center">
    <p style="color:#f4a261;font-size:12px;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase">Bình Minh Homestay</p>
    <h1 style="color:#fff;font-size:28px;margin:0;font-weight:normal">Chào mừng, ${guestName}!</h1>
  </div>
  <div style="padding:32px">
    <p style="color:#2d6a5c;margin:0 0 8px;font-size:15px">Phòng của bạn:</p>
    <p style="color:#1a4a3e;font-size:20px;font-weight:bold;margin:0 0 24px">${roomLabel[roomType] ?? roomType}</p>
    <p style="color:#2d6a5c;margin:0 0 24px;font-size:14px;line-height:1.6">
      Nhấn nút bên dưới để đăng nhập vào hệ thống Bình Minh và trải nghiệm đầy đủ dịch vụ trong thời gian lưu trú.
      Link có hiệu lực đến <strong>${checkOutDate}</strong>.
    </p>
    <div style="text-align:center;margin:32px 0">
      <a href="${magicUrl}" style="display:inline-block;background:#f4a261;color:#fff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:bold">
        Vào phòng của tôi →
      </a>
    </div>
    <p style="color:#a3a19a;font-size:12px;text-align:center;margin:0">
      Nếu nút không hoạt động, hãy mở Safari hoặc Chrome và dán link sau:<br>
      <span style="color:#1a4a3e;word-break:break-all">${magicUrl}</span>
    </p>
  </div>
  <div style="background:#f0f8f4;padding:16px;text-align:center">
    <p style="color:#2d6a5c;font-size:11px;margin:0">Đảo Minh Châu, Vân Đồn, Quảng Ninh • 0965.312.678</p>
  </div>
</div>
</body></html>`;

  const { error } = await resend.emails.send({
    from: `${env.emailFromName} <${env.emailFrom}>`,
    to: guestEmail,
    subject: `[Bình Minh] Link đăng nhập cho ${guestName} — ${roomLabel[roomType] ?? roomType}`,
    html,
  });

  if (error) {
    return NextResponse.json({ error: "Email send failed", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sentTo: guestEmail });
}

// ─── GET — Guest: verify magic link ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t");
  const ua = req.headers.get("user-agent") ?? "";

  if (!token) {
    return NextResponse.redirect(`${env.siteUrl}/vao?error=missing_token`);
  }

  const redis = getRedis();
  const raw = await redis.get(mlRedisKey(token));
  if (!raw) {
    return NextResponse.redirect(`${env.siteUrl}/vao?error=link_expired`);
  }

  // Single-use: delete immediately
  await redis.del(mlRedisKey(token));

  const data = typeof raw === "string" ? JSON.parse(raw) : raw as Record<string, unknown>;

  const store = getStore();
  const session = await store.createRoomSession({
    bookingId:  String(data.bookingId),
    roomType:   String(data.roomType),
    guestName:  String(data.guestName),
    guestEmail: data.guestEmail ? String(data.guestEmail) : undefined,
    checkOut:   String(data.checkOut),
  });

  // If in-app browser — redirect to /vao with warning flag instead of setting cookie directly
  // (cookie set in in-app browser may not persist to system browser)
  if (isInAppBrowser(ua)) {
    const response = NextResponse.redirect(`${env.siteUrl}/vao?inapp=1&t=${session.token}&exp=${encodeURIComponent(session.checkOut)}`);
    return response;
  }

  const response = NextResponse.redirect(`${env.siteUrl}/vao`);
  response.cookies.set(COOKIE_ROOM_SESSION, session.token, roomSessionCookieOptions(session.checkOut));
  return response;
}
