"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Edit,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MenuCategoryBadge from "./MenuCategoryBadge";
import MenuFormModal, { MenuItemData } from "./MenuFormModal";
import {
  deleteMenuItem,
  toggleMenuItemAvailability,
} from "../../actions/menu.action";

interface MenuTableProps {
  initialItems: any[];
}

export default function MenuTable({ initialItems }: MenuTableProps) {
  const [items, setItems] = useState<any[]>(initialItems || []);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);

  const [isPending, startTransition] = useTransition();

  // Categories list
  const categories = [
    "All",
    "Main Course",
    "Appetizer",
    "Snacks",
    "Fast Food",
    "Traditional Nepali",
    "Dessert",
    "Beverage",
  ];

  // Filtered items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the menu?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteMenuItem(id);
      if (res.success) {
        toast.success(res.message);
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleToggleAvailability = (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    startTransition(async () => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isAvailable: newStatus } : item
        )
      );

      const res = await toggleMenuItemAvailability(id, newStatus);
      if (res.success) {
        toast.success(res.message);
      } else {
        // Rollback
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isAvailable: currentStatus } : item
          )
        );
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Search, Category Filters, and Add Dish Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search dish by name or ingredient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <Button onClick={handleOpenAdd} className="w-full sm:w-auto gap-2 shadow-sm">
          <Plus className="size-4" />
          Add Food Item
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 shrink-0 mr-1">
          <Filter className="size-3" /> Filter:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-all shrink-0 ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-background text-muted-foreground hover:text-foreground border-border hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <UtensilsCrossed className="size-7" />
            </div>
            <h3 className="text-lg font-semibold">No food items found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
              {search || selectedCategory !== "All"
                ? "No menu items matched your search filter. Try clearing filters."
                : "Your menu is currently empty. Start adding delicious dishes to your restaurant menu."}
            </p>
            <Button onClick={handleOpenAdd} size="sm" className="gap-2">
              <Plus className="size-4" />
              Add First Food Item
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-16">Photo</TableHead>
                  <TableHead className="min-w-[200px]">Food Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className={`transition-colors ${
                      item.isAvailable === false ? "opacity-60 bg-muted/20" : ""
                    }`}
                  >
                    {/* Thumbnail */}
                    <TableCell>
                      <div className="relative size-12 rounded-lg overflow-hidden border bg-muted shrink-0">
                        {item.menusImageUrl ? (
                          <Image
                            src={item.menusImageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Utensils className="size-5" />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Name & Description */}
                    <TableCell>
                      <div>
                        <p className="font-semibold text-sm leading-tight text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-md">
                          {item.description}
                        </p>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <MenuCategoryBadge category={item.category || "Main Course"} />
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <div className="font-semibold text-sm">
                        NPR {Number(item.price).toLocaleString()}
                      </div>
                    </TableCell>

                    {/* Availability Switch */}
                    <TableCell>
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleAvailability(item.id, item.isAvailable ?? true)
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          item.isAvailable ?? true
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400"
                            : "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 dark:text-red-400"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            item.isAvailable ?? true
                              ? "bg-emerald-500"
                              : "bg-red-500"
                          }`}
                        />
                        {item.isAvailable ?? true ? "Available" : "Sold Out"}
                      </button>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(item)}
                          className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Edit item"
                        >
                          <Edit className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="size-8 text-destructive hover:bg-destructive/10"
                          title="Delete item"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <MenuFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingItem}
      />
    </div>
  );
}
