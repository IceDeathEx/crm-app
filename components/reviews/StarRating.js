export function StarRating({ rating, size = "text-sm" }) {
  return (
    <span className={`${size} tracking-tight text-amber-500`} aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-zinc-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}
