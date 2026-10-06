import "server-only";
import { scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession } from "./session";

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

/**
 * Password hash format (produced by `npm run hash-password`):  scrypt:<salt>:<hash>  (base64url)
 * Uses ":" not "$" because Next.js expands "$VAR" inside .env files.
 */
async function verifyPassword(password: string, stored: string) {
  const [algo, saltB64, hashB64] = stored.split(":");
  if (algo !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64url");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64url"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// ── Simple in-memory brute-force protection (per server instance) ─────────────
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

async function clientKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

export async function login(email: string, password: string) {
  const key = await clientKey();
  const now = Date.now();
  const rec = attempts.get(key);
  if (rec && rec.count >= MAX_ATTEMPTS && rec.until > now) {
    return { ok: false as const, error: "Too many attempts. Try again in 15 minutes." };
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!adminEmail || !adminHash) {
    return { ok: false as const, error: "Admin account is not configured (ADMIN_EMAIL / ADMIN_PASSWORD_HASH)." };
  }

  // Always run the hash check so response time doesn't reveal whether the email matched.
  const passOk = await verifyPassword(password, adminHash);
  if (!passOk || email !== adminEmail) {
    const next = rec && rec.until > now ? rec.count + 1 : 1;
    attempts.set(key, { count: next, until: now + WINDOW_MS });
    return { ok: false as const, error: "Invalid email or password." };
  }

  attempts.delete(key);
  const token = await signSession(adminEmail);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return { ok: true as const };
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Use at the top of every admin page, server action and admin API route. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** For API routes: returns null instead of redirecting. */
export async function isAdmin() {
  return (await getSession()) !== null;
}
