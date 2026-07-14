import { StarRating } from "@/components/reviews/StarRating";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/ui/Table";
import { deleteReview } from "@/app/(app)/reviews/actions";

export function ReviewList({ reviews, currentUser, redirectPath }) {
  if (reviews.length === 0) {
    return <EmptyState>No reviews yet -- be the first to rate this.</EmptyState>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((review) => {
        const canDelete = currentUser.id === review.userId || currentUser.role === "ADMIN";
        return (
          <li key={review.id} className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StarRating rating={review.tasteRating} />
                <span className="text-sm font-medium text-zinc-900">
                  {review.isAnonymous ? "Anonymous" : review.user.username}
                </span>
              </div>
              <span className="text-xs text-zinc-500">{formatDate(review.createdAt)}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-700">{review.description}</p>
            {canDelete && (
              <form action={deleteReview.bind(null, review.id, redirectPath)} className="mt-2">
                <button type="submit" className="text-xs text-red-600 hover:underline">
                  Delete
                </button>
              </form>
            )}
          </li>
        );
      })}
    </ul>
  );
}
