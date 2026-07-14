import Link from "next/link";

import { db } from "@/lib/db";
import { Table, Thead, Th, Tbody, Td, EmptyState } from "@/components/ui/Table";

export default async function StallsPage() {
  const stalls = await db.stall.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { stallDishes: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Stalls</h1>
      <Table>
        <Thead>
          <Th>Stall</Th>
          <Th>Address</Th>
          <Th>Dishes</Th>
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
                <Td>
                  <Link href={`/stalls/${stall.id}`} className="font-medium text-indigo-600 hover:underline">
                    {stall.name}
                  </Link>
                </Td>
                <Td>{stall.address}</Td>
                <Td>{stall._count.stallDishes}</Td>
              </tr>
            ))
          )}
        </Tbody>
      </Table>
    </div>
  );
}
