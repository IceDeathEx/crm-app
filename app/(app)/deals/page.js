import Link from "next/link";

import { db } from "@/lib/db";
import { DealTable } from "@/components/deals/DealTable";
import { Button } from "@/components/ui/Button";
import { DEAL_STAGES, stageLabel } from "@/lib/format";

export default async function DealsPage({ searchParams }) {
  const { stage = "all" } = await searchParams;

  const deals = await db.deal.findMany({
    where: stage === "all" ? undefined : { stage },
    include: { contact: true, owner: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Deals</h1>
        <Button href="/deals/new">New deal</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/deals?stage=all"
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            stage === "all" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          All
        </Link>
        {DEAL_STAGES.map((s) => (
          <Link
            key={s}
            href={`/deals?stage=${s}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              stage === s ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {stageLabel(s)}
          </Link>
        ))}
      </div>

      <DealTable deals={deals} />
    </div>
  );
}
