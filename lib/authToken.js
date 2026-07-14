import crypto from "crypto";

const TOKEN_TTL_MS = 10 * 60 * 1000;

function getSecret() {
  const secret = process.env.PHONE_VERIFY_SECRET;
  if (!secret) {
    throw new Error("PHONE_VERIFY_SECRET is not set");
  }
  return secret;
}

export function signPhoneVerifyToken(phone) {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${phone}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export function verifyPhoneVerifyToken(token, expectedPhone) {
  let decoded;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return false;
  }

  const parts = decoded.split(":");
  if (parts.length !== 3) return false;
  const [phone, expiresAtRaw, signature] = parts;

  const payload = `${phone}:${expiresAtRaw}`;
  const expectedSignature = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  const signaturesMatch =
    signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

  if (!signaturesMatch) return false;
  if (phone !== expectedPhone) return false;
  if (Date.now() > Number(expiresAtRaw)) return false;

  return true;
}
