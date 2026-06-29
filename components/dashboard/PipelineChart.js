"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatMoney, stageHex, stageLabel } from "@/lib/format";

export function PipelineChart({ data }) {
  const chartData = data.map((row) => ({
    stage: stageLabel(row.stage),
    value: row.valueCents / 100,
    raw: row,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="stage"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#71717a", fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#71717a", fontSize: 12 }}
          tickFormatter={(v) => `$${v >= 1000 ? `${v / 1000}k` : v}`}
          width={48}
        />
        <Tooltip
          cursor={{ fill: "#f4f4f5" }}
          formatter={(value) => formatMoney(value * 100)}
          labelStyle={{ color: "#18181b", fontWeight: 600 }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e4e4e7",
            boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
          }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {chartData.map((row) => (
            <Cell key={row.raw.stage} fill={stageHex(row.raw.stage)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
