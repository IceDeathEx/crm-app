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
