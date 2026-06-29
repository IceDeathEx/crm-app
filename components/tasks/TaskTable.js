import Link from "next/link";

import { Table, Thead, Th, Tbody, Td, EmptyState } from "@/components/ui/Table";
import { TaskStatusToggle } from "@/components/tasks/TaskStatusToggle";
import { deleteTask } from "@/app/(app)/tasks/actions";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";

export function TaskTable({ tasks, redirectPath, showRelated = false }) {
  if (tasks.length === 0) {
    return (
      <Table>
        <Tbody>
          <tr>
            <Td>
              <EmptyState>No tasks.</EmptyState>
            </Td>
          </tr>
        </Tbody>
      </Table>
    );
  }

  return (
    <Table>
      <Thead>
        <Th>Done</Th>
        <Th>Title</Th>
        <Th>Assignee</Th>
        <Th>Due</Th>
        {showRelated && <Th>Related to</Th>}
        <Th></Th>
      </Thead>
      <Tbody>
        {tasks.map((task) => (
          <tr key={task.id} className="hover:bg-zinc-50">
            <Td>
              <TaskStatusToggle taskId={task.id} status={task.status} />
            </Td>
            <Td className={task.status === "DONE" ? "text-zinc-400 line-through" : ""}>
              {task.title}
            </Td>
            <Td>{task.assignee.name ?? task.assignee.email}</Td>
            <Td>{formatDate(task.dueDate)}</Td>
            {showRelated && (
              <Td>
                {task.contact && (
                  <Link
                    href={`/contacts/${task.contact.id}`}
                    className="hover:underline"
                  >
                    {task.contact.firstName} {task.contact.lastName}
                  </Link>
                )}
                {task.deal && (
                  <Link href={`/deals/${task.deal.id}`} className="hover:underline">
                    {task.deal.title}
                  </Link>
                )}
              </Td>
            )}
            <Td>
              <div className="flex items-center gap-2">
                <Button
                  href={`/tasks/${task.id}/edit`}
                  variant="secondary"
                  className="px-2 py-1 text-xs"
                >
                  Edit
                </Button>
                <form action={deleteTask.bind(null, task.id, redirectPath)}>
                  <Button type="submit" variant="secondary" className="px-2 py-1 text-xs">
                    Delete
                  </Button>
                </form>
              </div>
            </Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  );
}
