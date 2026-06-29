import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { ContactForm } from "@/components/contacts/ContactForm";
import { updateContact } from "@/app/(app)/contacts/actions";

export default async function EditContactPage({ params }) {
  const { id } = await params;
  const contact = await db.contact.findUnique({ where: { id } });

  if (!contact) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Edit contact</h1>
      <ContactForm
        action={updateContact.bind(null, contact.id)}
        contact={contact}
        submitLabel="Save changes"
      />
    </div>
  );
}
