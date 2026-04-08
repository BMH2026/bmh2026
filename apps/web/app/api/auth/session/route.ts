/**
 * /api/auth/session — Session management + Admin login
 *
 * GET    /api/auth/session           — guest: get current session info
 * DELETE /api/auth/session           — guest/admin: log out (clear cookie)
 * PATCH  /api/auth/session           — admin: terminate or extend a session
 * POST   /api/auth/session/admin     — admin PIN login
 */
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getStore } from "@/lib/store";
import { verifyAdminToken } from "@/lib/internal-auth";
import { env } from "@/lib/env";
import {
  getRoomSessionTokenFromRequest,
  getAdminSessionTokenFromRequest,
  verifyAdminSession,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  clearRoomSessionCookie,
  roomSessionCookieOptions,
  COOKIE_ROOM_SESSION,
  adminFailKey,
} from "@/lib/session";
import { z } from "zod";

function getRedis(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL ?? "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
  });
}

// ─── GET — current guest session info ────────────────────────────────────────
export async function GET(req: NextRequest) {
  const token = getRoomSessionTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ session: null });
  }

  const store = getStore();
  const session = await store.getRoomSessionByToken(token);
  if (!session) {
    const res = NextResponse.json({ session: null });
    clearRoomSessionCookie(res);
    return res;
  }

  // Check expiry / termination
  if (session.terminatedAt || new Date(session.checkOut) < new Date()) {
    const res = NextResponse.json({ session: null, expired: true });
    clearRoomSessionCookie(res);
    return res;
  }

  return NextResponse.json({
    session: {
      roomType:  session.roomType,
      guestName: session.guestName,
      checkIn:   session.checkIn,
      checkOut:  session.checkOut,
    }
  });
}

// ─── DELETE — log out ─────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  clearRoomSessionCookie(res);
  clearAdminSessionCookie(res);
  return res;
}

// ─── PATCH — admin: terminate or extend a session ────────────────────────────
const PatchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("terminate"), token: z.string().uuid() }),
  z.object({ action: z.literal("extend"), token: z.string().uuid(), newCheckOut: z.string().datetime() }),
]);

export async function PATCH(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request", issues: parsed.error.issues }, { status: 400 });
  }

  const store = getStore();

  if (parsed.data.action === "terminate") {
    await store.terminateRoomSession(parsed.data.token);
    return NextResponse.json({ ok: true, action: "terminated" });
  }

  if (parsed.data.action === "extend") {
    const session = await store.extendRoomSession(parsed.data.token, parsed.data.newCheckOut);
    return NextResponse.json({ ok: true, action: "extended", session });
  }
}

// ─── POST /api/auth/session/admin — Admin PIN login ──────────────────────────
// Note: this route is at /api/auth/session not /api/auth/session/admin
// because Next.js App Router doesn't support sub-routes in a single route file.
// Admin login is triggered by ?action=admin-login query param.
export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");

  // ── Admin PIN Login ────────────────────────────────────────────────────────
  if (action === "admin-login") {
    // @ts-ignore – ip is populated by Vercel Edge
    const ip = req.ip ?? req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const redis = getRedis();
    const failKey = adminFailKey(ip);

    // Brute-force check: block after 5 failures × 15 min
    const fails = await redis.get(failKey);
    if (Number(fails) >= 5) {
      return NextResponse.json({ error: "Too many attempts. Thử lại sau 15 phút." }, { status: 429 });
    }

    const { pin } = await req.json();
    const expected = env.adminPin;

    if (!expected || pin !== expected) {
      await redis.incr(failKey);
      await redis.expire(failKey, 60 * 15); // 15 min window
      return NextResponse.json({ error: "PIN không đúng" }, { status: 401 });
    }

    // Success — clear fail counter, set admin session cookie
    await redis.del(failKey);
    const res = NextResponse.json({ ok: true });
    setAdminSessionCookie(res);
    return res;
  }

  // ── In-app browser: manual cookie set from URL token ──────────────────────
  if (action === "set-session") {
    const { token, checkOut } = await req.json();
    if (!token || !checkOut) {
      return NextResponse.json({ error: "Missing token or checkOut" }, { status: 400 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_ROOM_SESSION, token, roomSessionCookieOptions(checkOut));
    return res;
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
