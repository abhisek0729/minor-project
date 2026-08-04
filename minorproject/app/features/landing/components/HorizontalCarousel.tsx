"use client";

import { ReactNode, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type HorizontalCarouselProps = {
  children: React.ReactNode;
  swipeHint?: string;
};

export default function HorizontalCarousel({
  children,
  swipeHint = "← Swipe to explore more →",
}: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const { clientWidth } = scrollRef.current;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -clientWidth : clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative mt-12">
      {/* Desktop Navigation */}

      <Button
        size="icon"
        variant="outline"
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg lg:flex"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <Button
        size="icon"
        variant="outline"
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 z-20 hidden translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg lg:flex"
      >
        <ArrowRight className="h-5 w-5" />
      </Button>

      {/* Carousel */}

      <div
        ref={scrollRef}
        className="
          flex
          gap-6
          overflow-x-auto
          scroll-smooth
          snap-x
          snap-mandatory
          pb-4

          [-ms-overflow-style:none]
          scrollbar
          [&::-webkit-scrollbar]:hidden
        "
      >
        {children}
      </div>

      {/* Mobile Hint */}

      <div className="mt-6 text-center lg:hidden">
        <p className="text-sm text-muted-foreground">
          {swipeHint}
        </p>
      </div>
    </div>
  );
}