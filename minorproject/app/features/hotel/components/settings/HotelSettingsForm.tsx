"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Camera, Hotel, Loader2, MapPin, Save } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import ImageUpload from "@/components/ui/image-upload";
import LocationMapPicker from "@/components/maps/LocationMapPicker";
import { updateHotelProfile } from "../../actions/updateHotelProfile";

interface HotelSettingsFormProps {
  initialData: {
    name: string;
    phoneNumber: string;
    description: string;
    district: string;
    province: string;
    street: string;
    coverImageUrl: string;
    latitude?: number | null;
    longitude?: number | null;
  };
}

export default function HotelSettingsForm({ initialData }: HotelSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: initialData.name || "",
    phoneNumber: initialData.phoneNumber || "",
    description: initialData.description || "",
    district: initialData.district || "",
    province: initialData.province || "",
    street: initialData.street || "",
  });

  const [coverImageUrl, setCoverImageUrl] = useState(initialData.coverImageUrl || "");
  const [latitude, setLatitude] = useState<number | null>(initialData.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(initialData.longitude ?? null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateHotelProfile({
        ...formData,
        coverImageUrl,
        latitude,
        longitude,
      });
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cover Image Section */}
      <Card className="p-6 border shadow-xs space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Camera className="size-4 text-primary" /> Hotel Cover Photo
          </CardTitle>
          <CardDescription className="text-xs">
            Upload a high-quality cover photo for your hotel&apos;s public listing. This is the first image travelers see.
          </CardDescription>
        </CardHeader>

        <div className="space-y-3 pt-2">
          <ImageUpload
            value={coverImageUrl ? [coverImageUrl] : []}
            onChange={(urls) => setCoverImageUrl(urls[0] || "")}
            onRemove={() => setCoverImageUrl("")}
            folder="tourism/hotels"
            maxFiles={1}
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">or Image URL:</span>
            <Input
              type="url"
              placeholder="https://..."
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="text-xs h-8"
            />
          </div>

          {coverImageUrl && (
            <div className="relative h-48 w-full rounded-xl overflow-hidden border shadow-sm">
              <Image
                src={coverImageUrl}
                alt="Cover preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
        </div>
      </Card>

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

      {/* Location Info & Map Picker */}
      <Card className="p-6 border shadow-xs space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <MapPin className="size-4 text-primary" /> Address & Interactive Map Location
          </CardTitle>
          <CardDescription className="text-xs">
            Set your exact GPS coordinates and street address to enable seamless guest navigation.
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

        {/* Live Interactive Map Location Picker */}
        <div className="pt-2">
          <LocationMapPicker
            latitude={latitude}
            longitude={longitude}
            address={`${formData.street}, ${formData.district}, ${formData.province}`}
            label="Pin Hotel on Live Map"
            description="Use GPS or select a tourism hub to pin your hotel's exact GPS location for guests."
            onChange={({ latitude: newLat, longitude: newLng, address: newAddress }) => {
              setLatitude(newLat);
              setLongitude(newLng);
              if (newAddress && !formData.street) {
                setFormData((prev) => ({ ...prev, street: newAddress }));
              }
            }}
          />
        </div>
      </Card>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending} className="font-semibold gap-2 shadow-xs cursor-pointer">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
