import { isValidE164 } from "@/lib/phone";
import { verifyPhoneVerifyToken } from "@/lib/authToken";
import { createSession, handleApiError, HttpError } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireString, ValidationError } from "@/lib/validation";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(request) {
  try {
    const { phone, username, phoneVerifyToken } = await request.json();

    if (!isValidE164(phone)) {
      throw new ValidationError("Invalid phone number");
    }
    const cleanUsername = requireString(username, "Username");
    if (!USERNAME_PATTERN.test(cleanUsername)) {
      throw new ValidationError(
        "Username must be 3-20 characters, letters/numbers/underscores only",
      );
    }
    if (!phoneVerifyToken || !verifyPhoneVerifyToken(phoneVerifyToken, phone)) {
      throw new HttpError(400, "Phone verification expired. Start over.");
    }

    const userCount = await db.user.count();

    let user;
    try {
      user = await db.user.create({
        data: {
          phone,
          phoneVerifiedAt: new Date(),
          username: cleanUsername,
          role: userCount === 0 ? "ADMIN" : "USER",
        },
      });
    } catch (err) {
      if (err.code === "P2002") {
        const target = err.meta?.target ?? [];
        if (target.includes("username")) {
          throw new ValidationError("That username is already taken");
        }
        // Concurrent requests raced to create the same phone number.
        user = await db.user.findUniqueOrThrow({ where: { phone } });
      } else {
        throw err;
      }
    }

    await createSession(user.id);
    return Response.json({ status: "ok" });
  } catch (error) {
    return handleApiError(error);
  }
}
