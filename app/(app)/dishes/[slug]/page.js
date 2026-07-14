import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { NutritionFacts } from "@/components/dishes/NutritionFacts";
import { StallCompareTable } from "@/components/stalls/StallCompareTable";
import { dishEmoji } from "@/lib/format";

export default async function DishDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const { sort } = await searchParams;

  const dish = await db.dish.findUnique({ where: { slug } });
  if (!dish) notFound();

  const stallDishes = await db.stallDish.findMany({
    where: { dishId: dish.id },
    include: { stall: true },
  });

  const ratings = await db.review.groupBy({
    by: ["stallDishId"],
    where: { stallDishId: { in: stallDishes.map((sd) => sd.id) } },
    _avg: { tasteRating: true },
    _count: true,
  });
  const ratingByStallDish = Object.fromEntries(
    ratings.map((r) => [r.stallDishId, { avgRating: r._avg.tasteRating, reviewCount: r._count }]),
  );

  let rows = stallDishes.map((sd) => ({
    ...sd,
    avgRating: ratingByStallDish[sd.id]?.avgRating ?? null,
    reviewCount: ratingByStallDish[sd.id]?.reviewCount ?? 0,
  }));

  if (sort === "price") {
    rows = rows.sort((a, b) => (a.priceCents ?? Infinity) - (b.priceCents ?? Infinity));
  } else if (sort === "rating") {
    rows = rows.sort((a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 via-white to-fuchsia-100 text-4xl">
          {dishEmoji(dish.slug)}
        </span>
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{dish.name}</h1>
          <p className="text-sm text-zinc-600">{dish.shortDescription}</p>
        </div>
      </div>

      <NutritionFacts dish={dish} />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900">Compare stalls</h2>
          <div className="flex gap-2 text-sm">
            <a
              href={`/dishes/${dish.slug}?sort=price`}
              className="text-indigo-600 hover:underline"
            >
              Sort by price
            </a>
            <a
              href={`/dishes/${dish.slug}?sort=rating`}
              className="text-indigo-600 hover:underline"
            >
              Sort by rating
            </a>
          </div>
        </div>
        <StallCompareTable dishSlug={dish.slug} rows={rows} />
      </div>
    </div>
  );
}
