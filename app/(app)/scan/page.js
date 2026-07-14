import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ScanForm } from "@/components/scan/ScanForm";

export default async function ScanPage() {
  await requireUser();
  const dishes = await db.dish.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Scan a dish</h1>
        <p className="text-sm text-zinc-600">
          Snap or upload a photo and we&apos;ll try to identify which of the 8 dishes it is.
        </p>
      </div>
      <ScanForm dishes={dishes} />
    </div>
  );
}
