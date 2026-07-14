import crypto from "crypto";

import { db } from "@/lib/db";
import { HttpError } from "@/lib/auth";

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;

export function generateOtpCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashOtpCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function createOtp(phone) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await db.otp.count({
    where: { phone, createdAt: { gte: oneHourAgo } },
  });
  if (recentCount >= MAX_REQUESTS_PER_HOUR) {
    throw new HttpError(429, "Too many codes requested. Try again later.");
  }

  const code = generateOtpCode();
  await db.otp.create({
    data: {
      phone,
      codeHash: hashOtpCode(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  return code;
}

export async function consumeOtp(phone, code) {
  const otp = await db.otp.findFirst({
    where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new HttpError(400, "Code expired or not found. Request a new one.");
  }
  if (otp.attempts >= MAX_VERIFY_ATTEMPTS) {
    throw new HttpError(400, "Too many incorrect attempts. Request a new code.");
  }
  if (otp.codeHash !== hashOtpCode(code)) {
    await db.otp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    throw new HttpError(400, "Incorrect code.");
  }

  await db.otp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
}
