"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireString, optionalString } from "@/lib/validation";

function contactFields(formData) {
  return {
    firstName: requireString(formData.get("firstName"), "First name"),
    lastName: requireString(formData.get("lastName"), "Last name"),
    email: optionalString(formData.get("email")),
    phone: optionalString(formData.get("phone")),
    company: optionalString(formData.get("company")),
    jobTitle: optionalString(formData.get("jobTitle")),
  };
}

export async function createContact(formData) {
  const user = await requireUser();
  const data = contactFields(formData);

  const contact = await db.contact.create({
    data: { ...data, createdById: user.id },
  });

  redirect(`/contacts/${contact.id}`);
}

export async function updateContact(contactId, formData) {
  await requireUser();
  const data = contactFields(formData);

  await db.contact.update({
    where: { id: contactId },
    data,
  });

  redirect(`/contacts/${contactId}`);
}

export async function deleteContact(contactId) {
  await requireUser();

  try {
    await db.contact.delete({ where: { id: contactId } });
  } catch (error) {
    // P2003: foreign key constraint failed (Restrict) — contact still has deals.
    if (error.code === "P2003") {
      redirect(`/contacts/${contactId}?error=has-deals`);
    }
    throw error;
  }

  redirect("/contacts");
}
