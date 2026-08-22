"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Compass,
  ExternalLink,
  Eye,
  Hotel,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  UtensilsCrossed,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  AdminCompanyItem,
  deletePartnerWorkspaceAction,
  updatePartnerApprovalStatus,
} from "@/app/features/admin/actions/admin.action";

interface CompaniesTableProps {
  initialCompanies: AdminCompanyItem[];
}

export default function CompaniesTable({ initialCompanies }: CompaniesTableProps) {
  const [companies, setCompanies] = useState<AdminCompanyItem[]>(initialCompanies);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modals state
  const [selectedCompany, setSelectedCompany] = useState<AdminCompanyItem | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<AdminCompanyItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  // Filter logic
  const filtered = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || c.type === filterType;
    const matchesStatus = filterStatus === "all" || c.approvalStatus === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle Delete Workspace
  const handleDeleteWorkspace = async () => {
    if (!deletingCompany) return;
    setIsDeleting(true);

    try {
      const res = await deletePartnerWorkspaceAction(
        deletingCompany.type,
        deletingCompany.id,
        deletingCompany.ownerId
      );

      if (res.success) {
        toast.success(res.message || `${deletingCompany.name} has been removed.`);
        setCompanies((prev) =>
          prev.filter((item) => !(item.type === deletingCompany.type && item.id === deletingCompany.id))
        );
        setDeletingCompany(null);
        if (selectedCompany?.id === deletingCompany.id && selectedCompany?.type === deletingCompany.type) {
          setSelectedCompany(null);
        }
      } else {
        toast.error(res.message || "Failed to delete workspace");
      }
    } catch {
      toast.error("An error occurred while deleting workspace");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Status Update (Approve / Suspend)
  const handleStatusChange = async (
    company: AdminCompanyItem,
    newStatus: "approved" | "rejected" | "suspended"
  ) => {
    setUpdatingStatusId(company.id);

    try {
      const roleKey =
        company.type === "hotel"
          ? "hotelOwner"
          : company.type === "restaurant"
          ? "restaurantOwner"
          : "guide";

      const res = await updatePartnerApprovalStatus(
        company.ownerId,
        roleKey as any,
        newStatus
      );

      if (res.success) {
        toast.success(`${company.name} is now ${newStatus.toUpperCase()}`);
        setCompanies((prev) =>
          prev.map((item) =>
            item.id === company.id && item.type === company.type
              ? { ...item, approvalStatus: newStatus }
              : item
          )
        );
        if (selectedCompany?.id === company.id && selectedCompany?.type === company.type) {
          setSelectedCompany((prev) => (prev ? { ...prev, approvalStatus: newStatus } : null));
        }
      } else {
        toast.error(res.message || "Status update failed");
      }
    } catch {
      toast.error("Could not update approval status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hotel":
        return <Hotel className="size-4 text-emerald-600 dark:text-emerald-400" />;
      case "restaurant":
        return <UtensilsCrossed className="size-4 text-amber-600 dark:text-amber-400" />;
      case "guide":
        return <Compass className="size-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <Building2 className="size-4 text-purple-600 dark:text-purple-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by company name, owner, city, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center rounded-xl bg-card border p-1 gap-1">
            {["all", "hotel", "restaurant", "guide"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-all ${
                  filterType === t
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center rounded-xl bg-card border p-1 gap-1">
            {["all", "approved", "pending"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-all ${
                  filterStatus === s
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Companies List Table */}
      {filtered.length === 0 ? (
        <Card className="border-dashed p-12 text-center bg-card">
          <Building2 className="size-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-lg">No companies match your filters</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or resetting category filters to see all partner workspaces.
          </p>
        </Card>
      ) : (
        <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Company / Business</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Owner & Contact</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((company) => {
                  const isApproved = company.approvalStatus === "approved";
                  const isPending = company.approvalStatus === "pending";
                  const isSuspended = company.approvalStatus === "suspended" || company.approvalStatus === "rejected";

                  return (
                    <tr key={`${company.type}-${company.id}`} className="hover:bg-muted/30 transition-colors">
                      {/* Company Name & Photo */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {company.imageUrl ? (
                            <div className="relative size-11 shrink-0 rounded-xl overflow-hidden border bg-muted">
                              <Image
                                src={company.imageUrl}
                                alt={company.name}
                                fill
                                className="object-cover"
                                sizes="44px"
                              />
                            </div>
                          ) : (
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                              {company.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                              {company.name}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                              {company.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <Badge variant="outline" className="gap-1.5 text-xs font-semibold py-1">
                          {getTypeIcon(company.type)}
                          {company.typeLabel}
                        </Badge>
                      </td>

                      {/* Owner & Contact */}
                      <td className="px-4 py-4 space-y-0.5">
                        <p className="font-medium text-foreground text-xs flex items-center gap-1">
                          <User className="size-3 text-muted-foreground" /> {company.ownerName}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="size-3 text-muted-foreground" /> {company.ownerEmail}
                        </p>
                        {company.phoneNumber && (
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Phone className="size-3 text-muted-foreground" /> {company.phoneNumber}
                          </p>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-4 py-4">
                        <span className="text-xs text-foreground/90 flex items-center gap-1 line-clamp-1 max-w-[160px]">
                          <MapPin className="size-3 text-primary shrink-0" />
                          {company.location}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <Badge
                          className={`text-xs capitalize font-bold ${
                            isApproved
                              ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                              : isPending
                              ? "bg-amber-500/15 text-amber-600 border-amber-500/30 animate-pulse"
                              : "bg-rose-500/15 text-rose-600 border-rose-500/30"
                          }`}
                        >
                          {company.approvalStatus}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click Approve if pending */}
                          {isPending && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(company, "approved")}
                              disabled={updatingStatusId === company.id}
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 rounded-xl cursor-pointer"
                            >
                              <CheckCircle2 className="size-3.5" /> Approve
                            </Button>
                          )}

                          {/* View Modal Trigger */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCompany(company)}
                            className="h-8 text-xs gap-1 rounded-xl cursor-pointer"
                          >
                            <Eye className="size-3.5" /> View
                          </Button>

                          {/* Delete Modal Trigger */}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeletingCompany(company)}
                            className="h-8 px-2.5 rounded-xl cursor-pointer"
                            title="Delete Company Workspace"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: VIEW COMPANY DETAILS ================= */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-card border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCompany(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <X className="size-5" />
            </button>

            {/* Header with Photo & Title */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {selectedCompany.imageUrl ? (
                <div className="relative size-24 shrink-0 rounded-2xl overflow-hidden border shadow-sm">
                  <Image
                    src={selectedCompany.imageUrl}
                    alt={selectedCompany.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary text-3xl font-extrabold">
                  {selectedCompany.name.charAt(0)}
                </div>
              )}

              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="gap-1.5 text-xs font-semibold py-1">
                    {getTypeIcon(selectedCompany.type)}
                    {selectedCompany.typeLabel}
                  </Badge>
                  <Badge
                    className={`text-xs capitalize font-bold ${
                      selectedCompany.approvalStatus === "approved"
                        ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                        : selectedCompany.approvalStatus === "pending"
                        ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                        : "bg-rose-500/15 text-rose-600 border-rose-500/30"
                    }`}
                  >
                    {selectedCompany.approvalStatus}
                  </Badge>
                </div>

                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {selectedCompany.name}
                </h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary" /> {selectedCompany.location}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl bg-muted/40 p-4 border text-xs leading-relaxed space-y-1">
              <span className="font-bold text-foreground block text-xs">About Business</span>
              <p className="text-muted-foreground">{selectedCompany.description}</p>
            </div>

            {/* Owner Details & Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-muted/30 border space-y-1">
                <span className="text-muted-foreground block font-medium">Business Owner</span>
                <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <User className="size-4 text-primary" /> {selectedCompany.ownerName}
                </p>
                <p className="text-muted-foreground">{selectedCompany.ownerEmail}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/30 border space-y-1">
                <span className="text-muted-foreground block font-medium">Direct Telephone</span>
                <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Phone className="size-4 text-primary" /> {selectedCompany.phoneNumber || "Not provided"}
                </p>
                <p className="text-muted-foreground">Emergency & Guest Line</p>
              </div>
            </div>

            {/* Extra metadata */}
            {(selectedCompany.establishedYear || selectedCompany.cuisine || selectedCompany.dailyRate || selectedCompany.extraInfo) && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2 text-xs">
                <span className="font-bold text-primary block">Service Specifications</span>
                <div className="flex flex-wrap gap-4 text-foreground/90">
                  {selectedCompany.establishedYear && (
                    <span>Established: <strong>{selectedCompany.establishedYear}</strong></span>
                  )}
                  {selectedCompany.cuisine && (
                    <span>Cuisine: <strong>{selectedCompany.cuisine}</strong></span>
                  )}
                  {selectedCompany.dailyRate && (
                    <span>Daily Rate: <strong>NPR {selectedCompany.dailyRate.toLocaleString()} / day</strong></span>
                  )}
                  {selectedCompany.extraInfo && (
                    <span>{selectedCompany.extraInfo}</span>
                  )}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedCompany.approvalStatus !== "approved" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(selectedCompany, "approved")}
                    disabled={updatingStatusId === selectedCompany.id}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 rounded-xl cursor-pointer"
                  >
                    <CheckCircle2 className="size-4" /> Approve Workspace
                  </Button>
                )}

                {selectedCompany.approvalStatus !== "suspended" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(selectedCompany, "suspended")}
                    disabled={updatingStatusId === selectedCompany.id}
                    className="text-amber-600 hover:bg-amber-500/10 text-xs gap-1.5 rounded-xl cursor-pointer"
                  >
                    <ShieldAlert className="size-4" /> Suspend
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setDeletingCompany(selectedCompany);
                    setSelectedCompany(null);
                  }}
                  className="font-bold text-xs gap-1.5 rounded-xl cursor-pointer"
                >
                  <Trash2 className="size-4" /> Delete Company
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: DELETE CONFIRMATION ================= */}
      {deletingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card border rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setDeletingCompany(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="size-14 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="size-7" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-bold text-foreground">
                Delete {deletingCompany.name}?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This will permanently delete the <strong>{deletingCompany.typeLabel}</strong> workspace from the database, remove all public listings, and revoke partner dashboard permissions for <strong>{deletingCompany.ownerName}</strong>.
              </p>
            </div>

            <div className="rounded-2xl bg-rose-500/5 border border-rose-500/20 p-3.5 text-xs text-rose-700 dark:text-rose-400 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <ShieldAlert className="size-4 shrink-0" /> Permanent Destructive Action
              </span>
              <p>This action cannot be undone. All attached bookings, menus, and rooms will be unlinked.</p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setDeletingCompany(null)}
                className="flex-1 text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDeleteWorkspace}
                className="flex-1 font-bold text-xs gap-1.5 rounded-xl cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" /> Confirm Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
