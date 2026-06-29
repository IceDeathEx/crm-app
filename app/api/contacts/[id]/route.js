import { db } from "@/lib/db";
import { requireApiUser, handleApiError, HttpError } from "@/lib/auth";
import { requireString, optionalString } from "@/lib/validation";

export async function GET(request, { params }) {
  try {
    await requireApiUser();
    const { id } = await params;

    const contact = await db.contact.findUnique({ where: { id } });
    if (!contact) throw new HttpError(404, "Not found");

    return Response.json(contact);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireApiUser();
    const { id } = await params;
    const body = await request.json();

    const data = {};
    if (body.firstName !== undefined) data.firstName = requireString(body.firstName, "First name");
    if (body.lastName !== undefined) data.lastName = requireString(body.lastName, "Last name");
    if (body.email !== undefined) data.email = optionalString(body.email);
    if (body.phone !== undefined) data.phone = optionalString(body.phone);
    if (body.company !== undefined) data.company = optionalString(body.company);
    if (body.jobTitle !== undefined) data.jobTitle = optionalString(body.jobTitle);

    const contact = await db.contact.update({ where: { id }, data });
    return Response.json(contact);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireApiUser();
    const { id } = await params;

    await db.contact.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
