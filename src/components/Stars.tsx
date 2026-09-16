export default function Stars({
  rating,
  className = "h-4 w-4",
}: {
  rating: number;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(rating);
        return (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className={className}
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M10 1.5l2.59 5.25 5.79.84-4.19 4.09.99 5.77L10 14.9l-5.18 2.55.99-5.77L1.62 7.6l5.79-.84L10 1.5z" />
          </svg>
        );
      })}
    </div>
  );
}
