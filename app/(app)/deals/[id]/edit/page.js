import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { DealForm } from "@/components/deals/DealForm";
import { updateDeal } from "@/app/(app)/deals/actions";

export default async function EditDealPage({ params }) {
  const { id } = await params;
  const [deal, users] = await Promise.all([
    db.deal.findUnique({ where: { id } }),
    db.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!deal) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Edit deal</h1>
      <DealForm
        action={updateDeal.bind(null, deal.id)}
        deal={deal}
        users={users}
        submitLabel="Save changes"
      />
    </div>
  );
}
