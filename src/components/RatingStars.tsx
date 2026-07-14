"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export function RatingStars({
  onRate,
  disabled,
}: {
  onRate: (stars: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHover(n)}
          onClick={() => onRate(n)}
          className="transition-transform hover:scale-125 disabled:opacity-40"
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`h-5 w-5 ${
              n <= hover
                ? "text-accent-2 fill-accent-2"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
