import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env.js";
import { BCRYPT_ROUNDS, TOKEN_BYTES } from "../config/constants.js";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(bytes: number = TOKEN_BYTES): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function generateNumericCode(length: number = 6): string {
  const bytes = crypto.randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += (bytes[i] % 10).toString();
  }
  return code;
}

export function generateTokenId(): string {
  return crypto.randomUUID();
}

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  iss?: string;
  type?: string;
  [key: string]: unknown;
}

export function signAccessToken(userId: string, extraPayload: Record<string, unknown> = {}): string {
  return jwt.sign(
    { sub: userId, type: "access", ...extraPayload },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      issuer: env.JWT_ISSUER,
    }
  );
}

export function signRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: "refresh", tokenId: generateTokenId() },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      issuer: env.JWT_ISSUER,
    }
  );
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: env.JWT_ISSUER,
    }) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function verifyApiToken(token: string): { userId: string; tokenId: string } | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (decoded.type !== "api_token") return null;
    return { userId: decoded.sub, tokenId: decoded.tokenId as string };
  } catch {
    return null;
  }
}

export function signApiToken(userId: string, tokenId: string): string {
  return jwt.sign(
    { sub: userId, type: "api_token", tokenId },
    env.JWT_SECRET,
    { expiresIn: "365d" }
  );
}

export function generateSessionToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function signWebhookPayload(payload: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

export function generateFingerprint(key: string): string {
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  const pairs: string[] = [];
  for (let i = 0; i < 16 && i * 2 < hash.length; i++) {
    pairs.push(hash.substring(i * 2, i * 2 + 2));
  }
  return `SHA256:${pairs.join(":")}`;
}

export function encrypt(text: string, key?: string): string {
  const encryptionKey = key || env.ENCRYPTION_KEY || env.JWT_SECRET;
  const keyBuffer = crypto.createHash("sha256").update(encryptionKey).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string, key?: string): string {
  const encryptionKey = key || env.ENCRYPTION_KEY || env.JWT_SECRET;
  const keyBuffer = crypto.createHash("sha256").update(encryptionKey).digest();
  const [ivHex, authTagHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuffer, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}
