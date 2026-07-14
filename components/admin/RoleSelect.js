"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function RoleSelect({ userId, role }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function onChange(e) {
    const nextRole = e.target.value;
    startTransition(async () => {
      setError(null);
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      if (!res.ok) {
        const { error: message } = await res.json().catch(() => ({}));
        setError(message ?? "Failed to update role");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={role}
        onChange={onChange}
        disabled={isPending}
        className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
      >
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
