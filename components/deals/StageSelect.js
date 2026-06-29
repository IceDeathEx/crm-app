"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { DEAL_STAGES, stageLabel } from "@/lib/format";

export function StageSelect({ dealId, stage }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function onChange(e) {
    const nextStage = e.target.value;
    startTransition(async () => {
      setError(null);
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: nextStage }),
      });
      if (!res.ok) {
        setError("Failed to update stage");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={stage}
        onChange={onChange}
        disabled={isPending}
        className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
      >
        {DEAL_STAGES.map((s) => (
          <option key={s} value={s}>
            {stageLabel(s)}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
