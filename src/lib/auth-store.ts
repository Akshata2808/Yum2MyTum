// Browser-only mock auth. Users live in localStorage; OTPs are simulated and shown in a toast.
export type AuthUser = { email: string; name: string };
type StoredUser = AuthUser & { passwordHash: string; verified: boolean; createdAt: number };
export type OtpPurpose = "signup" | "reset";
type OtpRecord = { code: string; email: string; purpose: OtpPurpose; expiresAt: number; sentAt: number; attempts: number };

const USERS_KEY = "yum2mytum.users.v1";
const SESSION_KEY = "yum2mytum.session.v1";
const OTP_KEY = "yum2mytum.otp.v1";
// Fixed demo code; nothing is emailed.
export const DEMO_OTP = "678909";
export const OTP_TTL_MS = 5 * 60_000;
export const RESEND_COOLDOWN_MS = 30_000;
export const MAX_OTP_ATTEMPTS = 5;

export class AuthError extends Error {}

export const normalizeEmail = (e: string) => e.trim().toLowerCase();
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(e: string) {
  if (!e.trim()) return "Email is required";
  if (!EMAIL_RE.test(e.trim())) return "Enter a valid email address";
  return null;
}
export function validatePassword(p: string) {
  if (!p) return "Password is required";
  if (p.length < 8) return "Use at least 8 characters";
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) return "Include at least one letter and one number";
  return null;
}
export function validateName(n: string) {
  if (!n.trim()) return "Name is required";
  if (n.trim().length < 2) return "Name is too short";
  return null;
}

async function hash(pw: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("y2mt:" + pw));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

const read = <T,>(s: Storage, k: string, fallback: T): T => {
  try {
    const raw = s.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const users = () => read<Record<string, StoredUser>>(localStorage, USERS_KEY, {});
const saveUsers = (u: Record<string, StoredUser>) => localStorage.setItem(USERS_KEY, JSON.stringify(u));
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

export function getSessionUser(): AuthUser | null {
  const email = read<{ email: string } | null>(localStorage, SESSION_KEY, null)?.email ??
    read<{ email: string } | null>(sessionStorage, SESSION_KEY, null)?.email;
  if (!email) return null;
  const u = users()[email];
  return u && u.verified ? { email: u.email, name: u.name } : null;
}

function startSession(email: string, remember: boolean) {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify({ email, at: Date.now() }));
}
export function endSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export async function signUp(name: string, email: string, password: string) {
  await delay();
  const e = normalizeEmail(email);
  const err = validateName(name) ?? validateEmail(e) ?? validatePassword(password);
  if (err) throw new AuthError(err);
  const all = users();
  if (all[e]?.verified) throw new AuthError("An account with this email already exists. Sign in instead.");
  all[e] = { email: e, name: name.trim(), passwordHash: await hash(password), verified: false, createdAt: Date.now() };
  saveUsers(all);
  return issueOtp(e, "signup", true);
}

/** Returns "ok" when signed in, or "unverified" when an OTP was sent to finish signup. */
export async function signIn(email: string, password: string, remember: boolean) {
  await delay();
  const e = normalizeEmail(email);
  const err = validateEmail(e) ?? (password ? null : "Password is required");
  if (err) throw new AuthError(err);
  const u = users()[e];
  if (!u || u.passwordHash !== (await hash(password))) throw new AuthError("Incorrect email or password");
  if (!u.verified) {
    issueOtp(e, "signup", true);
    return "unverified" as const;
  }
  startSession(e, remember);
  return "ok" as const;
}

export async function requestReset(email: string) {
  await delay();
  const e = normalizeEmail(email);
  const err = validateEmail(e);
  if (err) throw new AuthError(err);
  if (!users()[e]) throw new AuthError("No account found with this email");
  return issueOtp(e, "reset", true);
}

export function otpStatus() {
  return read<OtpRecord | null>(sessionStorage, OTP_KEY, null);
}

/** Issues a simulated OTP. Returns the code so the UI can display it (demo only). */
export function issueOtp(email: string, purpose: OtpPurpose, force = false) {
  const existing = otpStatus();
  if (!force && existing && existing.email === email && Date.now() - existing.sentAt < RESEND_COOLDOWN_MS) {
    throw new AuthError("Please wait before requesting another code");
  }
  const code = DEMO_OTP;
  const rec: OtpRecord = { code, email, purpose, sentAt: Date.now(), expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 };
  sessionStorage.setItem(OTP_KEY, JSON.stringify(rec));
  return code;
}

export async function verifyOtp(email: string, purpose: OtpPurpose, code: string) {
  await delay(500);
  const e = normalizeEmail(email);
  if (!/^\d{6}$/.test(code)) throw new AuthError("Enter the 6-digit code");
  const rec = otpStatus();
  if (!rec || rec.email !== e || rec.purpose !== purpose) throw new AuthError("No code requested. Tap Resend.");
  if (Date.now() > rec.expiresAt) throw new AuthError("This code has expired. Tap Resend.");
  if (rec.attempts >= MAX_OTP_ATTEMPTS) throw new AuthError("Too many attempts. Tap Resend for a new code.");
  if (rec.code !== code) {
    sessionStorage.setItem(OTP_KEY, JSON.stringify({ ...rec, attempts: rec.attempts + 1 }));
    throw new AuthError(`Incorrect code. ${MAX_OTP_ATTEMPTS - rec.attempts - 1} attempts left.`);
  }
  sessionStorage.removeItem(OTP_KEY);
  if (purpose === "signup") {
    const all = users();
    if (!all[e]) throw new AuthError("Account not found");
    all[e].verified = true;
    saveUsers(all);
    startSession(e, true);
  }
  return true;
}

/** Only allowed right after a successful reset OTP; the caller enforces that step order. */
export async function setNewPassword(email: string, password: string) {
  await delay();
  const err = validatePassword(password);
  if (err) throw new AuthError(err);
  const e = normalizeEmail(email);
  const all = users();
  if (!all[e]) throw new AuthError("Account not found");
  all[e].passwordHash = await hash(password);
  all[e].verified = true;
  saveUsers(all);
}
