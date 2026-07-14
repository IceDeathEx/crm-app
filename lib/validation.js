export class ValidationError extends Error {}

export function requireString(value, fieldName) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) {
    throw new ValidationError(`${fieldName} is required`);
  }
  return trimmed;
}

export function optionalString(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || null;
}

export function requireInt(value, fieldName) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) {
    throw new ValidationError(`${fieldName} must be a number`);
  }
  return n;
}

export function requireIntInRange(value, fieldName, min, max) {
  const n = requireInt(value, fieldName);
  if (n < min || n > max) {
    throw new ValidationError(`${fieldName} must be between ${min} and ${max}`);
  }
  return n;
}

export function optionalInt(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) {
    throw new ValidationError("Must be a number");
  }
  return n;
}

export function optionalFloat(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) {
    throw new ValidationError("Must be a number");
  }
  return n;
}

export function optionalDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new ValidationError("Invalid date");
  }
  return d;
}
