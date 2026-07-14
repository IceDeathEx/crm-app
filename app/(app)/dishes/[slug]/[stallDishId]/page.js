import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";

export default async function StallDishPage({ params }) {
  const { slug, stallDishId } = await params;
  const user = await requireUser();

  const stallDish = await db.stallDish.findUnique({
    where: { id: stallDishId },
    include: { stall: true, dish: true },
  });
  if (!stallDish || stallDish.dish.slug !== slug) notFound();

  const reviews = await db.review.findMany({
    where: { stallDishId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const redirectPath = `/dishes/${slug}/${stallDishId}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-zinc-500">{stallDish.dish.name}</p>
        <h1 className="text-xl font-semibold text-zinc-900">{stallDish.stall.name}</h1>
        <p className="text-sm text-zinc-600">{stallDish.stall.address}</p>
        <p className="mt-1 text-sm font-medium text-zinc-900">{formatMoney(stallDish.priceCents)}</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-zinc-900">Reviews</h2>
        <ReviewList reviews={reviews} currentUser={user} redirectPath={redirectPath} />
        <ReviewForm stallDishId={stallDish.id} redirectPath={redirectPath} />
      </div>
    </div>
  );
}
