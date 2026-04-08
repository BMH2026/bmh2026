/**
 * /api/auth/qr — QR token lifecycle
 *
 * POST /api/auth/qr  (Admin) — generate a 5-min single-use QR token
 * PUT  /api/auth/qr  (Guest)  — validate token, create RoomSession, set cookie
 */
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Redis } from "@upstash/redis";
import { verifyAdminToken } from "@/lib/internal-auth";
import { getStore } from "@/lib/store";
import { env } from "@/lib/env";
import {
  qrRedisKey,
  roomSessionCookieOptions,
  COOKIE_ROOM_SESSION,
} from "@/lib/session";
import { z } from "zod";

function getRedis(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL ?? "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
  });
}

// ─── POST — Admin: generate QR token ─────────────────────────────────────────
const GenerateSchema = z.object({
  bookingId: z.string().uuid(),
  roomType:  z.string().min(1),
  guestName: z.string().min(1),
  guestEmail: z.string().email().optional(),
  checkOut:  z.string().datetime(),
});

export async function POST(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request", issues: parsed.error.issues }, { status: 400 });
  }

  const token = randomUUID();
  const redis = getRedis();

  await redis.set(
    qrRedisKey(token),
    JSON.stringify(parsed.data),
    { ex: env.qrTtlSeconds }
  );

  const validateUrl = `${env.siteUrl}/api/auth/qr?t=${token}`;
  const expiresAt = new Date(Date.now() + env.qrTtlSeconds * 1000).toISOString();

  return NextResponse.json({ token, validateUrl, expiresAt, ttlSeconds: env.qrTtlSeconds });
}

// ─── GET — Guest: validate QR token (scan redirect) ──────────────────────────
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t");
  if (!token) {
    return NextResponse.redirect(`${env.siteUrl}/vao?error=missing_token`);
  }

  const redis = getRedis();
  const raw = await redis.get(qrRedisKey(token));
  if (!raw) {
    return NextResponse.redirect(`${env.siteUrl}/vao?error=qr_expired`);
  }

  // Single-use: delete immediately
  await redis.del(qrRedisKey(token));

  const data = typeof raw === "string" ? JSON.parse(raw) : raw as Record<string, unknown>;

  const store = getStore();
  const session = await store.createRoomSession({
    bookingId:  String(data.bookingId),
    roomType:   String(data.roomType),
    guestName:  String(data.guestName),
    guestEmail: data.guestEmail ? String(data.guestEmail) : undefined,
    checkOut:   String(data.checkOut),
  });

  const response = NextResponse.redirect(`${env.siteUrl}/vao`);
  const cookieOpts = roomSessionCookieOptions(session.checkOut);
  response.cookies.set(COOKIE_ROOM_SESSION, session.token, cookieOpts);
  return response;
}
