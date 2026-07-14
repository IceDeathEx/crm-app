import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/reviews/StarRating";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/ui/Table";

const ACTIVITY_LABELS = {
  SEDENTARY: "Sedentary",
  LIGHT: "Lightly active",
  MODERATE: "Moderately active",
  ACTIVE: "Active",
  VERY_ACTIVE: "Very active",
};

const GENDER_LABELS = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

export default async function ProfilePage() {
  const user = await requireUser();

  const reviews = await db.review.findMany({
    where: { userId: user.id },
    include: { stallDish: { include: { dish: true, stall: true } } },
    orderBy: { createdAt: "desc" },
  });

  const fields = [
    ["Age", user.age ?? "—"],
    ["Gender", user.gender ? GENDER_LABELS[user.gender] : "—"],
    ["Activity level", user.activityLevel ? ACTIVITY_LABELS[user.activityLevel] : "—"],
    ["Height", user.heightCm ? `${user.heightCm} cm` : "—"],
    ["Weight", user.weightKg ? `${user.weightKg} kg` : "—"],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{user.username}</h1>
          <p className="text-sm text-zinc-600">{user.phone}</p>
        </div>
        <Button href="/profile/edit" variant="secondary">
          Edit profile
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-200 bg-white p-5 sm:grid-cols-5">
        {fields.map(([label, value]) => (
          <div key={label} className="flex flex-col">
            <dt className="text-xs text-zinc-500">{label}</dt>
            <dd className="text-sm font-medium text-zinc-900">{value}</dd>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-zinc-900">Your reviews</h2>
        {reviews.length === 0 ? (
          <EmptyState>You haven&apos;t reviewed anything yet.</EmptyState>
        ) : (
          <ul className="flex flex-col gap-3">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/dishes/${review.stallDish.dish.slug}/${review.stallDishId}`}
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    {review.stallDish.dish.name} @ {review.stallDish.stall.name}
                  </Link>
                  <span className="text-xs text-zinc-500">{formatDate(review.createdAt)}</span>
                </div>
                <StarRating rating={review.tasteRating} />
                <p className="mt-1 text-sm text-zinc-700">{review.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
