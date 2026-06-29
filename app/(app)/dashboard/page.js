import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DEAL_STAGES } from "@/lib/format";
import { StageBadge } from "@/components/deals/StageBadge";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { TaskStatusChart } from "@/components/dashboard/TaskStatusChart";
import { formatDate, formatMoney } from "@/lib/format";

const ACCENT_TEXT = {
  indigo: "text-indigo-600",
  fuchsia: "text-fuchsia-600",
  emerald: "text-emerald-600",
  amber: "text-amber-600",
};

const ACCENT_GRADIENT = {
  indigo: "from-indigo-500 to-violet-500",
  fuchsia: "from-fuchsia-500 to-pink-500",
  emerald: "from-emerald-500 to-teal-500",
  amber: "from-amber-500 to-orange-500",
};

function StatCard({ label, value, accent = "indigo" }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className={`h-1.5 w-full bg-gradient-to-r ${ACCENT_GRADIENT[accent]}`} />
      <div className="p-4">
        <p className="text-sm text-zinc-500">{label}</p>
        <p className={`mt-1 text-2xl font-semibold ${ACCENT_TEXT[accent]}`}>{value}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [
    contactCount,
    openDeals,
    myOpenTasks,
    recentDeals,
    dealsByStage,
    openTaskCount,
    doneTaskCount,
  ] = await Promise.all([
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
    db.deal.groupBy({ by: ["stage"], _sum: { valueCents: true } }),
    db.task.count({ where: { status: "OPEN" } }),
    db.task.count({ where: { status: "DONE" } }),
  ]);

  const pipelineValueCents = openDeals.reduce((sum, d) => sum + d.valueCents, 0);

  const stageTotals = DEAL_STAGES.map((stage) => ({
    stage,
    valueCents: dealsByStage.find((row) => row.stage === stage)?._sum.valueCents ?? 0,
  }));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold text-zinc-900">
        Welcome, {user.name ?? user.email}
      </h1>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Contacts" value={contactCount} accent="indigo" />
        <StatCard label="Open deals" value={openDeals.length} accent="fuchsia" />
        <StatCard
          label="Pipeline value"
          value={formatMoney(pipelineValueCents)}
          accent="emerald"
        />
        <StatCard label="My open tasks" value={myOpenTasks.length} accent="amber" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <section className="col-span-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Pipeline by stage</h2>
          <PipelineChart data={stageTotals} />
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Task completion</h2>
          <TaskStatusChart open={openTaskCount} done={doneTaskCount} />
          <div className="mt-2 flex justify-center gap-4 text-xs text-zinc-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Open ({openTaskCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Done ({doneTaskCount})
            </span>
          </div>
        </section>
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
