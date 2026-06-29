import { createNote } from "@/app/(app)/notes/actions";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function NoteForm({ contactId, dealId }) {
  return (
    <form action={createNote} className="flex flex-col gap-2">
      {contactId && <input type="hidden" name="contactId" value={contactId} />}
      {dealId && <input type="hidden" name="dealId" value={dealId} />}
      <Textarea name="body" placeholder="Add a note..." rows={3} required />
      <div>
        <Button type="submit" variant="secondary">
          Add note
        </Button>
      </div>
    </form>
  );
}
