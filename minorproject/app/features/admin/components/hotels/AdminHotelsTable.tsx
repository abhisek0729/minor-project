"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Check,
  Clock3,
  ExternalLink,
  Eye,
  Globe,
  Hotel,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  Store,
  User,
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
import { Card, CardContent } from "@/components/ui/card";
import { updatePartnerApprovalStatus } from "../../actions/admin.action";

interface AdminHotelsTableProps {
  initialHotels: any[];
}

const PROVINCES = [
  "all",
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

const STATUSES = [
  { id: "all", label: "All Statuses" },
  { id: "approved", label: "Approved" },
  { id: "pending", label: "Pending" },
  { id: "rejected", label: "Rejected" },
  { id: "suspended", label: "Suspended" },
];

export default function AdminHotelsTable({
  initialHotels,
}: AdminHotelsTableProps) {
  const [hotels, setHotels] = useState(initialHotels || []);
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = hotels.filter((h) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (h.name && h.name.toLowerCase().includes(q)) ||
      (h.ownerName && h.ownerName.toLowerCase().includes(q)) ||
      (h.ownerEmail && h.ownerEmail.toLowerCase().includes(q)) ||
      (h.district && h.district.toLowerCase().includes(q)) ||
      (h.municipality && h.municipality.toLowerCase().includes(q));

    const matchesProvince =
      selectedProvince === "all" ||
      (h.province && h.province.toLowerCase().includes(selectedProvince.toLowerCase()));

    const matchesStatus =
      selectedStatus === "all" ||
      (h.approvalStatus && h.approvalStatus.toLowerCase() === selectedStatus.toLowerCase());

    return matchesSearch && matchesProvince && matchesStatus;
  });

  const handleStatusChange = (
    userId: number,
    status: "approved" | "rejected" | "suspended",
    name: string
  ) => {
    startTransition(async () => {
      setHotels((prev) =>
        prev.map((h) =>
          h.ownerId === userId ? { ...h, approvalStatus: status } : h
        )
      );

      if (selectedHotel && selectedHotel.ownerId === userId) {
        setSelectedHotel((prev: any) => ({ ...prev, approvalStatus: status }));
      }

      const res = await updatePartnerApprovalStatus(
        userId,
        "hotelOwner",
        status
      );

      if (res.success) {
        toast.success(`Status for "${name}" updated to ${status.toUpperCase()}!`);
      } else {
        toast.error(res.message);
        setHotels(initialHotels);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search hotels by name, district, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <p className="text-xs text-muted-foreground font-medium shrink-0">
          Showing {filtered.length} of {hotels.length} hotels
        </p>
      </div>

      {/* Filter Chips: Province & Status */}
      <div className="space-y-2">
        {/* Province Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
            Province:
          </span>
          {PROVINCES.map((prov) => (
            <button
              key={prov}
              onClick={() => setSelectedProvince(prov)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                selectedProvince === prov
                  ? "bg-foreground text-background border-foreground shadow-xs"
                  : "bg-card text-muted-foreground hover:text-foreground border-border"
              }`}
            >
              {prov === "all" ? "All Provinces" : `${prov} Province`}
            </button>
          ))}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
            Status:
          </span>
          {STATUSES.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                selectedStatus === st.id
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground border-border"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-16">Photo</TableHead>
              <TableHead>Hotel Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Owner Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                  No hotels found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((h) => (
                <TableRow key={h.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div
                      onClick={() => setSelectedHotel(h)}
                      className="relative size-12 rounded-lg overflow-hidden border bg-muted shrink-0 cursor-pointer group"
                    >
                      {h.coverImageUrl ? (
                        <Image
                          src={h.coverImageUrl}
                          alt={h.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Hotel className="size-5" />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setSelectedHotel(h)}
                      className="font-semibold text-sm leading-tight text-foreground hover:text-primary transition-colors text-left cursor-pointer"
                    >
                      {h.name}
                    </button>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      📞 {h.phoneNumber || "No phone"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs text-foreground font-medium">{h.district}, {h.province || "Nepal"}</div>
                    <div className="text-xs text-muted-foreground">{h.municipality || h.street}</div>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs font-medium text-foreground">{h.ownerName}</div>
                    <div className="text-xs text-muted-foreground">{h.ownerEmail}</div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={`text-xs font-semibold ${
                        h.approvalStatus === "approved"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : h.approvalStatus === "pending"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                      }`}
                    >
                      {h.approvalStatus}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedHotel(h)}
                        className="h-8 px-2 text-xs font-semibold gap-1 text-primary hover:bg-primary/10 cursor-pointer"
                        title="View Hotel Details Modal"
                      >
                        <Eye className="size-3.5" /> View
                      </Button>

                      {h.approvalStatus !== "approved" && (
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleStatusChange(h.ownerId, "approved", h.name)}
                          className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        >
                          <Check className="size-3.5 mr-1" /> Approve
                        </Button>
                      )}

                      {h.approvalStatus === "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleStatusChange(h.ownerId, "suspended", h.name)}
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
      {/* IN-PLACE ADMIN HOTEL DETAILS MODAL */}
      {/* ========================================================= */}
      {selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col border shadow-2xl rounded-3xl overflow-hidden bg-card">
            {/* Modal Header */}
            <div className="relative p-6 border-b bg-muted/20 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
                    <Hotel className="size-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-foreground leading-tight">
                        {selectedHotel.name}
                      </h2>
                      <Badge
                        className={`text-xs font-semibold ${
                          selectedHotel.approvalStatus === "approved"
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                            : selectedHotel.approvalStatus === "pending"
                            ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                            : "bg-red-500/15 text-red-600 border-red-500/30"
                        }`}
                      >
                        {selectedHotel.approvalStatus.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Hotel ID: #{selectedHotel.id} • Managed by {selectedHotel.ownerName}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedHotel(null)}
                  className="rounded-full size-8 shrink-0 hover:bg-muted cursor-pointer"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Hotel Photo Banner */}
              {selectedHotel.coverImageUrl ? (
                <div className="relative h-56 w-full rounded-2xl overflow-hidden border bg-muted shadow-xs">
                  <Image
                    src={selectedHotel.coverImageUrl}
                    alt={selectedHotel.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-0 text-xs">
                      📍 {selectedHotel.district}, {selectedHotel.province || "Nepal"}
                    </Badge>
                  </div>
                </div>
              ) : null}

              {/* Description Box */}
              <div className="p-4 rounded-2xl bg-muted/30 border space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  About the Property
                </span>
                <p className="text-xs text-foreground leading-relaxed">
                  {selectedHotel.description || "No detailed description provided by hotel owner."}
                </p>
              </div>

              {/* Property Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3.5 text-primary" /> Location & Region
                  </span>
                  <span className="font-bold text-foreground">
                    {selectedHotel.district}, {selectedHotel.province || "Nepal"}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Store className="size-3.5 text-primary" /> Street / Ward Address
                  </span>
                  <span className="font-bold text-foreground">
                    {selectedHotel.street || "Main Road"}, {selectedHotel.municipality || selectedHotel.district}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Phone className="size-3.5 text-primary" /> Front Desk Phone
                  </span>
                  <span className="font-bold text-foreground font-mono">
                    {selectedHotel.phoneNumber || "Not provided"}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="size-3.5 text-emerald-600" /> Platform Verification
                  </span>
                  <span className="font-bold text-emerald-600">
                    {selectedHotel.approvalStatus === "approved" ? "Verified Partner Listing" : "Pending Review"}
                  </span>
                </div>
              </div>

              {/* Owner / Account Information */}
              <div className="p-4 rounded-2xl bg-muted/50 border space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Owner Account & Contact
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Owner Name:</span>
                    <strong className="text-foreground">{selectedHotel.ownerName}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Owner Email:</span>
                    <strong className="text-foreground">{selectedHotel.ownerEmail}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Owner User ID:</span>
                    <span className="font-mono text-foreground font-semibold">#{selectedHotel.ownerId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Listing Public Page:</span>
                    <Link
                      href={`/hotels/${selectedHotel.id}`}
                      target="_blank"
                      className="text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      Open Public Hotel View <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-5 border-t bg-card flex items-center justify-between gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => setSelectedHotel(null)}
                className="text-xs rounded-xl cursor-pointer"
              >
                Close View
              </Button>

              <div className="flex items-center gap-2">
                {selectedHotel.approvalStatus !== "approved" ? (
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() =>
                      handleStatusChange(
                        selectedHotel.ownerId,
                        "approved",
                        selectedHotel.name
                      )
                    }
                    className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
                  >
                    <Check className="size-3.5" /> Approve Listing
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() =>
                      handleStatusChange(
                        selectedHotel.ownerId,
                        "suspended",
                        selectedHotel.name
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
