"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function TaskStatusToggle({ taskId, status }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function toggle() {
    const nextStatus = status === "DONE" ? "OPEN" : "DONE";
    startTransition(async () => {
      setError(null);
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        setError("Failed to update task");
        return;
      }
      router.refresh();
    });
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={status === "DONE"}
        onChange={toggle}
        disabled={isPending}
        className="h-4 w-4 rounded border-zinc-300"
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
