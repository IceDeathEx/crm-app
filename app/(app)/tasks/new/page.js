import { db } from "@/lib/db";
import { TaskForm } from "@/components/tasks/TaskForm";

export default async function NewTaskPage({ searchParams }) {
  const { contactId, dealId } = await searchParams;
  const users = await db.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">New task</h1>
      <div className="max-w-lg">
        <TaskForm
          users={users}
          contactId={contactId}
          dealId={dealId}
          redirectPath="/tasks"
        />
      </div>
    </div>
  );
}
