"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Building2,
  Check,
  Mail,
  MapPin,
  Phone,
  Search,
  Truck,
  X,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updateTravelProviderApproval } from "../../actions/admin.action";

interface AdminProvidersTableProps {
  initialProviders: any[];
}

export default function AdminProvidersTable({ initialProviders }: AdminProvidersTableProps) {
  const [providers, setProviders] = useState<any[]>(initialProviders || []);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredProviders = providers.filter(
    (p) =>
      p.companyName.toLowerCase().includes(search.toLowerCase()) ||
      p.businessType.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = (
    providerId: number,
    status: "approved" | "rejected" | "suspended",
    companyName: string
  ) => {
    startTransition(async () => {
      const res = await updateTravelProviderApproval(providerId, status);
      if (res.success) {
        toast.success(`${companyName} has been ${status.toUpperCase()}!`);
        setProviders((prev) =>
          prev.map((p) => (p.id === providerId ? { ...p, approvalStatus: status } : p))
        );
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search agencies, transport, operators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {filteredProviders.length === 0 ? (
        <Card className="border-dashed bg-muted/10 p-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-3">
            <Truck className="size-7" />
          </div>
          <h3 className="text-lg font-semibold">No travel providers registered yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {search
              ? "No travel providers matched your query."
              : "Registered travel agencies, transport companies, and equipment providers will appear here."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="border shadow-xs flex flex-col justify-between">
              <CardContent className="p-5 space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{provider.companyName}</h3>
                    <Badge variant="outline" className="text-[11px] mt-0.5">
                      {provider.businessType}
                    </Badge>
                  </div>

                  <Badge
                    variant={provider.approvalStatus === "approved" ? "default" : "outline"}
                    className={
                      provider.approvalStatus === "approved"
                        ? "bg-emerald-600 text-white"
                        : provider.approvalStatus === "rejected"
                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                        : "text-amber-600 border-amber-500/30"
                    }
                  >
                    {provider.approvalStatus?.toUpperCase() || "PENDING"}
                  </Badge>
                </div>

                <div className="space-y-1.5 pt-2 border-t text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> Address:</span>
                    <span className="font-medium text-foreground">{provider.address}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Mail className="size-3.5" /> Email:</span>
                    <span className="font-medium text-foreground">{provider.contactEmail}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Phone className="size-3.5" /> Phone:</span>
                    <span className="font-medium text-foreground">{provider.contactPhone}</span>
                  </div>

                  {provider.licenseNumber && (
                    <div className="flex items-center justify-between">
                      <span>Govt License:</span>
                      <span className="font-mono text-[11px] text-foreground">{provider.licenseNumber}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground pt-2 border-t line-clamp-2">
                  "{provider.description}"
                </p>
              </CardContent>

              <div className="p-4 pt-0 border-t flex items-center justify-end gap-2">
                {provider.approvalStatus !== "approved" && (
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusChange(provider.id, "approved", provider.companyName)}
                    className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Check className="size-3.5 mr-1" /> Approve Provider
                  </Button>
                )}

                {provider.approvalStatus === "approved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusChange(provider.id, "suspended", provider.companyName)}
                    className="text-xs h-8 text-amber-600 hover:bg-amber-500/10"
                  >
                    Suspend
                  </Button>
                )}

                {provider.approvalStatus !== "rejected" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusChange(provider.id, "rejected", provider.companyName)}
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
