"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { taskStatusHex } from "@/lib/format";

export function TaskStatusChart({ open, done }) {
  const data = [
    { name: "Open", value: open, status: "OPEN" },
    { name: "Done", value: done, status: "DONE" },
  ];
  const total = open + done;

  if (total === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-zinc-500">
        No tasks yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e4e4e7",
            boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
          }}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={42}
          outerRadius={70}
          paddingAngle={total > 1 ? 3 : 0}
          strokeWidth={0}
        >
          {data.map((row) => (
            <Cell key={row.status} fill={taskStatusHex(row.status)} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
