import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { TaskForm } from "@/components/tasks/TaskForm";
import { updateTask } from "@/app/(app)/tasks/actions";

export default async function EditTaskPage({ params }) {
  const { id } = await params;
  const [task, users] = await Promise.all([
    db.task.findUnique({ where: { id } }),
    db.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!task) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Edit task</h1>
      <div className="max-w-lg">
        <TaskForm
          action={updateTask.bind(null, task.id)}
          task={task}
          users={users}
          redirectPath="/tasks"
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
