"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Check,
  Clock3,
  ExternalLink,
  Eye,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  Store,
  User,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { updatePartnerApprovalStatus } from "../../actions/admin.action";

interface AdminRestaurantsTableProps {
  initialRestaurants: any[];
}

export default function AdminRestaurantsTable({
  initialRestaurants,
}: AdminRestaurantsTableProps) {
  const [restaurants, setRestaurants] = useState(initialRestaurants || []);
  const [search, setSearch] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      r.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = (
    userId: number,
    status: "approved" | "rejected" | "suspended",
    name: string
  ) => {
    startTransition(async () => {
      setRestaurants((prev) =>
        prev.map((r) =>
          r.ownerId === userId ? { ...r, approvalStatus: status } : r
        )
      );

      if (selectedRestaurant && selectedRestaurant.ownerId === userId) {
        setSelectedRestaurant((prev: any) => ({ ...prev, approvalStatus: status }));
      }

      const res = await updatePartnerApprovalStatus(
        userId,
        "restaurantOwner",
        status
      );

      if (res.success) {
        toast.success(`Status for "${name}" updated to ${status.toUpperCase()}!`);
      } else {
        toast.error(res.message);
        setRestaurants(initialRestaurants);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search restaurants by name, cuisine, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          Total: {filtered.length} restaurant{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-16">Photo</TableHead>
              <TableHead>Restaurant Name</TableHead>
              <TableHead>Cuisine</TableHead>
              <TableHead>Owner Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                  No restaurants found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div
                      onClick={() => setSelectedRestaurant(r)}
                      className="relative size-12 rounded-lg overflow-hidden border bg-muted shrink-0 cursor-pointer group"
                    >
                      {r.restaurantImageUrl ? (
                        <Image
                          src={r.restaurantImageUrl}
                          alt={r.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <UtensilsCrossed className="size-5" />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setSelectedRestaurant(r)}
                      className="font-semibold text-sm leading-tight text-foreground hover:text-primary transition-colors text-left cursor-pointer"
                    >
                      {r.name}
                    </button>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      📍 {r.location || "Nepal"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="text-xs font-medium">
                      {r.cuisine || "Multi-Cuisine"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs font-medium text-foreground">{r.ownerName}</div>
                    <div className="text-xs text-muted-foreground">{r.ownerEmail}</div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={`text-xs font-semibold ${
                        r.approvalStatus === "approved"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : r.approvalStatus === "pending"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                      }`}
                    >
                      {r.approvalStatus}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRestaurant(r)}
                        className="h-8 px-2 text-xs font-semibold gap-1 text-primary hover:bg-primary/10 cursor-pointer"
                        title="View Restaurant Details Modal"
                      >
                        <Eye className="size-3.5" /> View
                      </Button>

                      {r.approvalStatus !== "approved" && (
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleStatusChange(r.ownerId, "approved", r.name)}
                          className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        >
                          <Check className="size-3.5 mr-1" /> Approve
                        </Button>
                      )}

                      {r.approvalStatus === "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleStatusChange(r.ownerId, "suspended", r.name)}
                          className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          Suspend
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ========================================================= */}
      {/* IN-PLACE ADMIN RESTAURANT DETAILS MODAL */}
      {/* ========================================================= */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col border shadow-2xl rounded-3xl overflow-hidden bg-card">
            {/* Modal Header */}
            <div className="relative p-6 border-b bg-muted/20 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 shrink-0">
                    <UtensilsCrossed className="size-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-foreground leading-tight">
                        {selectedRestaurant.name}
                      </h2>
                      <Badge
                        className={`text-xs font-semibold ${
                          selectedRestaurant.approvalStatus === "approved"
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                            : selectedRestaurant.approvalStatus === "pending"
                            ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                            : "bg-red-500/15 text-red-600 border-red-500/30"
                        }`}
                      >
                        {selectedRestaurant.approvalStatus.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Restaurant ID: #{selectedRestaurant.id} • Managed by {selectedRestaurant.ownerName}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedRestaurant(null)}
                  className="rounded-full size-8 shrink-0 hover:bg-muted cursor-pointer"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {selectedRestaurant.restaurantImageUrl ? (
                <div className="relative h-56 w-full rounded-2xl overflow-hidden border bg-muted shadow-xs">
                  <Image
                    src={selectedRestaurant.restaurantImageUrl}
                    alt={selectedRestaurant.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-0 text-xs">
                      🍽️ {selectedRestaurant.cuisine || "Multi-Cuisine"}
                    </Badge>
                  </div>
                </div>
              ) : null}

              <div className="p-4 rounded-2xl bg-muted/30 border space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Description
                </span>
                <p className="text-xs text-foreground leading-relaxed">
                  {selectedRestaurant.description || "No detailed description provided."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3.5 text-primary" /> Location & Neighborhood
                  </span>
                  <span className="font-bold text-foreground">
                    {selectedRestaurant.location || "Nepal"}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <UtensilsCrossed className="size-3.5 text-amber-600" /> Cuisine Category
                  </span>
                  <span className="font-bold text-foreground">
                    {selectedRestaurant.cuisine || "Nepali & Continental"}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock3 className="size-3.5 text-primary" /> Operating Hours
                  </span>
                  <span className="font-bold text-foreground font-mono">
                    {selectedRestaurant.openingTime || "08:00 AM"} – {selectedRestaurant.closingTime || "10:00 PM"}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="size-3.5 text-emerald-600" /> Platform Verification
                  </span>
                  <span className="font-bold text-emerald-600">
                    {selectedRestaurant.approvalStatus === "approved" ? "Verified Dining Partner" : "Pending Review"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/50 border space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Owner Account & Contact
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Owner Name:</span>
                    <strong className="text-foreground">{selectedRestaurant.ownerName}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Owner Email:</span>
                    <strong className="text-foreground">{selectedRestaurant.ownerEmail}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Owner User ID:</span>
                    <span className="font-mono text-foreground font-semibold">#{selectedRestaurant.ownerId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Listing Public Page:</span>
                    <Link
                      href={`/restaurants/${selectedRestaurant.id}`}
                      target="_blank"
                      className="text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      Open Public Menu View <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-5 border-t bg-card flex items-center justify-between gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => setSelectedRestaurant(null)}
                className="text-xs rounded-xl cursor-pointer"
              >
                Close View
              </Button>

              <div className="flex items-center gap-2">
                {selectedRestaurant.approvalStatus !== "approved" ? (
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() =>
                      handleStatusChange(
                        selectedRestaurant.ownerId,
                        "approved",
                        selectedRestaurant.name
                      )
                    }
                    className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
                  >
                    <Check className="size-3.5" /> Approve Restaurant
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() =>
                      handleStatusChange(
                        selectedRestaurant.ownerId,
                        "suspended",
                        selectedRestaurant.name
                      )
                    }
                    className="text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl cursor-pointer"
                  >
                    <ShieldAlert className="size-3.5" /> Suspend Listing
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
