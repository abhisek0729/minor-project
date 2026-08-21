"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Award,
  Calendar,
  CheckCircle2,
  Compass,
  Eye,
  Languages,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  Shield,
  ShieldCheck,
  Star,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deletePartnerWorkspaceAction } from "../../actions/admin.action";

interface AdminGuidesTableProps {
  initialGuides: any[];
}

export default function AdminGuidesTable({ initialGuides }: AdminGuidesTableProps) {
  const [guides, setGuides] = useState<any[]>(initialGuides || []);
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");
  const [selectedGuide, setSelectedGuide] = useState<any | null>(null);
  const [deletingGuide, setDeletingGuide] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredGuides = guides.filter((g) => {
    const q = search.toLowerCase();
    const matchesSearch =
      g.name.toLowerCase().includes(q) ||
      g.location.toLowerCase().includes(q) ||
      (g.ownerEmail && g.ownerEmail.toLowerCase().includes(q)) ||
      (g.languages && g.languages.toLowerCase().includes(q)) ||
      (g.licenseNumber && g.licenseNumber.toLowerCase().includes(q));

    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && g.isAvailable) ||
      (availabilityFilter === "unavailable" && !g.isAvailable);

    return matchesSearch && matchesAvailability;
  });

  const handleDelete = () => {
    if (!deletingGuide) return;
    startTransition(async () => {
      const res = await deletePartnerWorkspaceAction("guide", deletingGuide.id, deletingGuide.userId);
      if (res.success) {
        toast.success(res.message);
        setGuides((prev) => prev.filter((g) => g.id !== deletingGuide.id));
        setDeletingGuide(null);
        setSelectedGuide(null);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by guide name, language, license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card rounded-2xl"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAvailabilityFilter("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
              availabilityFilter === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card text-muted-foreground hover:text-foreground border-border"
            }`}
          >
            All Guides ({guides.length})
          </button>
          <button
            onClick={() => setAvailabilityFilter("available")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
              availabilityFilter === "available"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card text-muted-foreground hover:text-foreground border-border"
            }`}
          >
            Available Now ({guides.filter((g) => g.isAvailable).length})
          </button>
          <button
            onClick={() => setAvailabilityFilter("unavailable")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
              availabilityFilter === "unavailable"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card text-muted-foreground hover:text-foreground border-border"
            }`}
          >
            Busy / Inactive ({guides.filter((g) => !g.isAvailable).length})
          </button>
        </div>
      </div>

      {/* Guides Directory Table */}
      {filteredGuides.length === 0 ? (
        <Card className="border-dashed bg-muted/10 p-12 text-center rounded-3xl">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-3">
            <Compass className="size-7" />
          </div>
          <h3 className="text-lg font-semibold">No tour guides found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {search
              ? "No certified guides matched your search keyword."
              : "All registered tour and mountain guides will appear in this directory."}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden border shadow-xs rounded-3xl bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[280px]">Guide & Profile</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Experience & Languages</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuides.map((guide) => (
                <TableRow key={guide.id} className="hover:bg-muted/30">
                  {/* Guide Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 rounded-2xl overflow-hidden bg-muted shrink-0 border">
                        {guide.guideImageUrl ? (
                          <Image
                            src={guide.guideImageUrl}
                            alt={guide.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Compass className="size-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-foreground flex items-center gap-1.5">
                          {guide.name}
                          {guide.approvalStatus === "approved" && (
                            <ShieldCheck className="size-4 text-emerald-600" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="size-3" /> {guide.ownerEmail}
                        </div>
                        {guide.licenseNumber && (
                          <span className="font-mono text-[10px] text-primary block mt-0.5">
                            Lic: {guide.licenseNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    <div className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary shrink-0" />
                      {guide.location}
                    </div>
                    {guide.phoneNumber && (
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="size-3" /> {guide.phoneNumber}
                      </div>
                    )}
                  </TableCell>

                  {/* Experience & Languages */}
                  <TableCell>
                    <div className="space-y-0.5 text-xs">
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        <Award className="size-3.5 text-amber-500" />
                        {guide.experienceYears || 1} Years Experience
                      </div>
                      <div className="text-muted-foreground text-[11px] flex items-center gap-1">
                        <Languages className="size-3" />
                        {guide.languages || "Nepali, English"}
                      </div>
                    </div>
                  </TableCell>

                  {/* Daily Rate */}
                  <TableCell>
                    <span className="font-bold text-sm text-foreground">
                      NPR {guide.dailyRate ? guide.dailyRate.toLocaleString() : "2,000"}
                    </span>
                    <span className="text-[11px] text-muted-foreground block">/ day</span>
                  </TableCell>

                  {/* Availability */}
                  <TableCell>
                    <Badge
                      className={
                        guide.isAvailable
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-semibold"
                          : "bg-muted text-muted-foreground text-xs"
                      }
                    >
                      {guide.isAvailable ? "Available" : "Busy / Inactive"}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedGuide(guide)}
                        className="h-8 px-2 text-xs font-semibold rounded-xl gap-1 text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        <Eye className="size-3.5" /> Details
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingGuide(guide)}
                        className="h-8 px-2 text-xs font-semibold rounded-xl gap-1 text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" /> Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* VIEW GUIDE DETAILS MODAL */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-card border rounded-3xl overflow-hidden shadow-2xl space-y-0 max-h-[90vh] flex flex-col">
            {/* Header Banner */}
            <div className="relative h-48 w-full bg-muted overflow-hidden shrink-0">
              {selectedGuide.guideImageUrl ? (
                <Image
                  src={selectedGuide.guideImageUrl}
                  alt={selectedGuide.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                  <Compass className="size-12 opacity-30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <button
                onClick={() => setSelectedGuide(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-1.5">
                  <Badge className="bg-emerald-600 text-white text-xs font-bold">
                    Tour Guide
                  </Badge>
                  {selectedGuide.isAvailable && (
                    <Badge className="bg-emerald-500 text-white text-[10px]">Active</Badge>
                  )}
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight drop-shadow-md mt-1">
                  {selectedGuide.name}
                </h2>
                <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3 text-primary" /> {selectedGuide.location}
                </p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {selectedGuide.description && (
                <div className="space-y-1">
                  <span className="font-bold text-foreground uppercase tracking-wider text-muted-foreground text-[11px]">
                    Biography & Overview
                  </span>
                  <p className="p-3 rounded-2xl bg-muted/40 border leading-relaxed text-foreground">
                    {selectedGuide.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                  <span className="text-muted-foreground text-[11px]">Daily Tour Rate</span>
                  <span className="font-bold text-sm text-emerald-600 block">
                    NPR {selectedGuide.dailyRate?.toLocaleString() || "2,000"} / day
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                  <span className="text-muted-foreground text-[11px]">Guiding Experience</span>
                  <span className="font-bold text-sm text-foreground block">
                    {selectedGuide.experienceYears || 1} Years
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                  <span className="text-muted-foreground text-[11px]">Languages Spoken</span>
                  <span className="font-semibold text-foreground block truncate">
                    {selectedGuide.languages || "Nepali, English"}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                  <span className="text-muted-foreground text-[11px]">License Number</span>
                  <span className="font-mono font-bold text-foreground block">
                    {selectedGuide.licenseNumber || "N/A"}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 rounded-2xl bg-muted/50 border space-y-2">
                <span className="font-bold text-foreground uppercase tracking-wider text-muted-foreground text-[11px]">
                  Guide Contact Information
                </span>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account Email:</span>
                    <strong className="text-foreground">{selectedGuide.ownerEmail}</strong>
                  </div>
                  {selectedGuide.phoneNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Direct Phone:</span>
                      <strong className="text-foreground">{selectedGuide.phoneNumber}</strong>
                    </div>
                  )}
                  {selectedGuide.createdAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Joined Platform:</span>
                      <strong className="text-foreground">
                        {new Date(selectedGuide.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t bg-card flex items-center justify-between shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedGuide(null)}
                className="rounded-xl cursor-pointer"
              >
                Close
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDeletingGuide(selectedGuide);
                  setSelectedGuide(null);
                }}
                className="gap-1.5 rounded-xl cursor-pointer"
              >
                <Trash2 className="size-3.5" /> Remove Workspace
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE GUIDE CONFIRMATION MODAL */}
      {deletingGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-500/10">
                <Trash2 className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Remove Guide Workspace</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete the guide profile for{" "}
              <strong className="text-foreground">{deletingGuide.name}</strong>? All their packages
              and calendar bookings will be removed from the platform.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => setDeletingGuide(null)}
                className="rounded-xl cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={handleDelete}
                className="rounded-xl gap-1.5 font-semibold cursor-pointer"
              >
                {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                Confirm & Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
