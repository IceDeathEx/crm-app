import { cache } from "react";
import { redirect } from "next/navigation";

import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";
import { ValidationError } from "@/lib/validation";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function getOrCreateUser(session) {
  const { sub, email, name } = session.user;

  const existing = await db.user.findUnique({ where: { auth0Sub: sub } });
  if (existing) return existing;

  const userCount = await db.user.count();

  return db.user.create({
    data: {
      auth0Sub: sub,
      email,
      name,
      role: userCount === 0 ? "ADMIN" : "MEMBER",
    },
  });
}

// --- Server Components / pages: redirect on failure ---

// Memoized per-request so repeated calls during a single render don't hit the DB multiple times.
export const requireUser = cache(async () => {
  const session = await auth0.getSession();
  if (!session) {
    redirect("/auth/login");
  }
  return getOrCreateUser(session);
});

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

// --- API route handlers: throw HttpError, caught by handleApiError ---

export async function requireApiUser() {
  const session = await auth0.getSession();
  if (!session) {
    throw new HttpError(401, "Unauthorized");
  }
  return getOrCreateUser(session);
}

export async function requireApiAdmin() {
  const user = await requireApiUser();
  if (user.role !== "ADMIN") {
    throw new HttpError(403, "Forbidden");
  }
  return user;
}

export function handleApiError(error) {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ValidationError) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  if (error.code === "P2003") {
    return Response.json(
      { error: "This record is referenced by other records and can't be deleted" },
      { status: 409 },
    );
  }
  if (error.code === "P2025") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  console.error(error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
