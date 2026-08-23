"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  MapPin,
  Star,
  Wifi,
  Car,
  Coffee,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import HorizontalCarousel from "./HorizontalCarousel";

import { hotels } from "../data/hotels";

const amenityIcon = (amenity: string) => {
  if (amenity.toLowerCase().includes("wifi")) {
    return <Wifi className="size-3.5" />;
  }

  if (amenity.toLowerCase().includes("parking")) {
    return <Car className="size-3.5" />;
  }

  if (amenity.toLowerCase().includes("breakfast")) {
    return <Coffee className="size-3.5" />;
  }

  return null;
};

export default function FeaturedHotels() {
  return (
    <section className="bg-muted/40 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Heading */}

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Stay Comfortably
            </span>

            <h2 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
              Featured Hotels
            </h2>

            <p className="mt-4 max-w-2xl text-muted-foreground">
              Carefully selected hotels offering comfort, convenience, and
              unforgettable hospitality across Nepal.
            </p>
          </div>

          <Link href="/hotels">
            <Button>
              View All Hotels
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>

        {/* Carousel */}

        <HorizontalCarousel swipeHint="← Swipe to explore more hotels →">
          {hotels.map((hotel) => (
            <article
              key={hotel.id}
              className="
                group
                shrink-0
                snap-start

                w-[85vw]
                sm:w-90
                lg:w-[320px]

                overflow-hidden
                rounded-2xl

                border
                border-border/60

                bg-card

                transition-all
                duration-300

                hover:-translate-y-2
                hover:border-primary/30
                hover:shadow-xl
                hover:shadow-primary/10
              "
            >
              {/* Image */}

              <div className="relative h-60 overflow-hidden">
                <Image
                  src={hotel.image}
                  alt={hotel.name}
                  fill
                  sizes="
                    (max-width:640px) 85vw,
                    (max-width:1024px) 360px,
                    320px
                  "
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />

                {/* Gradient */}

                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent dark:from-black/80 dark:via-black/40" />

                {/* Rating */}

                <div
                  className="
                    absolute
                    right-4
                    top-4

                    flex
                    items-center
                    gap-1

                    rounded-full

                    border
                    border-border/40

                    bg-background/80
                    px-3
                    py-1

                    text-sm
                    font-semibold
                    text-foreground

                    shadow-lg
                    backdrop-blur-md
                  "
                >
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  {hotel.rating}
                </div>
              </div>

              {/* Content */}

              <div className="space-y-5 p-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                    {hotel.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    {hotel.location}
                  </div>
                </div>

                {/* Amenities */}

                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.map((item) => (
                    <span
                      key={item}
                      className="
                        inline-flex
                        items-center
                        gap-1

                        rounded-full

                        border
                        border-border/60

                        bg-muted

                        px-3
                        py-1

                        text-xs
                        font-medium
                        text-foreground

                        transition-colors
                        group-hover:border-primary/20
                      "
                    >
                      {amenityIcon(item)}
                      {item}
                    </span>
                  ))}
                </div>

                {/* Price */}

                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                  <div>
                    <span className="text-2xl font-bold text-foreground">
                      ${hotel.price}
                    </span>

                    <span className="text-muted-foreground">
                      {" "}
                      / night
                    </span>
                  </div>

                  <Button
                    size="sm"
                    className="rounded-lg"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </HorizontalCarousel>
      </div>
    </section>
  );
}