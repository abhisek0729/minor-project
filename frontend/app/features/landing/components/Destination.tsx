"use client";

import Image from "next/image";
import Link from "next/link";

import { ArrowRight, MapPin, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import HorizontalCarousel from "./HorizontalCarousel";

import { destinations } from "../data/destinations";

export default function Destinations() {
  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Heading */}

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Explore Nepal
            </span>

            <h2 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
              Popular Destinations
            </h2>

            <p className="mt-4 max-w-2xl text-muted-foreground">
              Discover Nepal's most loved destinations, from peaceful lakes to
              majestic Himalayan peaks and unforgettable wildlife adventures.
            </p>
          </div>

          <Link href="/destinations">
            <Button>
              View All
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>

        {/* Carousel */}

        <HorizontalCarousel swipeHint="← Swipe to explore more destinations →">
          {destinations.map((destination) => (
            <article
              key={destination.id}
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

              <div className="relative h-64 overflow-hidden">
                <Image
                  src={destination.image}
                  alt={destination.name}
                  fill
                  sizes="
                    (max-width: 640px) 85vw,
                    (max-width: 1024px) 360px,
                    320px
                  "
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />

                {/* Gradient Overlay */}

                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent dark:from-black/80 dark:via-black/40" />

                {/* Rating Badge */}

                <div
                  className="
                    absolute
                    left-4
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
                  {destination.rating}
                </div>
              </div>

              {/* Content */}

              <div className="space-y-4 p-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                    {destination.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    {destination.location}
                  </div>
                </div>

                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {destination.description}
                </p>

                <Link href={`/destinations/${destination.id}`}>
                  <Button className="w-full rounded-xl">
                    Explore Destination
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </HorizontalCarousel>
      </div>
    </section>
  );
}