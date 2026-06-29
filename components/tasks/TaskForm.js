import { createTask } from "@/app/(app)/tasks/actions";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

function toDateInputValue(date) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function TaskForm({
  action = createTask,
  task,
  users,
  contactId,
  dealId,
  redirectPath,
  submitLabel = "Add task",
}) {
  return (
    <form action={action} className="flex flex-col gap-3">
      {contactId && <input type="hidden" name="contactId" value={contactId} />}
      {dealId && <input type="hidden" name="dealId" value={dealId} />}
      {redirectPath && (
        <input type="hidden" name="redirectPath" value={redirectPath} />
      )}
      <Input name="title" label="Title" defaultValue={task?.title} required />
      <Textarea
        name="description"
        label="Description"
        rows={2}
        defaultValue={task?.description ?? ""}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          name="dueDate"
          label="Due date"
          type="date"
          defaultValue={toDateInputValue(task?.dueDate)}
        />
        <Select
          name="assigneeId"
          label="Assignee"
          defaultValue={task?.assigneeId}
          required
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name ?? u.email}
            </option>
          ))}
        </Select>
      </div>
      {task && (
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            name="status"
            value="DONE"
            defaultChecked={task.status === "DONE"}
            className="h-4 w-4 rounded border-zinc-300"
          />
          Done
        </label>
      )}
      <div>
        <Button type="submit" variant="secondary">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
