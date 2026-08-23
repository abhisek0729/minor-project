import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  MapPin,
  Sparkles,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  backgroundImage?: string;
}

export default function Hero({
  backgroundImage = "/images/hero-himalayas.webp",
}: HeroProps) {
  return (
    <section className="relative min-h-[380px] overflow-hidden bg-black md:min-h-[460px]">
      {/* Background Image & Optimized Cinematic Overlays */}
      <div className="absolute inset-0 h-full w-full">
        <Image
          src={backgroundImage}
          alt="Himalayan Mountain Panorama in Nepal"
          fill
          priority
          fetchPriority="high"
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
          quality={75}
          className="object-cover object-center"
        />
        {/* Dual atmospheric gradients keeping the mountain peaks visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[380px] max-w-7xl items-end px-3.5 pb-6 pt-16 sm:px-4 sm:pb-8 sm:pt-20 md:min-h-[460px] md:pt-24 lg:px-8">
        <div className="w-full max-w-3xl text-white">
          {/* Badge */}
          <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-medium">
              AI-Powered Travel & Booking Platform
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[3.2rem] font-black leading-[1.1] tracking-[-0.04em] text-white [text-shadow:0_3px_16px_rgba(0,0,0,0.6)]">
            Discover your{" "}
            <span className="text-amber-300 drop-shadow-md">
              next unforgettable
            </span>{" "}
            trip in Nepal.
          </h1>

          {/* Subtitle */}
          <p className="mt-2.5 max-w-xl text-xs sm:text-sm leading-relaxed text-white/90 font-normal [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">
            Explore handpicked hotels, authentic dining, licensed tour guides,
            curated trekking destinations, and instant travel budget tracking.
          </p>

          {/* Action CTA Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Link href="/destinations">
              <Button
                size="sm"
                aria-label="Explore verified stays and destinations in Nepal"
                className="h-8.5 sm:h-9.5 gap-1.5 rounded-full bg-primary px-4 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 shadow-md cursor-pointer"
              >
                Explore stays
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link href="/ai-planner">
              <Button
                size="sm"
                variant="secondary"
                aria-label="Plan custom itinerary with AI Assistant"
                className="h-8.5 sm:h-9.5 rounded-full border border-white/40 bg-white/20 px-4 text-xs sm:text-sm font-semibold text-white hover:bg-white/30 backdrop-blur-md cursor-pointer"
              >
                Plan with AI
              </Button>
            </Link>
          </div>

          {/* Compact 3-Column Stats on All Screens */}
          <div className="mt-4.5 grid grid-cols-3 max-w-lg gap-2 sm:gap-3">
            <div className="rounded-xl border border-white/20 bg-black/45 p-2 sm:p-2.5 backdrop-blur-md text-center sm:text-left transition-transform hover:scale-102">
              <MapPin className="mb-0.5 h-3.5 w-3.5 text-amber-300 mx-auto sm:mx-0" />
              <p className="text-base sm:text-xl font-black text-white">100+</p>
              <p className="text-[10px] sm:text-xs font-medium text-white/80">
                destinations
              </p>
            </div>
            <div className="rounded-xl border border-white/20 bg-black/45 p-2 sm:p-2.5 backdrop-blur-md text-center sm:text-left transition-transform hover:scale-102">
              <BedDouble className="mb-0.5 h-3.5 w-3.5 text-amber-300 mx-auto sm:mx-0" />
              <p className="text-base sm:text-xl font-black text-white">500+</p>
              <p className="text-[10px] sm:text-xs font-medium text-white/80">
                stays
              </p>
            </div>
            <div className="rounded-xl border border-white/20 bg-black/45 p-2 sm:p-2.5 backdrop-blur-md text-center sm:text-left transition-transform hover:scale-102">
              <Utensils className="mb-0.5 h-3.5 w-3.5 text-amber-300 mx-auto sm:mx-0" />
              <p className="text-base sm:text-xl font-black text-white">300+</p>
              <p className="text-[10px] sm:text-xs font-medium text-white/80">
                food spots
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
