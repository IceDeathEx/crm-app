import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { DealForm } from "@/components/deals/DealForm";
import { createDeal } from "@/app/(app)/deals/actions";

export default async function NewDealPage() {
  const user = await requireUser();
  const [contacts, users] = await Promise.all([
    db.contact.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
    db.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">New deal</h1>
      <DealForm
        action={createDeal}
        contacts={contacts}
        users={users}
        currentUserId={user.id}
        submitLabel="Create deal"
      />
    </div>
  );
}
