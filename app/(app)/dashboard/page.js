import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { StageBadge } from "@/components/deals/StageBadge";
import { formatDate, formatMoney } from "@/lib/format";

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [contactCount, openDeals, myOpenTasks, recentDeals] = await Promise.all([
    db.contact.count(),
    db.deal.findMany({ where: { stage: { notIn: ["WON", "LOST"] } } }),
    db.task.findMany({
      where: { assigneeId: user.id, status: "OPEN" },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    db.deal.findMany({
      include: { contact: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const pipelineValueCents = openDeals.reduce((sum, d) => sum + d.valueCents, 0);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold text-zinc-900">
        Welcome, {user.name ?? user.email}
      </h1>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Contacts" value={contactCount} />
        <StatCard label="Open deals" value={openDeals.length} />
        <StatCard label="Pipeline value" value={formatMoney(pipelineValueCents)} />
        <StatCard label="My open tasks" value={myOpenTasks.length} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Recent deals</h2>
            <Link href="/deals" className="text-sm text-zinc-500 hover:underline">
              View all
            </Link>
          </div>
          <ul className="flex flex-col gap-2">
            {recentDeals.map((deal) => (
              <li
                key={deal.id}
                className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
              >
                <Link href={`/deals/${deal.id}`} className="font-medium hover:underline">
                  {deal.title}
                </Link>
                <div className="flex items-center gap-3 text-zinc-600">
                  <span>{formatMoney(deal.valueCents)}</span>
                  <StageBadge stage={deal.stage} />
                </div>
              </li>
            ))}
            {recentDeals.length === 0 && (
              <p className="text-sm text-zinc-500">No deals yet.</p>
            )}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">My upcoming tasks</h2>
            <Link href="/tasks" className="text-sm text-zinc-500 hover:underline">
              View all
            </Link>
          </div>
          <ul className="flex flex-col gap-2">
            {myOpenTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
              >
                <Link href={`/tasks/${task.id}/edit`} className="font-medium hover:underline">
                  {task.title}
                </Link>
                <span className="text-zinc-600">{formatDate(task.dueDate)}</span>
              </li>
            ))}
            {myOpenTasks.length === 0 && (
              <p className="text-sm text-zinc-500">No open tasks assigned to you.</p>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
