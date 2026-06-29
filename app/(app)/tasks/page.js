import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { TaskTable } from "@/components/tasks/TaskTable";
import { Button } from "@/components/ui/Button";

export default async function TasksPage({ searchParams }) {
  const { view = "mine", status = "open" } = await searchParams;
  const user = await requireUser();

  const tasks = await db.task.findMany({
    where: {
      ...(view === "mine" ? { assigneeId: user.id } : {}),
      ...(status === "open" ? { status: "OPEN" } : {}),
    },
    include: { assignee: true, contact: true, deal: true },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  const tab = (label, key, value, current) => (
    <Link
      href={`/tasks?${new URLSearchParams({
        view: key === "view" ? value : view,
        status: key === "status" ? value : status,
      })}`}
      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
        current === value
          ? "bg-zinc-900 text-white"
          : "text-zinc-600 hover:bg-zinc-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Tasks</h1>
        <Button href="/tasks/new">New task</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tab("My tasks", "view", "mine", view)}
        {tab("All tasks", "view", "all", view)}
        <span className="mx-1 text-zinc-300">|</span>
        {tab("Open", "status", "open", status)}
        {tab("All statuses", "status", "all", status)}
      </div>

      <TaskTable tasks={tasks} redirectPath="/tasks" showRelated />
    </div>
  );
}
