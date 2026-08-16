"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ExternalLink, Hotel, Search } from "lucide-react";
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
import { updatePartnerApprovalStatus } from "../../actions/admin.action";

interface AdminHotelsTableProps {
  initialHotels: any[];
}

export default function AdminHotelsTable({
  initialHotels,
}: AdminHotelsTableProps) {
  const [hotels, setHotels] = useState(initialHotels || []);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = hotels.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      h.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
      h.district.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search hotels by name, district, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
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
                    <div className="relative size-12 rounded-lg overflow-hidden border bg-muted shrink-0">
                      {h.coverImageUrl ? (
                        <Image
                          src={h.coverImageUrl}
                          alt={h.name}
                          fill
                          className="object-cover"
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
                    <div className="font-semibold text-sm leading-tight text-foreground">
                      {h.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      📞 {h.phoneNumber}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs text-foreground font-medium">{h.district}, {h.province}</div>
                    <div className="text-xs text-muted-foreground">{h.municipality}</div>
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
                      <Link href={`/hotels/${h.id}`} target="_blank">
                        <Button variant="ghost" size="icon" className="size-8" title="View Public Page">
                          <ExternalLink className="size-3.5" />
                        </Button>
                      </Link>

                      {h.approvalStatus !== "approved" && (
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleStatusChange(h.ownerId, "approved", h.name)}
                          className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
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
                          className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10"
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
    </div>
  );
}
