import { db } from "@/lib/db";
import { requireApiUser, handleApiError } from "@/lib/auth";
import { requireString, ValidationError } from "@/lib/validation";

export async function POST(request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();

    if (!body.contactId && !body.dealId) {
      throw new ValidationError("A note must be linked to a contact or deal");
    }

    const note = await db.note.create({
      data: {
        body: requireString(body.body, "Note"),
        authorId: user.id,
        contactId: body.contactId || null,
        dealId: body.dealId || null,
      },
    });

    return Response.json(note, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
