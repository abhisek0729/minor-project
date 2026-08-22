"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Save, Store } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUpload from "@/components/ui/image-upload";
import LocationMapPicker from "@/components/maps/LocationMapPicker";
import { updateRestaurantProfile } from "../../actions/restaurant.action";

interface RestaurantSettingsFormProps {
  initialData: {
    name: string;
    description: string;
    establishedDate?: string | null;
    cuisine?: string | null;
    phoneNumber: string;
    location: string;
    restaurantImageUrl: string;
  };
}

export default function RestaurantSettingsForm({
  initialData,
}: RestaurantSettingsFormProps) {
  const [name, setName] = useState(initialData.name || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [establishedDate, setEstablishedDate] = useState(initialData.establishedDate || "");
  const [cuisine, setCuisine] = useState(initialData.cuisine || "Multi-Cuisine");
  const [phoneNumber, setPhoneNumber] = useState(initialData.phoneNumber || "");
  const [location, setLocation] = useState(initialData.location || "");
  const [restaurantImageUrl, setRestaurantImageUrl] = useState(
    initialData.restaurantImageUrl || ""
  );

  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await updateRestaurantProfile({
        name,
        description,
        establishedDate,
        cuisine,
        phoneNumber,
        location,
        restaurantImageUrl,
      });

      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Store className="size-5 text-primary" />
          Restaurant Profile & Details
        </CardTitle>
        <CardDescription>
          Update your public business listing details shown to travelers on the website.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Restaurant Name *</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel>Established Date / Year</FieldLabel>
              <Input
                placeholder="e.g. 2015"
                value={establishedDate}
                onChange={(e) => setEstablishedDate(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Contact Phone Number *</FieldLabel>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel>Address / Location *</FieldLabel>
              <Input
                placeholder="e.g. Lakeside, Ward 6, Pokhara, Gandaki"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </Field>
          </div>

          {/* Interactive Live Map Picker */}
          <div className="pt-2">
            <LocationMapPicker
              address={location}
              label="Pin Restaurant on Live Map"
              description="Use GPS or select a tourism hub to pin your restaurant on Google Maps for diners."
              onChange={({ address: newAddr }) => {
                if (newAddr) {
                  setLocation(newAddr);
                }
              }}
            />
          </div>

          <Field>
            <FieldLabel>About / Description *</FieldLabel>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Field>

          {/* Cover Photo */}
          <div className="space-y-2">
            <FieldLabel>Restaurant Cover Photo</FieldLabel>
            <div className="space-y-3">
              <ImageUpload
                value={restaurantImageUrl ? [restaurantImageUrl] : []}
                onChange={(urls) => setRestaurantImageUrl(urls[0] || "")}
                onRemove={() => setRestaurantImageUrl("")}
                folder="tourism/restaurants"
                maxFiles={1}
              />

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">or Image URL:</span>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={restaurantImageUrl}
                  onChange={(e) => setRestaurantImageUrl(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              {restaurantImageUrl && (
                <div className="relative h-36 w-full rounded-xl overflow-hidden border">
                  <Image
                    src={restaurantImageUrl}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Restaurant Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
