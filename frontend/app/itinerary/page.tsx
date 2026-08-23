"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  MapPin,
  Navigation,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ItineraryDay = {
  day: number;
  date: string;
  title: string;
  items: Array<{
    title: string;
    description: string;
    location: string;
    time: string;
    cost: number;
    type: string;
    mapUrl?: string;
  }>;
  estimatedCost: number;
};

type Itinerary = {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: string;
  days: ItineraryDay[];
  totalCost: number;
  summary: string;
};

export default function ItineraryViewPage() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from params or session
    // For now, we'll use mock data to show the structure
    const mockItinerary: Itinerary = {
      id: 1,
      title: "3-Day Pokhara Getaway",
      destination: "Pokhara",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      budget: 20000,
      status: "draft",
      totalCost: 18500,
      summary:
        "A perfect 3-day escape to Pokhara with lake views and mountain adventures",
      days: [
        {
          day: 1,
          date: new Date().toISOString().split("T")[0],
          title: "Arrival & Lake Exploration",
          estimatedCost: 6200,
          items: [
            {
              title: "Hotel Check-in",
              description: "Lakeview Haven - Private villa with sunrise deck",
              location: "Pokhara",
              time: "14:00",
              cost: 8400,
              type: "hotel",
              mapUrl:
                "https://www.google.com/maps/search/Lakeview+Haven+Pokhara",
            },
            {
              title: "Phewa Lake Sunset Walk",
              description: "Scenic lakeside walk with photo opportunities",
              location: "Phewa Lake, Pokhara",
              time: "17:00",
              cost: 0,
              type: "activity",
              mapUrl: "https://www.google.com/maps/search/Phewa+Lake+Pokhara",
            },
            {
              title: "Lakeside Grill Dinner",
              description: "Fresh grills with sunset views over Phewa",
              location: "Pokhara",
              time: "19:00",
              cost: 2300,
              type: "restaurant",
              mapUrl:
                "https://www.google.com/maps/search/Lakeside+Grill+Pokhara",
            },
          ],
        },
        {
          day: 2,
          date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          title: "Adventure Day",
          estimatedCost: 7300,
          items: [
            {
              title: "Paragliding Experience",
              description: "Tandem paragliding with certified guides",
              location: "Pokhara Valley",
              time: "08:00",
              cost: 3500,
              type: "activity",
              mapUrl: "https://www.google.com/maps/search/Paragliding+Pokhara",
            },
            {
              title: "Lakeside Grill (Lunch)",
              description: "Lunch break with local specialties",
              location: "Pokhara",
              time: "12:30",
              cost: 1800,
              type: "restaurant",
              mapUrl:
                "https://www.google.com/maps/search/Lakeside+Grill+Pokhara",
            },
            {
              title: "Sarangkot Viewpoint Trek",
              description: "Guided trek to the famous Sarangkot viewpoint",
              location: "Sarangkot, Pokhara",
              time: "15:00",
              cost: 1500,
              type: "guide",
              mapUrl: "https://www.google.com/maps/search/Sarangkot+Pokhara",
            },
          ],
        },
        {
          day: 3,
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          title: "Relaxation & Departure",
          estimatedCost: 5000,
          items: [
            {
              title: "Spa & Wellness",
              description: "Traditional Nepali spa treatment",
              location: "Pokhara",
              time: "09:00",
              cost: 2500,
              type: "activity",
              mapUrl: "https://www.google.com/maps/search/Spa+Pokhara",
            },
            {
              title: "Himalayan Table (Lunch)",
              description: "Traditional thali and Himalayan tasting menu",
              location: "Pokhara",
              time: "12:00",
              cost: 1950,
              type: "restaurant",
              mapUrl:
                "https://www.google.com/maps/search/Himalayan+Table+Pokhara",
            },
            {
              title: "Departure",
              description: "Checkout and drive to airport",
              location: "Pokhara Airport",
              time: "16:00",
              cost: 0,
              type: "travel",
              mapUrl: "https://www.google.com/maps/search/Pokhara+Airport",
            },
          ],
        },
      ],
    };

    setItinerary(mockItinerary);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">Itinerary not found</p>
        <Link href="/ai-planner">
          <Button className="mt-4" variant="default">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Planner
          </Button>
        </Link>
      </div>
    );
  }

  const totalDays = Math.ceil(
    (new Date(itinerary.endDate).getTime() -
      new Date(itinerary.startDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const spentPercentage = (itinerary.totalCost / itinerary.budget) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <Link href="/ai-planner">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Planner
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                {itinerary.title}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-lg text-muted-foreground">
                <MapPin className="h-5 w-5" />
                {itinerary.destination}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(itinerary.startDate).toLocaleDateString()} -{" "}
                {new Date(itinerary.endDate).toLocaleDateString()} ({totalDays}{" "}
                days)
              </p>
              <p className="mt-3 text-lg text-foreground">
                {itinerary.summary}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="text-2xl font-bold text-foreground">
                  NPR {itinerary.budget.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Spending</p>
                <p className="text-2xl font-bold text-primary">
                  NPR {itinerary.totalCost.toLocaleString()}
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {spentPercentage.toFixed(0)}% of budget
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="space-y-6">
          {itinerary.days.map((dayPlan) => (
            <Card key={dayPlan.day} className="overflow-hidden border-border">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Day {dayPlan.day} - {dayPlan.title}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(dayPlan.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="text-lg font-bold text-foreground">
                      NPR {dayPlan.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="space-y-4">
                  {dayPlan.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 rounded-lg border border-border bg-muted/20 p-4"
                    >
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary capitalize">
                            {item.type}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {item.time}
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-foreground">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {item.location}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <span className="font-semibold text-foreground">
                          {item.cost > 0
                            ? `NPR ${item.cost.toLocaleString()}`
                            : "Free"}
                        </span>
                        {item.mapUrl && (
                          <a
                            href={item.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2"
                          >
                            <Button size="sm" variant="outline">
                              <Navigation className="h-3 w-3" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="border-border">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Duration</p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {totalDays} Days
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Daily Average</p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                NPR{" "}
                {Math.round(itinerary.totalCost / totalDays).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Remaining Budget</p>
              <p className="mt-2 text-2xl font-bold text-green-600">
                NPR{" "}
                {Math.max(
                  0,
                  itinerary.budget - itinerary.totalCost,
                ).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button className="flex-1" variant="default" size="lg">
            Book This Itinerary
          </Button>
          <Button className="flex-1" variant="outline" size="lg">
            Save as Draft
          </Button>
        </div>
      </div>
    </div>
  );
}
