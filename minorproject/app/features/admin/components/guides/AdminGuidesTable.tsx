"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Check,
  Compass,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Star,
  User,
  X,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updatePartnerApprovalStatus } from "../../actions/admin.action";

interface AdminGuidesTableProps {
  initialGuides: any[];
}

export default function AdminGuidesTable({ initialGuides }: AdminGuidesTableProps) {
  const [guides, setGuides] = useState<any[]>(initialGuides || []);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredGuides = guides.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.location.toLowerCase().includes(search.toLowerCase()) ||
      (g.ownerEmail && g.ownerEmail.toLowerCase().includes(search.toLowerCase()))
  );

  const handleStatusChange = (
    userId: number,
    status: "approved" | "rejected" | "suspended",
    name: string
  ) => {
    startTransition(async () => {
      const res = await updatePartnerApprovalStatus(userId, "guide", status);
      if (res.success) {
        toast.success(`${name} has been ${status.toUpperCase()}!`);
        setGuides((prev) =>
          prev.map((g) => (g.userId === userId ? { ...g, approvalStatus: status } : g))
        );
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search guides by name, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {filteredGuides.length === 0 ? (
        <Card className="border-dashed bg-muted/10 p-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-3">
            <Compass className="size-7" />
          </div>
          <h3 className="text-lg font-semibold">No registered guides found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {search
              ? "No guides matched your search filter."
              : "Registered tour and trek guides will be listed here for verification."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredGuides.map((guide) => (
            <Card key={guide.id} className="border shadow-xs flex flex-col justify-between">
              <CardContent className="p-5 space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{guide.name}</h3>
                    <p className="text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <MapPin className="size-3.5 text-primary" /> {guide.location}
                    </p>
                  </div>

                  <Badge
                    variant={guide.approvalStatus === "approved" ? "default" : "outline"}
                    className={
                      guide.approvalStatus === "approved"
                        ? "bg-emerald-600 text-white"
                        : guide.approvalStatus === "rejected"
                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                        : "text-amber-600 border-amber-500/30"
                    }
                  >
                    {guide.approvalStatus?.toUpperCase() || "PENDING"}
                  </Badge>
                </div>

                <div className="space-y-1.5 pt-2 border-t text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Mail className="size-3.5" /> Email:</span>
                    <span className="font-medium text-foreground">{guide.ownerEmail}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Phone className="size-3.5" /> Phone:</span>
                    <span className="font-medium text-foreground">{guide.phoneNumber}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Daily Rate:</span>
                    <span className="font-semibold text-foreground">NPR {guide.dailyRate?.toLocaleString()} / day</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Experience:</span>
                    <span className="font-medium text-foreground">{guide.experienceYears} Years</span>
                  </div>

                  {guide.licenseNumber && (
                    <div className="flex items-center justify-between">
                      <span>License:</span>
                      <span className="font-mono text-[11px] text-foreground">{guide.licenseNumber}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span>Languages:</span>
                    <span className="font-medium text-foreground">{guide.languages}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground pt-2 border-t line-clamp-2 italic">
                  "{guide.description}"
                </p>
              </CardContent>

              <div className="p-4 pt-0 border-t flex items-center justify-end gap-2">
                {guide.approvalStatus !== "approved" && (
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusChange(guide.userId, "approved", guide.name)}
                    className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Check className="size-3.5 mr-1" /> Approve Guide
                  </Button>
                )}

                {guide.approvalStatus === "approved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusChange(guide.userId, "suspended", guide.name)}
                    className="text-xs h-8 text-amber-600 hover:bg-amber-500/10"
                  >
                    Suspend
                  </Button>
                )}

                {guide.approvalStatus !== "rejected" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusChange(guide.userId, "rejected", guide.name)}
                    className="text-xs h-8"
                  >
                    <X className="size-3.5 mr-1" /> Reject
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
