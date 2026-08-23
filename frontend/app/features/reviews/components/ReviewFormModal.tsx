"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, MessageSquarePlus, Star, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import RatingStars from "./RatingStars";
import { submitReview } from "../actions/reviews.action";

interface ReviewFormModalProps {
  targetType: "hotel" | "restaurant" | "guide" | "package";
  targetId: number;
  targetName: string;
  triggerButton?: React.ReactNode;
}

export default function ReviewFormModal({
  targetType,
  targetId,
  targetName,
  triggerButton,
}: ReviewFormModalProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || comment.trim().length < 5) {
      toast.error("Please write a short review comment (at least 5 characters).");
      return;
    }

    startTransition(async () => {
      const res = await submitReview({
        targetType,
        targetId,
        rating,
        comment,
      });

      if (res.success) {
        toast.success(res.message);
        setComment("");
        setRating(5);
        setOpen(false);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <>
      {triggerButton ? (
        <span onClick={() => setOpen(true)}>{triggerButton}</span>
      ) : (
        <Button onClick={() => setOpen(true)} className="gap-2 shadow-xs">
          <MessageSquarePlus className="size-4" />
          Write a Review
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-card border shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold">Rate & Review</h3>
                <p className="text-xs text-muted-foreground">
                  Share your experience with <strong className="text-foreground">{targetName}</strong>.
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="size-8"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-muted/30 border space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tap stars to rate
                </span>
                <RatingStars
                  rating={rating}
                  size="lg"
                  interactive
                  onRatingChange={(r) => setRating(r)}
                />
                <span className="text-xs font-bold text-foreground">
                  {rating === 5 && "⭐ Excellent - Highly Recommended"}
                  {rating === 4 && "⭐ Very Good - Enjoyed It"}
                  {rating === 3 && "⭐ Average - Met Expectations"}
                  {rating === 2 && "⭐ Below Average"}
                  {rating === 1 && "⭐ Poor Experience"}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Your Review & Feedback *</label>
                <Textarea
                  placeholder="How was the food, service, cleanliness, or guiding quality?"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="gap-2">
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  Publish Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
