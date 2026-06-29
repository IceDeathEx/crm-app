import { deleteNote } from "@/app/(app)/notes/actions";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/Button";

export function NoteList({ notes, redirectPath }) {
  if (notes.length === 0) {
    return <p className="text-sm text-zinc-500">No notes yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {notes.map((note) => (
        <li
          key={note.id}
          className="rounded-md border border-zinc-200 bg-white p-3"
        >
          <p className="whitespace-pre-wrap text-sm text-zinc-800">
            {note.body}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
            <span>
              {note.author.name ?? note.author.email} ·{" "}
              {formatDateTime(note.createdAt)}
            </span>
            <form action={deleteNote.bind(null, note.id, redirectPath)}>
              <Button type="submit" variant="secondary" className="px-2 py-1 text-xs">
                Delete
              </Button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
