import { db } from "@/lib/db";
import { requireApiUser, handleApiError, HttpError } from "@/lib/auth";
import { requireString } from "@/lib/validation";

async function requireOwnNoteOrAdmin(noteId, user) {
  const note = await db.note.findUnique({ where: { id: noteId } });
  if (!note) throw new HttpError(404, "Not found");
  if (note.authorId !== user.id && user.role !== "ADMIN") {
    throw new HttpError(403, "Forbidden");
  }
  return note;
}

export async function PATCH(request, { params }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    await requireOwnNoteOrAdmin(id, user);

    const body = await request.json();
    const note = await db.note.update({
      where: { id },
      data: { body: requireString(body.body, "Note") },
    });

    return Response.json(note);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    await requireOwnNoteOrAdmin(id, user);

    await db.note.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
