import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { dishCategoryColor, dishEmoji } from "@/lib/format";

export function DishCard({ dish }) {
  return (
    <Link
      href={`/dishes/${dish.slug}`}
      className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-fuchsia-100 text-5xl">
        {dishEmoji(dish.slug)}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-zinc-900">{dish.name}</h2>
          {dish.category && (
            <Badge color={dishCategoryColor(dish.category)}>{dish.category}</Badge>
          )}
        </div>
        <p className="line-clamp-3 text-sm text-zinc-600">{dish.shortDescription}</p>
        <p className="mt-auto text-xs text-zinc-500">{dish.caloriesKcal} kcal / serving</p>
      </div>
    </Link>
  );
}
