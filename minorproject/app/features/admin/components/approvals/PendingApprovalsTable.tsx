"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  ExternalLink,
  Filter,
  Hotel,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Store,
  User,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updatePartnerApprovalStatus } from "../../actions/admin.action";

interface PendingApprovalsTableProps {
  initialRestaurants: any[];
  initialHotels: any[];
  initialGuides?: any[];
}

export default function PendingApprovalsTable({
  initialRestaurants,
  initialHotels,
  initialGuides = [],
}: PendingApprovalsTableProps) {
  const [restaurants, setRestaurants] = useState<any[]>(initialRestaurants || []);
  const [hotels, setHotels] = useState<any[]>(initialHotels || []);
  const [guides, setGuides] = useState<any[]>(initialGuides || []);
  const [filterType, setFilterType] = useState<"all" | "restaurant" | "hotel" | "guide">("all");
  const [search, setSearch] = useState("");

  const [isPending, startTransition] = useTransition();

  const allItems = [
    ...restaurants.map((r) => ({ ...r, roleName: "restaurantOwner" as const, itemType: "Restaurant" })),
    ...hotels.map((h) => ({ ...h, roleName: "hotelOwner" as const, itemType: "Hotel" })),
    ...guides.map((g) => ({ ...g, roleName: "guide" as const, itemType: "Tour Guide" })),
  ];

  const filteredItems = allItems.filter((item) => {
    const matchesType =
      filterType === "all" ||
      (filterType === "restaurant" && item.itemType === "Restaurant") ||
      (filterType === "hotel" && item.itemType === "Hotel") ||
      (filterType === "guide" && item.itemType === "Tour Guide");

    const matchesSearch =
      (item.businessName && item.businessName.toLowerCase().includes(search.toLowerCase())) ||
      (item.ownerName && item.ownerName.toLowerCase().includes(search.toLowerCase())) ||
      (item.ownerEmail && item.ownerEmail.toLowerCase().includes(search.toLowerCase())) ||
      (item.cuisine && item.cuisine.toLowerCase().includes(search.toLowerCase())) ||
      (item.languages && item.languages.toLowerCase().includes(search.toLowerCase()));

    return matchesType && matchesSearch;
  });

  const handleAction = (
    userId: number,
    roleName: "restaurantOwner" | "hotelOwner" | "guide",
    action: "approved" | "rejected",
    businessName: string
  ) => {
    startTransition(async () => {
      // Optimistic update
      if (roleName === "restaurantOwner") {
        setRestaurants((prev) => prev.filter((r) => r.userId !== userId));
      } else if (roleName === "hotelOwner") {
        setHotels((prev) => prev.filter((h) => h.userId !== userId));
      } else if (roleName === "guide") {
        setGuides((prev) => prev.filter((g) => g.userId !== userId));
      }

      const res = await updatePartnerApprovalStatus(userId, roleName, action);
      if (res.success) {
        toast.success(
          `${businessName} (${roleName === "restaurantOwner" ? "Restaurant" : roleName === "hotelOwner" ? "Hotel" : "Tour Guide"}) has been ${action}!`
        );
      } else {
        // Rollback
        toast.error(res.message);
        setRestaurants(initialRestaurants);
        setHotels(initialHotels);
        setGuides(initialGuides);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by business, guide or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
              filterType === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card text-muted-foreground hover:text-foreground border-border"
            }`}
          >
            All Pending ({allItems.length})
          </button>
          <button
            onClick={() => setFilterType("restaurant")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
              filterType === "restaurant"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card text-muted-foreground hover:text-foreground border-border"
            }`}
          >
            Restaurants ({restaurants.length})
          </button>
          <button
            onClick={() => setFilterType("hotel")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
              filterType === "hotel"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card text-muted-foreground hover:text-foreground border-border"
            }`}
          >
            Hotels ({hotels.length})
          </button>
          <button
            onClick={() => setFilterType("guide")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
              filterType === "guide"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card text-muted-foreground hover:text-foreground border-border"
            }`}
          >
            Tour Guides ({guides.length})
          </button>
        </div>
      </div>

      {/* Requests List */}
      {filteredItems.length === 0 ? (
        <Card className="border-dashed bg-muted/10 p-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3">
            <CheckCircle2 className="size-7" />
          </div>
          <h3 className="text-lg font-semibold">No pending approval requests</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {search
              ? "No pending requests matched your search query."
              : "All partner registrations (Hotels, Restaurants, Tour Guides) have been reviewed and verified. Good job!"}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card
              key={`${item.itemType}-${item.userId}`}
              className="overflow-hidden border shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between rounded-2xl"
            >
              <div>
                {/* Header Banner with Business Image & Type */}
                <div className="relative h-44 w-full bg-muted overflow-hidden">
                  {item.businessImage ? (
                    <Image
                      src={item.businessImage}
                      alt={item.businessName || "Business"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                      {item.itemType === "Restaurant" ? (
                        <UtensilsCrossed className="size-10 opacity-30" />
                      ) : item.itemType === "Hotel" ? (
                        <Hotel className="size-10 opacity-30" />
                      ) : (
                        <Compass className="size-10 opacity-30" />
                      )}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Business Type Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge
                      className={
                        item.itemType === "Restaurant"
                          ? "bg-amber-500 text-white font-bold text-xs"
                          : item.itemType === "Hotel"
                          ? "bg-blue-600 text-white font-bold text-xs"
                          : "bg-emerald-600 text-white font-bold text-xs"
                      }
                    >
                      {item.itemType === "Restaurant" ? (
                        <UtensilsCrossed className="size-3 mr-1" />
                      ) : item.itemType === "Hotel" ? (
                        <Hotel className="size-3 mr-1" />
                      ) : (
                        <Compass className="size-3 mr-1" />
                      )}
                      {item.itemType} Partner
                    </Badge>
                  </div>

                  {/* Status Pill */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="outline"
                      className="bg-black/60 text-amber-400 border-amber-500/40 text-xs backdrop-blur-md font-semibold"
                    >
                      <Clock3 className="size-3 mr-1" />
                      Pending Approval
                    </Badge>
                  </div>

                  {/* Title & Location on image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-xl font-bold line-clamp-1 drop-shadow-sm">
                      {item.businessName || `${item.ownerName}'s ${item.itemType}`}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-1">
                      {item.cuisine
                        ? `${item.cuisine} Cuisine`
                        : item.dailyRate
                        ? `NPR ${item.dailyRate.toLocaleString()} / day • ${item.languages || "Local Guide"}`
                        : item.businessLocation || "Nepal"}
                    </p>
                  </div>
                </div>

                {/* Details Section */}
                <CardContent className="p-5 space-y-3 text-xs">
                  {item.businessDescription && (
                    <p className="text-muted-foreground line-clamp-2 leading-relaxed italic">
                      "{item.businessDescription}"
                    </p>
                  )}

                  <div className="space-y-1.5 pt-1 border-t">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <User className="size-3.5 text-primary" /> Name:
                      </span>
                      <span className="font-semibold text-foreground">{item.ownerName}</span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Mail className="size-3.5 text-primary" /> Email:
                      </span>
                      <span className="font-semibold text-foreground">{item.ownerEmail}</span>
                    </div>

                    {item.businessPhone && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-3.5 text-primary" /> Phone:
                        </span>
                        <span className="font-semibold text-foreground">{item.businessPhone}</span>
                      </div>
                    )}

                    {item.businessLocation && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-primary" /> Location:
                        </span>
                        <span className="font-semibold text-foreground line-clamp-1 max-w-[200px] text-right">
                          {item.businessLocation}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 border-t flex items-center gap-3">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    handleAction(
                      item.userId,
                      item.roleName,
                      "rejected",
                      item.businessName || item.ownerName
                    )
                  }
                  className="w-1/2 gap-1.5 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  <X className="size-4" /> Reject
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    handleAction(
                      item.userId,
                      item.roleName,
                      "approved",
                      item.businessName || item.ownerName
                    )
                  }
                  className="w-1/2 gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs rounded-xl cursor-pointer"
                >
                  <Check className="size-4" /> Approve Partner
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
