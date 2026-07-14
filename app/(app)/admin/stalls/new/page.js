import { requireAdmin } from "@/lib/auth";
import { StallForm } from "@/components/stalls/StallForm";
import { createStall } from "@/app/(app)/admin/stalls/actions";

export default async function NewStallPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Add stall</h1>
      <StallForm action={createStall} />
    </div>
  );
}
