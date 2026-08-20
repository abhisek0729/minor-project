"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Clock, Globe, Hotel, MapPin, Phone, Save } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

export default function HotelSettingsPage() {
  const [formData, setFormData] = useState({
    name: "Lakeside Mountain Resort",
    phoneNumber: "+977 61-462345",
    district: "Pokhara",
    province: "Gandaki Province",
    street: "Lakeside Marg-6",
    checkInTime: "01:00 PM",
    checkOutTime: "11:00 AM",
    description: "Boutique lakefront stay with private balconies, mountain views, and organic breakfast.",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Hotel settings & policies updated successfully!");
    }, 600);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hotel Profile & Property Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your hotel's public information, location contact, and check-in / check-out policies.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="p-6 border shadow-xs space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Hotel className="size-4 text-primary" /> General Hotel Information
            </CardTitle>
            <CardDescription className="text-xs">
              This information is displayed to travelers across the discovery catalog.
            </CardDescription>
          </CardHeader>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-semibold">Hotel Property Name</FieldLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Field>

            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-semibold">Official Phone Number</FieldLabel>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
              />
            </Field>
          </div>

          <Field className="space-y-1.5">
            <FieldLabel className="text-xs font-semibold">Property Description & Highlights</FieldLabel>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-input bg-background p-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </Field>
        </Card>

        {/* Location Info */}
        <Card className="p-6 border shadow-xs space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <MapPin className="size-4 text-primary" /> Address & Location
            </CardTitle>
            <CardDescription className="text-xs">
              Provide exact street details to help guests locate your hotel.
            </CardDescription>
          </CardHeader>

          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-semibold">Street / Area</FieldLabel>
              <Input
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                required
              />
            </Field>

            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-semibold">District / City</FieldLabel>
              <Input
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                required
              />
            </Field>

            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-semibold">Province</FieldLabel>
              <Input
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                required
              />
            </Field>
          </div>
        </Card>

        {/* Policies */}
        <Card className="p-6 border shadow-xs space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="size-4 text-primary" /> Check-in & Check-out Policies
            </CardTitle>
          </CardHeader>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-semibold">Standard Check-In Time</FieldLabel>
              <Input
                value={formData.checkInTime}
                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                required
              />
            </Field>

            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-semibold">Standard Check-Out Time</FieldLabel>
              <Input
                value={formData.checkOutTime}
                onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                required
              />
            </Field>
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSaving} className="font-semibold gap-2 shadow-xs cursor-pointer">
            <Save className="size-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
