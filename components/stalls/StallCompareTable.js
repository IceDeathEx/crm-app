import Link from "next/link";

import { Table, Thead, Th, Tbody, Td, EmptyState } from "@/components/ui/Table";
import { StarRating } from "@/components/reviews/StarRating";
import { formatMoney } from "@/lib/format";

export function StallCompareTable({ dishSlug, rows }) {
  if (rows.length === 0) {
    return (
      <Table>
        <Tbody>
          <tr>
            <Td>
              <EmptyState>No stalls have added this dish yet.</EmptyState>
            </Td>
          </tr>
        </Tbody>
      </Table>
    );
  }

  return (
    <Table>
      <Thead>
        <Th>Stall</Th>
        <Th>Address</Th>
        <Th>Price</Th>
        <Th>Taste rating</Th>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <tr key={row.id} className="hover:bg-zinc-50">
            <Td>
              <Link
                href={`/dishes/${dishSlug}/${row.id}`}
                className="font-medium text-indigo-600 hover:underline"
              >
                {row.stall.name}
              </Link>
            </Td>
            <Td>{row.stall.address}</Td>
            <Td>{formatMoney(row.priceCents)}</Td>
            <Td>
              {row.avgRating != null ? (
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(row.avgRating)} />
                  <span className="text-xs text-zinc-500">
                    {row.avgRating.toFixed(1)} ({row.reviewCount})
                  </span>
                </div>
              ) : (
                <span className="text-xs text-zinc-400">No reviews yet</span>
              )}
            </Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  );
}
