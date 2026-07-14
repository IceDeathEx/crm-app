import { isValidE164 } from "@/lib/phone";
import { consumeOtp } from "@/lib/otp";
import { signPhoneVerifyToken } from "@/lib/authToken";
import { createSession, handleApiError } from "@/lib/auth";
import { db } from "@/lib/db";
import { ValidationError } from "@/lib/validation";

export async function POST(request) {
  try {
    const { phone, code } = await request.json();
    if (!isValidE164(phone)) {
      throw new ValidationError("Invalid phone number");
    }
    if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
      throw new ValidationError("Enter the 6-digit code");
    }

    await consumeOtp(phone, code);

    const user = await db.user.findUnique({ where: { phone } });
    if (user) {
      await createSession(user.id);
      return Response.json({ status: "logged_in" });
    }

    return Response.json({
      status: "needs_username",
      phoneVerifyToken: signPhoneVerifyToken(phone),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
