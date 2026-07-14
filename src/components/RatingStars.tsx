"use client";

import { useState } from "react";

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
          className={`text-xl leading-none transition-transform hover:scale-125 disabled:opacity-40 ${
            n <= hover ? "text-accent-2" : "text-muted"
          }`}
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
