"use client";

import { useState } from "react";
import { BadgeCheck, Loader2, Search, Shield, Trash2, User, X, XCircle } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deleteUserAdminAction } from "../../actions/admin.action";

interface AdminUsersTableProps {
  initialUsers: any[];
}

export default function AdminUsersTable({ initialUsers }: AdminUsersTableProps) {
  const [users, setUsers] = useState(initialUsers || []);
  const [search, setSearch] = useState("");
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);

    try {
      const res = await deleteUserAdminAction(deletingUser.id);
      if (res.success) {
        toast.success(res.message || `User ${deletingUser.name} deleted.`);
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
        setDeletingUser(null);
      } else {
        toast.error(res.message || "Failed to delete user");
      }
    } catch {
      toast.error("Error deleting user account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>User ID</TableHead>
              <TableHead>Name & Email</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Auth Provider</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{u.id}
                  </TableCell>

                  <TableCell>
                    <div className="font-semibold text-sm leading-tight text-foreground flex items-center gap-1.5">
                      <User className="size-3.5 text-primary shrink-0" />
                      {u.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{u.email}</div>
                  </TableCell>

                  <TableCell>
                    {u.isVerified ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                        <BadgeCheck className="size-3 mr-1" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground text-xs">
                        Unverified
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="capitalize text-xs">
                      {u.provider || "credentials"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Recent"}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeletingUser(u)}
                      className="h-8 px-2.5 rounded-xl cursor-pointer"
                      title="Delete User Account"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete User Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card border rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setDeletingUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="size-14 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="size-7" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-bold text-foreground">
                Delete {deletingUser.name}?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This will permanently delete user <strong>{deletingUser.email}</strong>, all their associated partner workspaces, and trip bookings.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setDeletingUser(null)}
                className="flex-1 text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDeleteUser}
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
