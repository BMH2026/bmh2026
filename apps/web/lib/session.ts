/**
 * lib/session.ts — Room Session & Admin Session helpers
 *
 * Guest session: stateful UUID token stored in Postgres room_sessions,
 *   value stored in httpOnly room_session cookie.
 * Admin session: stateless HMAC token (no DB), httpOnly admin_session cookie.
 * QR token: ephemeral Redis key, 5-min TTL, single-use.
 * Magic link token: ephemeral Redis key, 24h TTL, single-use.
 */

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { env } from "./env";

// ─── Cookie names ──────────────────────────────────────────────────────────────
export const COOKIE_ROOM_SESSION  = "room_session";
export const COOKIE_ADMIN_SESSION = "admin_session";

// ─── Cookie options ────────────────────────────────────────────────────────────
const IS_PROD = process.env.NODE_ENV === "production";

export function roomSessionCookieOptions(checkOutIso: string) {
  const expires = new Date(checkOutIso);
  return {
    httpOnly: true,
    secure:   IS_PROD,
    sameSite: "lax" as const,
    path:     "/",
    expires,
  };
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure:   IS_PROD,
    sameSite: "lax" as const,
    path:     "/",
    maxAge:   60 * 60 * 8, // 8 hours
  };
}

// ─── Admin session HMAC (stateless) ──────────────────────────────────────────
// Format: <timestamp>.<hmac>  — timestamp in ms
export function signAdminSession(timestamp: number): string {
  const payload = String(timestamp);
  const mac = createHmac("sha256", env.adminSessionSecret).update(payload).digest("hex");
  return `${payload}.${mac}`;
}

export function verifyAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [ts, mac] = parts;
  const expected = createHmac("sha256", env.adminSessionSecret).update(ts).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(mac), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ─── Read cookies from Server Component (next/headers) ───────────────────────
export async function getRoomSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_ROOM_SESSION)?.value;
}

export async function getAdminSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_ADMIN_SESSION)?.value;
}

// ─── Read cookies from Edge Middleware (NextRequest) ─────────────────────────
export function getRoomSessionTokenFromRequest(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_ROOM_SESSION)?.value;
}

export function getAdminSessionTokenFromRequest(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_ADMIN_SESSION)?.value;
}

// ─── Set cookie on NextResponse (used in API route handlers) ─────────────────
export function setRoomSessionCookie(res: NextResponse, token: string, checkOutIso: string): void {
  const opts = roomSessionCookieOptions(checkOutIso);
  res.cookies.set(COOKIE_ROOM_SESSION, token, opts);
}

export function clearRoomSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_ROOM_SESSION, "", { httpOnly: true, secure: IS_PROD, sameSite: "lax", path: "/", maxAge: 0 });
}

export function setAdminSessionCookie(res: NextResponse): void {
  const token = signAdminSession(Date.now());
  res.cookies.set(COOKIE_ADMIN_SESSION, token, adminSessionCookieOptions());
}

export function clearAdminSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_ADMIN_SESSION, "", { httpOnly: true, secure: IS_PROD, sameSite: "lax", path: "/", maxAge: 0 });
}

// ─── Redis key helpers ────────────────────────────────────────────────────────
export const REDIS_QR_PREFIX = "bmh:qr:";
export const REDIS_ML_PREFIX = "bmh:ml:";
export const REDIS_ADMIN_FAIL_PREFIX = "bmh:adminfail:";

export function qrRedisKey(token: string)   { return `${REDIS_QR_PREFIX}${token}`; }
export function mlRedisKey(token: string)    { return `${REDIS_ML_PREFIX}${token}`; }
export function adminFailKey(ip: string)     { return `${REDIS_ADMIN_FAIL_PREFIX}${ip}`; }

// ─── In-app browser detection (for Magic Link UX warning) ────────────────────
export function isInAppBrowser(userAgent: string): boolean {
  return /FBAN|FBAV|Instagram|Line|Zalo|MicroMessenger|LinkedInApp/.test(userAgent);
}
