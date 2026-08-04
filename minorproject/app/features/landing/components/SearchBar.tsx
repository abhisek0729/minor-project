"use client";

import { useState } from "react";
import {
  CalendarDays,
  MapPin,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SearchSection() {
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  return (
    <section className="relative -mt-20 z-20 px-4">
      <div className="mx-auto max-w-7xl">

        <div className="rounded-3xl border bg-background shadow-2xl">

          {/* Header */}

          <div className="border-b px-8 py-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />

              <h2 className="text-xl font-bold">
                Plan Your Next Adventure
              </h2>
            </div>

            <p className="mt-2 text-muted-foreground">
              Search destinations, discover hotels, or let AI build your
              perfect itinerary.
            </p>
          </div>

          {/* Search Form */}

          <div className="grid gap-6 p-8 lg:grid-cols-5">

            {/* Destination */}

            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium">
                Destination
              </label>

              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />

                <Input
                  value={destination}
                  onChange={(e) =>
                    setDestination(e.target.value)
                  }
                  placeholder="Pokhara, Everest, Mustang..."
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Check In */}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Check In
              </label>

              <div className="relative">
                <CalendarDays className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />

                <Input
                  type="date"
                  value={checkIn}
                  onChange={(e) =>
                    setCheckIn(e.target.value)
                  }
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Check Out */}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Check Out
              </label>

              <div className="relative">
                <CalendarDays className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />

                <Input
                  type="date"
                  value={checkOut}
                  onChange={(e) =>
                    setCheckOut(e.target.value)
                  }
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Guests */}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Guests
              </label>

              <div className="relative">
                <Users className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />

                <Input
                  type="number"
                  min={1}
                  value={guests}
                  onChange={(e) =>
                    setGuests(Number(e.target.value))
                  }
                  className="pl-10 h-12"
                />
              </div>
            </div>
          </div>

          {/* Actions */}

          <div className="flex flex-col gap-4 border-t p-8 md:flex-row md:justify-between">

            <Button
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />

              Plan with AI
            </Button>

            <Button
              size="lg"
              className="gap-2"
            >
              <Search className="h-4 w-4" />

              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}