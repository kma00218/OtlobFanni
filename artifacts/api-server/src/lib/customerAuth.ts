import crypto from "crypto";

// Simple customer-account auth: Username + 6-digit PIN, no OTP/WhatsApp API.
// PINs are hashed with scrypt (Node built-in, no extra dependency).
// Session tokens are self-verifying HMAC tags signed with SESSION_SECRET
// (already-provisioned secret), so no server-side session store is needed.

const SECRET = process.env.SESSION_SECRET || "";

export function hashPin(pin: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pin, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPin(pin: string, stored: string): boolean {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(pin, salt, 64).toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(check, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function signCustomerToken(accountId: string): string {
  if (!SECRET) throw new Error("SESSION_SECRET is not configured");
  const sig = crypto.createHmac("sha256", SECRET).update(accountId).digest("base64url");
  return `${accountId}.${sig}`;
}

export function verifyCustomerToken(token: string | undefined | null): string | null {
  if (!token || !SECRET) return null;
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return null;
  const accountId = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto.createHmac("sha256", SECRET).update(accountId).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return accountId;
}
