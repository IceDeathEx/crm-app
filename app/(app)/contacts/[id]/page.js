import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { StageBadge } from "@/components/deals/StageBadge";
import { NoteForm } from "@/components/notes/NoteForm";
import { NoteList } from "@/components/notes/NoteList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskTable } from "@/components/tasks/TaskTable";
import { deleteContact } from "@/app/(app)/contacts/actions";
import { formatMoney } from "@/lib/format";

export default async function ContactDetailPage({ params, searchParams }) {
  const { id } = await params;
  const { error } = await searchParams;

  const [contact, notes, tasks, users] = await Promise.all([
    db.contact.findUnique({
      where: { id },
      include: { deals: { orderBy: { createdAt: "desc" } } },
    }),
    db.note.findMany({
      where: { contactId: id },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    }),
    db.task.findMany({
      where: { contactId: id },
      include: { assignee: true },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    }),
    db.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!contact) notFound();

  return (
    <div className="flex flex-col gap-8">
      {error === "has-deals" && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Can&apos;t delete this contact while it has deals. Delete or reassign the
          deals first.
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            {contact.firstName} {contact.lastName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {contact.jobTitle ? `${contact.jobTitle} · ` : ""}
            {contact.company ?? "No company"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button href={`/contacts/${contact.id}/edit`} variant="secondary">
            Edit
          </Button>
          <form action={deleteContact.bind(null, contact.id)}>
            <Button type="submit" variant="danger">
              Delete
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-200 bg-white p-4 text-sm">
        <div>
          <p className="text-zinc-500">Email</p>
          <p className="font-medium text-zinc-900">{contact.email ?? "—"}</p>
        </div>
        <div>
          <p className="text-zinc-500">Phone</p>
          <p className="font-medium text-zinc-900">{contact.phone ?? "—"}</p>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Deals</h2>
          <Button href={`/deals/new?contactId=${contact.id}`} variant="secondary">
            New deal
          </Button>
        </div>
        {contact.deals.length === 0 ? (
          <p className="text-sm text-zinc-500">No deals yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {contact.deals.map((deal) => (
              <li
                key={deal.id}
                className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2"
              >
                <Link href={`/deals/${deal.id}`} className="font-medium hover:underline">
                  {deal.title}
                </Link>
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <span>{formatMoney(deal.valueCents)}</span>
                  <StageBadge stage={deal.stage} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">Tasks</h2>
        <TaskTable tasks={tasks} redirectPath={`/contacts/${contact.id}`} />
        <TaskForm
          users={users}
          contactId={contact.id}
          redirectPath={`/contacts/${contact.id}`}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">Notes</h2>
        <NoteForm contactId={contact.id} />
        <NoteList notes={notes} redirectPath={`/contacts/${contact.id}`} />
      </section>
    </div>
  );
}
