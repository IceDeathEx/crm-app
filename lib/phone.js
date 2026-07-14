export function isValidE164(phone) {
  return typeof phone === "string" && /^\+[1-9]\d{7,14}$/.test(phone);
}
