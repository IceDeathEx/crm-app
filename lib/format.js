export const DEAL_STAGES = ["LEAD", "QUALIFIED", "PROPOSAL", "WON", "LOST"];

const STAGE_COLORS = {
  LEAD: "zinc",
  QUALIFIED: "blue",
  PROPOSAL: "purple",
  WON: "green",
  LOST: "red",
};

export function stageColor(stage) {
  return STAGE_COLORS[stage] ?? "zinc";
}

export function stageLabel(stage) {
  return stage.charAt(0) + stage.slice(1).toLowerCase();
}

export function taskStatusColor(status) {
  return status === "DONE" ? "green" : "amber";
}

// Hex equivalents of the STAGE_COLORS/Badge palette, for chart fills
// (Tailwind classes don't apply inside SVG chart libraries like Recharts).
const STAGE_HEX = {
  LEAD: "#71717a",
  QUALIFIED: "#3b82f6",
  PROPOSAL: "#a855f7",
  WON: "#22c55e",
  LOST: "#ef4444",
};

export function stageHex(stage) {
  return STAGE_HEX[stage] ?? "#71717a";
}

export function taskStatusHex(status) {
  return status === "DONE" ? "#22c55e" : "#f59e0b";
}

export function formatMoney(cents) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
