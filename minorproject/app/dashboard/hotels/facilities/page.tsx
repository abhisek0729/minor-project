"use client";

import { useState } from "react";
import {
  Car,
  CheckCircle2,
  Coffee,
  Dumbbell,
  Hotel,
  Mountain,
  Plane,
  Save,
  ShieldCheck,
  Sparkles,
  Tv,
  Utensils,
  Wifi,
  Wind,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const availableFacilities = [
  { id: "wifi", name: "High-Speed WiFi", icon: Wifi, category: "Connectivity", enabled: true },
  { id: "mountain_view", name: "Himalayan Mountain View", icon: Mountain, category: "Views", enabled: true },
  { id: "restaurant", name: "In-House Restaurant & Bar", icon: Utensils, category: "Dining", enabled: true },
  { id: "room_service", name: "24/7 Room Service", icon: Coffee, category: "Service", enabled: true },
  { id: "free_parking", name: "Free Secure Parking", icon: Car, category: "Transport", enabled: true },
  { id: "ac", name: "Climate Control / AC", icon: Wind, category: "Room Comfort", enabled: true },
  { id: "smart_tv", name: "Smart TV & Streaming", icon: Tv, category: "Entertainment", enabled: false },
  { id: "airport_shuttle", name: "Airport Pickup & Drop", icon: Plane, category: "Transport", enabled: false },
  { id: "fitness_center", name: "Fitness & Yoga Deck", icon: Dumbbell, category: "Wellness", enabled: false },
  { id: "spa", name: "Himalayan Ayurvedic Spa", icon: Sparkles, category: "Wellness", enabled: false },
];

export default function HotelFacilitiesPage() {
  const [facilities, setFacilities] = useState(availableFacilities);
  const [isSaving, setIsSaving] = useState(false);

  const toggleFacility = (id: string) => {
    setFacilities((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      const activeCount = facilities.filter((f) => f.enabled).length;
      toast.success(`Hotel amenities updated! ${activeCount} facilities active.`);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hotel Facilities & Amenities</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select the amenities and property features available to guests at your hotel.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="font-semibold gap-2 shadow-xs cursor-pointer"
        >
          <Save className="size-4" />
          {isSaving ? "Saving..." : "Save Amenities"}
        </Button>
      </div>

      {/* Facilities Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((facility) => {
          const Icon = facility.icon;
          return (
            <Card
              key={facility.id}
              onClick={() => toggleFacility(facility.id)}
              className={`p-4 border transition-all cursor-pointer select-none relative overflow-hidden ${
                facility.enabled
                  ? "border-primary/50 bg-primary/5 shadow-2xs"
                  : "border-border bg-card/60 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center transition-colors ${
                      facility.enabled
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{facility.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{facility.category}</p>
                  </div>
                </div>

                <Badge
                  variant={facility.enabled ? "default" : "outline"}
                  className="text-[10px] shrink-0"
                >
                  {facility.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              <div className="mt-3 pt-2.5 border-t flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Click card to toggle</span>
                {facility.enabled && (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Active on Listing
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
