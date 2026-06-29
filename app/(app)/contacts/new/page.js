import { ContactForm } from "@/components/contacts/ContactForm";
import { createContact } from "@/app/(app)/contacts/actions";

export default function NewContactPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">New contact</h1>
      <ContactForm action={createContact} submitLabel="Create contact" />
    </div>
  );
}
