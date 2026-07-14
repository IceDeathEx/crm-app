import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { Table, Thead, Th, Tbody, Td, EmptyState } from "@/components/ui/Table";
import { formatMoney } from "@/lib/format";

export default async function StallDetailPage({ params }) {
  const { id } = await params;

  const stall = await db.stall.findUnique({
    where: { id },
    include: { stallDishes: { include: { dish: true } } },
  });
  if (!stall) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">{stall.name}</h1>
        <p className="text-sm text-zinc-600">{stall.address}</p>
      </div>

      <Table>
        <Thead>
          <Th>Dish</Th>
          <Th>Price</Th>
        </Thead>
        <Tbody>
          {stall.stallDishes.length === 0 ? (
            <tr>
              <Td>
                <EmptyState>No dishes listed for this stall yet.</EmptyState>
              </Td>
            </tr>
          ) : (
            stall.stallDishes.map((sd) => (
              <tr key={sd.id} className="hover:bg-zinc-50">
                <Td>
                  <Link
                    href={`/dishes/${sd.dish.slug}/${sd.id}`}
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    {sd.dish.name}
                  </Link>
                </Td>
                <Td>{formatMoney(sd.priceCents)}</Td>
              </tr>
            ))
          )}
        </Tbody>
      </Table>
    </div>
  );
}
