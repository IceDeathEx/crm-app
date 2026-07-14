import { isValidE164 } from "@/lib/phone";
import { createOtp } from "@/lib/otp";
import { sendOtpSms } from "@/lib/sms";
import { handleApiError } from "@/lib/auth";
import { ValidationError } from "@/lib/validation";

export async function POST(request) {
  try {
    const { phone } = await request.json();
    if (!isValidE164(phone)) {
      throw new ValidationError("Enter a valid phone number in international format, e.g. +6591234567");
    }

    const code = await createOtp(phone);
    const { devCode } = await sendOtpSms(phone, code);

    return Response.json({ ok: true, devCode });
  } catch (error) {
    return handleApiError(error);
  }
}
