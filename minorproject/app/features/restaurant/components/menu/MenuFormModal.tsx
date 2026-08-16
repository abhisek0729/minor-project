"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import { Loader2, Plus, Utensils, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import ImageUpload from "@/components/ui/image-upload";
import { createMenuItem, updateMenuItem } from "../../actions/menu.action";

export interface MenuItemData {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: string | null;
  menusImageUrl: string;
  isAvailable?: boolean | null;
}

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MenuItemData | null;
}

const CATEGORIES = [
  "Main Course",
  "Appetizer",
  "Snacks",
  "Fast Food",
  "Traditional Nepali",
  "Dessert",
  "Beverage",
];

export default function MenuFormModal({
  isOpen,
  onClose,
  initialData,
}: MenuFormModalProps) {
  const isEditing = !!initialData?.id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Main Course");
  const [customCategory, setCustomCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setPrice(initialData.price ? initialData.price.toString() : "");
      if (initialData.category && CATEGORIES.includes(initialData.category)) {
        setCategory(initialData.category);
        setCustomCategory("");
      } else if (initialData.category) {
        setCategory("Other");
        setCustomCategory(initialData.category);
      } else {
        setCategory("Main Course");
      }
      setImageUrl(initialData.menusImageUrl || "");
      setIsAvailable(initialData.isAvailable ?? true);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setCategory("Main Course");
      setCustomCategory("");
      setImageUrl("");
      setIsAvailable(true);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter item name");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a short description");
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!imageUrl.trim()) {
      toast.error("Please provide an image for the food item");
      return;
    }

    const finalCategory =
      category === "Other" && customCategory.trim()
        ? customCategory.trim()
        : category;

    startTransition(async () => {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category: finalCategory,
        menusImageUrl: imageUrl.trim(),
        isAvailable,
      };

      if (isEditing && initialData?.id) {
        const res = await updateMenuItem(initialData.id, payload);
        if (res.success) {
          toast.success(res.message);
          onClose();
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await createMenuItem(payload);
        if (res.success) {
          toast.success(res.message);
          onClose();
        } else {
          toast.error(res.message);
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-card border shadow-2xl p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Utensils className="size-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {isEditing ? "Edit Food Item" : "Add New Food Item"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEditing
                  ? "Update your dish details, pricing, and availability."
                  : "Add a delicious food or drink item to your restaurant menu."}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-full"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Food / Dish Name *</FieldLabel>
              <Input
                placeholder="e.g. Chicken Momo, Thakali Set"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel>Price (NPR) *</FieldLabel>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 250"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </Field>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <FieldLabel>Category *</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                    category === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground hover:text-foreground border-transparent"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCategory("Other")}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                  category === "Other"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                + Custom Category
              </button>
            </div>

            {category === "Other" && (
              <Input
                placeholder="Enter custom category name"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="mt-2 text-xs"
                required
              />
            )}
          </div>

          {/* Description */}
          <Field>
            <FieldLabel>Description *</FieldLabel>
            <Textarea
              placeholder="Describe the dish ingredients, preparation, taste, or portion size..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </Field>

          {/* Image Upload */}
          <div className="space-y-2">
            <FieldLabel>Dish Photo *</FieldLabel>
            <div className="space-y-3">
              <ImageUpload
                value={imageUrl ? [imageUrl] : []}
                onChange={(urls) => setImageUrl(urls[0] || "")}
                onRemove={() => setImageUrl("")}
                folder="tourism/menu"
                maxFiles={1}
              />

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">or Image URL:</span>
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              {imageUrl && (
                <div className="relative size-16 rounded-lg overflow-hidden border">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </div>

          {/* Availability Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isAvailable"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor="isAvailable"
              className="text-xs font-medium text-foreground cursor-pointer select-none"
            >
              Mark as Currently Available for Orders
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update Food Item"
              ) : (
                <>
                  <Plus className="size-4" />
                  Add to Menu
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
