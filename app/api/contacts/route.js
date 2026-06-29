import { db } from "@/lib/db";
import { requireApiUser, handleApiError } from "@/lib/auth";
import { requireString, optionalString } from "@/lib/validation";

export async function GET(request) {
  try {
    await requireApiUser();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    const contacts = await db.contact.findMany({
      where: q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { company: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    return Response.json(contacts);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();

    const contact = await db.contact.create({
      data: {
        firstName: requireString(body.firstName, "First name"),
        lastName: requireString(body.lastName, "Last name"),
        email: optionalString(body.email),
        phone: optionalString(body.phone),
        company: optionalString(body.company),
        jobTitle: optionalString(body.jobTitle),
        createdById: user.id,
      },
    });

    return Response.json(contact, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
