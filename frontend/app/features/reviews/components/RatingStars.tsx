"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function RatingStars({
  rating,
  maxStars = 5,
  size = "md",
  interactive = false,
  onRatingChange,
}: RatingStarsProps) {
  const starSizes = {
    sm: "size-3.5",
    md: "size-4.5",
    lg: "size-6",
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(rating);

        if (!interactive) {
          return (
            <span key={index} className="inline-flex items-center">
              <Star
                className={cn(
                  starSizes[size],
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted-foreground/30"
                )}
              />
            </span>
          );
        }

        return (
          <button
            key={index}
            type="button"
            onClick={() => onRatingChange && onRatingChange(starValue)}
            className="cursor-pointer transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={cn(
                starSizes[size],
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted text-muted-foreground/30"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
