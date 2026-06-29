import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { StageSelect } from "@/components/deals/StageSelect";
import { NoteForm } from "@/components/notes/NoteForm";
import { NoteList } from "@/components/notes/NoteList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskTable } from "@/components/tasks/TaskTable";
import { deleteDeal } from "@/app/(app)/deals/actions";
import { formatMoney } from "@/lib/format";

export default async function DealDetailPage({ params }) {
  const { id } = await params;

  const [deal, notes, tasks, users] = await Promise.all([
    db.deal.findUnique({ where: { id }, include: { contact: true, owner: true } }),
    db.note.findMany({
      where: { dealId: id },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    }),
    db.task.findMany({
      where: { dealId: id },
      include: { assignee: true },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    }),
    db.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!deal) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{deal.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Contact:{" "}
            <Link href={`/contacts/${deal.contact.id}`} className="hover:underline">
              {deal.contact.firstName} {deal.contact.lastName}
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <Button href={`/deals/${deal.id}/edit`} variant="secondary">
            Edit
          </Button>
          <form action={deleteDeal.bind(null, deal.id)}>
            <Button type="submit" variant="danger">
              Delete
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 rounded-lg border border-zinc-200 bg-white p-4 text-sm">
        <div>
          <p className="text-zinc-500">Value</p>
          <p className="font-medium text-zinc-900">{formatMoney(deal.valueCents)}</p>
        </div>
        <div>
          <p className="text-zinc-500">Stage</p>
          <StageSelect dealId={deal.id} stage={deal.stage} />
        </div>
        <div>
          <p className="text-zinc-500">Owner</p>
          <p className="font-medium text-zinc-900">{deal.owner.name ?? deal.owner.email}</p>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">Tasks</h2>
        <TaskTable tasks={tasks} redirectPath={`/deals/${deal.id}`} />
        <TaskForm users={users} dealId={deal.id} redirectPath={`/deals/${deal.id}`} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">Notes</h2>
        <NoteForm dealId={deal.id} />
        <NoteList notes={notes} redirectPath={`/deals/${deal.id}`} />
      </section>
    </div>
  );
}
