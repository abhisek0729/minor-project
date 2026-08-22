"use client";

import { Star, User } from "lucide-react";
import RatingStars from "./RatingStars";
import ReviewFormModal from "./ReviewFormModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewsSectionProps {
  targetType: "hotel" | "restaurant" | "guide" | "package";
  targetId: number;
  targetName: string;
  reviews: any[];
  avgRating: string | number;
  totalReviews: number;
}

export default function ReviewsSection({
  targetType,
  targetId,
  targetName,
  reviews,
  avgRating,
  totalReviews,
}: ReviewsSectionProps) {
  return (
    <section className="space-y-6 pt-6 border-t">
      {/* Header & Write Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Guest Reviews & Ratings</h2>
          <div className="flex items-center gap-2 mt-1">
            <RatingStars rating={Number(avgRating)} size="md" />
            <span className="font-bold text-foreground">{avgRating}</span>
            <span className="text-xs text-muted-foreground">
              ({totalReviews} verified traveler review{totalReviews === 1 ? "" : "s"})
            </span>
          </div>
        </div>

        <ReviewFormModal
          targetType={targetType}
          targetId={targetId}
          targetName={targetName}
        />
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card className="border-dashed bg-muted/15 p-8 text-center">
          <p className="font-semibold text-sm">No reviews yet for {targetName}</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Be the first traveler to share your feedback and help the community discover this place!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((rev) => (
            <Card key={rev.id} className="border shadow-xs">
              <CardContent className="p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {rev.userName ? rev.userName[0].toUpperCase() : <User className="size-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{rev.userName || "Traveler"}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                      </p>
                    </div>
                  </div>

                  <RatingStars rating={rev.rating} size="sm" />
                </div>

                <p className="text-muted-foreground leading-relaxed pt-1">
                  "{rev.comment}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
