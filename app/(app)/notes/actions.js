"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireString, ValidationError } from "@/lib/validation";

export async function createNote(formData) {
  const user = await requireUser();

  const contactId = formData.get("contactId") || null;
  const dealId = formData.get("dealId") || null;
  if (!contactId && !dealId) {
    throw new ValidationError("A note must be linked to a contact or deal");
  }

  const body = requireString(formData.get("body"), "Note");

  await db.note.create({
    data: { body, authorId: user.id, contactId, dealId },
  });

  if (contactId) revalidatePath(`/contacts/${contactId}`);
  if (dealId) revalidatePath(`/deals/${dealId}`);
}

export async function deleteNote(noteId, redirectPath) {
  await requireUser();
  await db.note.delete({ where: { id: noteId } });
  revalidatePath(redirectPath);
}
