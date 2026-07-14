import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Table, Thead, Th, Tbody, Td } from "@/components/ui/Table";

export default async function AdminDishesPage() {
  await requireAdmin();
  const dishes = await db.dish.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Manage dish info</h1>
      <p className="text-sm text-zinc-600">
        The 8 dishes are fixed -- edit their description and nutrition reference values here.
      </p>
      <Table>
        <Thead>
          <Th>Dish</Th>
          <Th />
        </Thead>
        <Tbody>
          {dishes.map((dish) => (
            <tr key={dish.id} className="hover:bg-zinc-50">
              <Td>{dish.name}</Td>
              <Td>
                <Link href={`/admin/dishes/${dish.id}/edit`} className="text-indigo-600 hover:underline">
                  Edit
                </Link>
              </Td>
            </tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}
