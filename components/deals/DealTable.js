import Link from "next/link";

import { Table, Thead, Th, Tbody, Td, EmptyState } from "@/components/ui/Table";
import { StageBadge } from "@/components/deals/StageBadge";
import { formatMoney } from "@/lib/format";

export function DealTable({ deals }) {
  if (deals.length === 0) {
    return (
      <Table>
        <Tbody>
          <tr>
            <Td>
              <EmptyState>No deals found.</EmptyState>
            </Td>
          </tr>
        </Tbody>
      </Table>
    );
  }

  return (
    <Table>
      <Thead>
        <Th>Title</Th>
        <Th>Contact</Th>
        <Th>Value</Th>
        <Th>Stage</Th>
        <Th>Owner</Th>
      </Thead>
      <Tbody>
        {deals.map((deal) => (
          <tr key={deal.id} className="hover:bg-zinc-50">
            <Td>
              <Link
                href={`/deals/${deal.id}`}
                className="font-medium text-zinc-900 hover:underline"
              >
                {deal.title}
              </Link>
            </Td>
            <Td>
              <Link
                href={`/contacts/${deal.contact.id}`}
                className="hover:underline"
              >
                {deal.contact.firstName} {deal.contact.lastName}
              </Link>
            </Td>
            <Td>{formatMoney(deal.valueCents)}</Td>
            <Td>
              <StageBadge stage={deal.stage} />
            </Td>
            <Td>{deal.owner.name ?? deal.owner.email}</Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  );
}
