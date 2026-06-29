import { Badge } from "@/components/ui/Badge";
import { stageColor, stageLabel } from "@/lib/format";

export function StageBadge({ stage }) {
  return <Badge color={stageColor(stage)}>{stageLabel(stage)}</Badge>;
}
