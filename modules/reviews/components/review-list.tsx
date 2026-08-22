import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Review } from "../types/review.types";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`size-3.5 ${
            n <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </span>
  );
}

/** Server-renderable review list — reviews are baked into the static page. */
export function ReviewList({
  reviews,
  emptyLabel,
}: {
  reviews: Review[];
  emptyLabel: string;
}) {
  if (reviews.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground italic">{emptyLabel}</p>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <Card key={review._id} className="gap-1.5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">{review.userName}</span>
            <Stars rating={review.rating} />
          </div>
          <p className="text-sm text-muted-foreground">{review.comment}</p>
          <span className="text-[11px] text-muted-foreground/70">
            {new Date(review.createdAtUtc).toLocaleDateString()}
          </span>
        </Card>
      ))}
    </div>
  );
}
