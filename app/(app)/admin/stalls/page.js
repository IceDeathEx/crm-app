import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Table, Thead, Th, Tbody, Td, EmptyState } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";

export default async function AdminStallsPage() {
  await requireAdmin();

  const stalls = await db.stall.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { stallDishes: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Manage stalls</h1>
        <Button href="/admin/stalls/new">Add stall</Button>
      </div>

      <Table>
        <Thead>
          <Th>Stall</Th>
          <Th>Address</Th>
          <Th>Dishes</Th>
          <Th />
        </Thead>
        <Tbody>
          {stalls.length === 0 ? (
            <tr>
              <Td>
                <EmptyState>No stalls yet.</EmptyState>
              </Td>
            </tr>
          ) : (
            stalls.map((stall) => (
              <tr key={stall.id} className="hover:bg-zinc-50">
                <Td>{stall.name}</Td>
                <Td>{stall.address}</Td>
                <Td>{stall._count.stallDishes}</Td>
                <Td>
                  <Link href={`/admin/stalls/${stall.id}/edit`} className="text-indigo-600 hover:underline">
                    Edit
                  </Link>
                </Td>
              </tr>
            ))
          )}
        </Tbody>
      </Table>
    </div>
  );
}
