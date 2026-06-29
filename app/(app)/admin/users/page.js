import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Table, Thead, Th, Tbody, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { RoleSelect } from "@/components/admin/RoleSelect";
import { formatDate } from "@/lib/format";

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin();
  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Users</h1>

      <Table>
        <Thead>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>Joined</Th>
          <Th>Role</Th>
        </Thead>
        <Tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-zinc-50">
              <Td>{user.name ?? "—"}</Td>
              <Td>{user.email}</Td>
              <Td>{formatDate(user.createdAt)}</Td>
              <Td>
                {user.id === currentUser.id ? (
                  <Badge color="blue">{user.role} (you)</Badge>
                ) : (
                  <RoleSelect userId={user.id} role={user.role} />
                )}
              </Td>
            </tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}
