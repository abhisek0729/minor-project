"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Package, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveTourPackage } from "../../actions/guide.action";

interface PackageFormModalProps {
  initialPackage?: any;
  triggerButton?: React.ReactNode;
}

export default function PackageFormModal({
  initialPackage,
  triggerButton,
}: PackageFormModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: initialPackage?.title || "",
    description: initialPackage?.description || "",
    destination: initialPackage?.destination || "",
    durationDays: initialPackage?.durationDays || 1,
    price: initialPackage?.price || 5000,
    maxGroupSize: initialPackage?.maxGroupSize || 8,
    itinerary: initialPackage?.itinerary || "",
    included: initialPackage?.included || "Guide service, First aid kit",
    excluded: initialPackage?.excluded || "Personal gear, Insurance, Meals",
    packageImageUrl: initialPackage?.packageImageUrl || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "durationDays" || name === "price" || name === "maxGroupSize" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.destination || !formData.price) {
      toast.error("Please fill in the required fields");
      return;
    }

    startTransition(async () => {
      const res = await saveTourPackage({
        id: initialPackage?.id,
        ...formData,
      });

      if (res.success) {
        toast.success(res.message);
        setOpen(false);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <>
      {triggerButton ? (
        <span onClick={() => setOpen(true)}>{triggerButton}</span>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
        >
          <Plus className="size-4" /> Add Tour Package
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-card border shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Package className="size-4.5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    {initialPackage ? "Edit Tour Package" : "Create New Tour Package"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Publish guided treks, heritage walks, or adventure tours.
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="size-8"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="font-medium">Tour / Trek Title *</label>
                <Input
                  name="title"
                  placeholder="e.g. Annapurna Base Camp 7-Day Guided Trek"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-medium">Destination *</label>
                  <Input
                    name="destination"
                    placeholder="e.g. Pokhara / ABC"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium">Duration (Days)</label>
                  <Input
                    type="number"
                    min={1}
                    name="durationDays"
                    value={formData.durationDays}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium">Price (NPR) *</label>
                  <Input
                    type="number"
                    min={100}
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium">Overview & Description</label>
                <Textarea
                  name="description"
                  placeholder="Describe the trek, difficulty level, highlights and scenery..."
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium">Day-by-Day Itinerary</label>
                <Textarea
                  name="itinerary"
                  placeholder="Day 1: Drive to trailhead and trek to Tikhedhunga. Day 2: Ghorepani..."
                  rows={3}
                  value={formData.itinerary}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-medium">What's Included</label>
                  <Input
                    name="included"
                    placeholder="e.g. Guide fee, Trekking permit, First Aid"
                    value={formData.included}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium">What's Excluded</label>
                  <Input
                    name="excluded"
                    placeholder="e.g. Personal drinks, Porter, Tips"
                    value={formData.excluded}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  {initialPackage ? "Save Changes" : "Publish Tour Package"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
