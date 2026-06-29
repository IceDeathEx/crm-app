import Link from "next/link";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, Thead, Th, Tbody, Td, EmptyState } from "@/components/ui/Table";

export default async function ContactsPage({ searchParams }) {
  const { q = "" } = await searchParams;

  const contacts = await db.contact.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Contacts</h1>
        <Button href="/contacts/new">New contact</Button>
      </div>

      <form className="max-w-sm">
        <Input
          name="q"
          placeholder="Search by name, company, or email"
          defaultValue={q}
        />
      </form>

      {contacts.length === 0 ? (
        <Table>
          <Tbody>
            <tr>
              <Td>
                <EmptyState>No contacts found.</EmptyState>
              </Td>
            </tr>
          </Tbody>
        </Table>
      ) : (
        <Table>
          <Thead>
            <Th>Name</Th>
            <Th>Company</Th>
            <Th>Email</Th>
            <Th>Phone</Th>
          </Thead>
          <Tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-zinc-50">
                <Td>
                  <Link
                    href={`/contacts/${contact.id}`}
                    className="font-medium text-zinc-900 hover:underline"
                  >
                    {contact.firstName} {contact.lastName}
                  </Link>
                </Td>
                <Td>{contact.company ?? "—"}</Td>
                <Td>{contact.email ?? "—"}</Td>
                <Td>{contact.phone ?? "—"}</Td>
              </tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
