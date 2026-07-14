// WhatsApp OTP delivery is mocked for now: no WhatsApp Business API account is
// wired up yet. The code is logged server-side, and echoed back to the caller
// outside of production so local/dev testing works without real delivery.
// Swap the body of this function for a real provider (e.g. Twilio WhatsApp
// API) later — the signature is deliberately provider-shaped already.
export async function sendOtpSms(phone, code) {
  console.log(`[OTP mock] WhatsApp message to ${phone}: your SGMakanHealthy code is ${code}`);
  return { devCode: process.env.NODE_ENV !== "production" ? code : undefined };
}
