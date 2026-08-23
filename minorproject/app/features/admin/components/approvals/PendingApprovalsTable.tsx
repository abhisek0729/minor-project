"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Award,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  ExternalLink,
  Eye,
  Filter,
  Globe,
  Hotel,
  Languages,
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
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  const sortedItems = [...filteredItems].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.created_at || a.updatedAt || 0).getTime();
    const timeB = new Date(b.createdAt || b.created_at || b.updatedAt || 0).getTime();
    return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
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

      setSelectedItem(null);

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
            className="pl-9 h-10 bg-card rounded-2xl"
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

          {/* Time Ordering Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
            className="rounded-full text-xs font-semibold h-8 gap-1 cursor-pointer border-border hover:bg-muted"
            title={`Toggle Time Sorting: Currently ${sortOrder === "asc" ? "Ascending (Oldest First)" : "Descending (Newest First)"}`}
          >
            <Clock3 className="size-3.5 text-primary" />
            <span>Time: {sortOrder === "asc" ? "Ascending ▴" : "Descending ▾"}</span>
          </Button>
        </div>
      </div>

      {/* Requests List */}
      {sortedItems.length === 0 ? (
        <Card className="border-dashed bg-muted/10 p-12 text-center rounded-3xl">
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
          {sortedItems.map((item, index) => (
            <Card
              key={`${item.itemType}-${item.userId}-${item.businessName || ""}-${index}`}
              className="overflow-hidden border shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between rounded-3xl bg-card"
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
                        <User className="size-3.5 text-primary" /> Owner:
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
              <div className="p-5 pt-0 border-t space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItem(item)}
                  className="w-full text-xs font-semibold rounded-xl gap-1.5 cursor-pointer"
                >
                  <Eye className="size-3.5 text-primary" /> Inspect Full Application Details
                </Button>

                <div className="flex items-center gap-2">
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
                    <Check className="size-4" /> Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* FULL APPLICATION INSPECT MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-card border rounded-3xl overflow-hidden shadow-2xl space-y-0 max-h-[90vh] flex flex-col">
            {/* Modal Header Cover */}
            <div className="relative h-48 sm:h-56 w-full bg-muted overflow-hidden shrink-0">
              {selectedItem.businessImage ? (
                <Image
                  src={selectedItem.businessImage}
                  alt={selectedItem.businessName || "Business"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                  <Building2 className="size-12 opacity-30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Badge
                  className={
                    selectedItem.itemType === "Restaurant"
                      ? "bg-amber-500 text-white font-bold text-xs"
                      : selectedItem.itemType === "Hotel"
                      ? "bg-blue-600 text-white font-bold text-xs"
                      : "bg-emerald-600 text-white font-bold text-xs"
                  }
                >
                  {selectedItem.itemType} Application
                </Badge>

                <Badge
                  variant="outline"
                  className="bg-black/60 text-amber-400 border-amber-500/40 text-xs backdrop-blur-md font-semibold"
                >
                  <Clock3 className="size-3 mr-1" /> Pending Review
                </Badge>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-2xl font-extrabold tracking-tight drop-shadow-md">
                  {selectedItem.businessName || selectedItem.ownerName}
                </h2>
                <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3 text-primary" />
                  {selectedItem.businessLocation || "Nepal"}
                </p>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {/* Detailed Description */}
              {selectedItem.businessDescription && (
                <div className="space-y-1.5">
                  <span className="font-bold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                    Business / Profile Overview
                  </span>
                  <p className="p-3.5 rounded-2xl bg-muted/40 border text-foreground leading-relaxed">
                    {selectedItem.businessDescription}
                  </p>
                </div>
              )}

              {/* Onboarding Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Specifics for Hotels */}
                {selectedItem.itemType === "Hotel" && (
                  <>
                    {selectedItem.establishedYear && (
                      <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3.5 text-primary" /> Established Year
                        </span>
                        <span className="font-bold text-foreground text-sm">{selectedItem.establishedYear}</span>
                      </div>
                    )}
                    {selectedItem.website && (
                      <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Globe className="size-3.5 text-primary" /> Website
                        </span>
                        <a href={selectedItem.website} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline truncate block">
                          {selectedItem.website}
                        </a>
                      </div>
                    )}
                    {selectedItem.province && (
                      <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="size-3.5 text-primary" /> State / Province
                        </span>
                        <span className="font-bold text-foreground">{selectedItem.province}, {selectedItem.district}</span>
                      </div>
                    )}
                    {selectedItem.street && (
                      <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Store className="size-3.5 text-primary" /> Street Address
                        </span>
                        <span className="font-bold text-foreground">{selectedItem.street}, {selectedItem.municipality}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Specifics for Restaurants */}
                {selectedItem.itemType === "Restaurant" && (
                  <>
                    {selectedItem.cuisine && (
                      <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <UtensilsCrossed className="size-3.5 text-amber-500" /> Cuisine Category
                        </span>
                        <span className="font-bold text-foreground text-sm">{selectedItem.cuisine}</span>
                      </div>
                    )}
                    {(selectedItem.openingTime || selectedItem.closingTime) && (
                      <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock3 className="size-3.5 text-primary" /> Operating Hours
                        </span>
                        <span className="font-bold text-foreground">{selectedItem.openingTime || "09:00 AM"} – {selectedItem.closingTime || "10:00 PM"}</span>
                      </div>
                    )}
                    {selectedItem.establishedDate && (
                      <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3.5 text-primary" /> Established Date
                        </span>
                        <span className="font-bold text-foreground">{selectedItem.establishedDate}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Specifics for Tour Guides */}
                {selectedItem.itemType === "Tour Guide" && (
                  <>
                    {selectedItem.dailyRate && (
                      <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Compass className="size-3.5 text-emerald-600" /> Daily Tour Rate
                        </span>
                        <span className="font-bold text-emerald-600 text-sm">NPR {selectedItem.dailyRate.toLocaleString()} / day</span>
                      </div>
                    )}
                    {selectedItem.languages && (
                      <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Languages className="size-3.5 text-primary" /> Languages Spoken
                        </span>
                        <span className="font-bold text-foreground">{selectedItem.languages}</span>
                      </div>
                    )}
                    {selectedItem.experienceYears && (
                      <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Award className="size-3.5 text-amber-500" /> Guiding Experience
                        </span>
                        <span className="font-bold text-foreground">{selectedItem.experienceYears} Years</span>
                      </div>
                    )}
                    {selectedItem.licenseNumber && (
                      <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <ShieldCheck className="size-3.5 text-primary" /> License Number
                        </span>
                        <span className="font-mono font-bold text-foreground">{selectedItem.licenseNumber}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Owner Contact Information Box */}
              <div className="p-4 rounded-2xl bg-muted/50 border space-y-2">
                <span className="font-bold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                  Applicant & Owner Contacts
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Full Name:</span>
                    <strong className="text-foreground">{selectedItem.ownerName}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Email Address:</span>
                    <strong className="text-foreground">{selectedItem.ownerEmail}</strong>
                  </div>
                  {selectedItem.businessPhone && (
                    <div>
                      <span className="text-muted-foreground block">Contact Phone:</span>
                      <strong className="text-foreground">{selectedItem.businessPhone}</strong>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground block">Application Date:</span>
                    <strong className="text-foreground">
                      {selectedItem.userCreatedAt
                        ? new Date(selectedItem.userCreatedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Recent"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-5 border-t bg-card flex items-center justify-between gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => setSelectedItem(null)}
                className="text-xs rounded-xl cursor-pointer"
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  disabled={isPending}
                  onClick={() =>
                    handleAction(
                      selectedItem.userId,
                      selectedItem.roleName,
                      "rejected",
                      selectedItem.businessName || selectedItem.ownerName
                    )
                  }
                  className="font-bold text-xs gap-1.5 rounded-xl cursor-pointer"
                >
                  <X className="size-4" /> Reject Application
                </Button>

                <Button
                  disabled={isPending}
                  onClick={() =>
                    handleAction(
                      selectedItem.userId,
                      selectedItem.roleName,
                      "approved",
                      selectedItem.businessName || selectedItem.ownerName
                    )
                  }
                  className="font-bold text-xs gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                >
                  <Check className="size-4" /> Approve Partner Workspace
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
