"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, Image as ImageIcon, MapPin, X } from "lucide-react";
import { ZodError } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ImageUpload from "../../../../../components/ui/image-upload";
import LocationMapPicker from "@/components/maps/LocationMapPicker";
import { provinces } from "@/app/features/shared/data/nepal-location";

import { submitRestaurantOnboarding } from "../../actions/onboarding.action";
import {
  RestaurantOnboardingData,
  basicInfoSchema,
  contactInfoSchema,
  locationSchema,
  imagesSchema,
} from "../../schemas/restaurant.schema";

const STEPS = ["Basic Info", "Contact", "Location", "Photos & Gallery", "Review"];

export default function RestaurantOnboardingForm({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<RestaurantOnboardingData> & { galleryImages?: { imageUrl: string; publicId?: string }[] }>({
    name: "",
    description: "",
    establishedDate: "",
    cuisine: "Multi-Cuisine",
    phoneNumber: "",
    province: "",
    district: "",
    municipality: "",
    ward: "",
    street: "",
    restaurantImageUrl: "",
    galleryImages: [],
  });

  // Selected Province & District helpers for cascading dropdowns
  const selectedProvince = useMemo(
    () => provinces.find((p) => p.name === formData.province),
    [formData.province]
  );

  const selectedDistrict = useMemo(
    () => selectedProvince?.districts.find((d) => d.name === formData.district),
    [selectedProvince, formData.district]
  );

  const handleChange = (
    field: string,
    value: any
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "province") {
        updated.district = "";
        updated.municipality = "";
      } else if (field === "district") {
        updated.municipality = "";
      }
      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = () => {
    try {
      if (currentStep === 0) basicInfoSchema.parse(formData);
      if (currentStep === 1) contactInfoSchema.parse(formData);
      if (currentStep === 2) locationSchema.parse(formData);
      if (currentStep === 3) imagesSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: unknown) {
      if (!(error instanceof ZodError)) {
        return false;
      }

      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (typeof fieldName === "string") {
          fieldErrors[fieldName] = issue.message;
        }
      });

      setErrors(fieldErrors);
      return false;
    }
  };

  const nextStep = () => {
    if (validateStep()) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setIsLoading(true);
    const res = await submitRestaurantOnboarding(formData as RestaurantOnboardingData);

    if (res.success) {
      toast.success(res.message);
      router.push("/dashboard/restaurant");
    } else {
      toast.error(res.message);
      if (res.errors) {
        const normalizedErrors = Object.fromEntries(
          Object.entries(res.errors).map(([k, v]) => [k, v ? v[0] : ""])
        );
        setErrors(normalizedErrors);
      }
      setIsLoading(false);
    }
  };

  const addGalleryImage = (urls: string[]) => {
    if (!urls.length) return;
    const newItems = urls.map((url) => ({ imageUrl: url, publicId: "" }));
    setFormData((prev) => ({
      ...prev,
      galleryImages: [...(prev.galleryImages || []), ...newItems],
    }));
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <Card className="shadow-lg border bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Restaurant Onboarding</CardTitle>
        <CardDescription>
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
        </CardDescription>

        {/* Stepper Progress */}
        <div className="mt-4 flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2 z-0" />
          {STEPS.map((step, idx) => (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div
                className={`size-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-xs ${
                  currentStep >= idx
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > idx ? <CheckCircle2 className="size-4" /> : idx + 1}
              </div>
              <span className="text-[11px] font-medium mt-1 text-muted-foreground hidden sm:block">
                {step}
              </span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="min-h-[340px]">
          {/* STEP 1: BASIC INFO */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Restaurant Name *</label>
                <Input
                  placeholder="e.g. Thakali Bhanchha Ghar"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cuisine Type</label>
                  <Input
                    placeholder="e.g. Traditional Thakali, Newari, Multi-Cuisine"
                    value={formData.cuisine}
                    onChange={(e) => handleChange("cuisine", e.target.value)}
                  />
                  {errors.cuisine && <p className="text-sm text-destructive">{errors.cuisine}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Established Date</label>
                  <Input
                    type="date"
                    value={formData.establishedDate}
                    onChange={(e) => handleChange("establishedDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description / Dining Experience *</label>
                <Textarea
                  rows={4}
                  placeholder="Describe your authentic food specialties, ambiance, hygiene, and dining services..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: CONTACT */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Email</label>
                <Input value={userEmail} readOnly className="bg-muted" />
                <p className="text-xs text-muted-foreground">Linked to your registered account.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Front Desk / Order Phone Number *</label>
                <Input
                  placeholder="e.g. 9815782585 or 014234567"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                />
                {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
              </div>
            </div>
          )}

          {/* STEP 3: CASCADING LOCATION (ALL 7 PROVINCES & 77 DISTRICTS) */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4">
              {/* Province Select */}
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium">Province *</label>
                <select
                  aria-label="Province"
                  value={formData.province}
                  onChange={(e) => handleChange("province", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">-- Select Province (7 Provinces) --</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} Province ({p.districts.length} Districts)
                    </option>
                  ))}
                </select>
                {errors.province && <p className="text-sm text-destructive">{errors.province}</p>}
              </div>

              {/* District Select */}
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium">District *</label>
                <select
                  aria-label="District"
                  value={formData.district}
                  onChange={(e) => handleChange("district", e.target.value)}
                  disabled={!selectedProvince}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                >
                  <option value="">-- Select District --</option>
                  {selectedProvince?.districts.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {errors.district && <p className="text-sm text-destructive">{errors.district}</p>}
              </div>

              {/* Municipality Select */}
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium">Municipality / City *</label>
                <select
                  aria-label="Municipality / City"
                  value={formData.municipality}
                  onChange={(e) => handleChange("municipality", e.target.value)}
                  disabled={!selectedDistrict}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                >
                  <option value="">-- Select Municipality / City --</option>
                  {selectedDistrict?.municipalities.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {errors.municipality && <p className="text-sm text-destructive">{errors.municipality}</p>}
              </div>

              {/* Ward Number */}
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium">Ward No. *</label>
                <Input
                  placeholder="e.g. 1"
                  value={formData.ward}
                  onChange={(e) => handleChange("ward", e.target.value)}
                />
                {errors.ward && <p className="text-sm text-destructive">{errors.ward}</p>}
              </div>

              {/* Street Name */}
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Street Name / Exact Landmark *</label>
                <Input
                  placeholder="e.g. Lakeside Marg, Ward 6"
                  value={formData.street}
                  onChange={(e) => handleChange("street", e.target.value)}
                />
                {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
              </div>

              {/* Interactive Location Map Picker */}
              <div className="col-span-2 pt-2">
                <LocationMapPicker
                  address={`${formData.street || ""}, ${formData.district || ""}, ${formData.province || ""}`}
                  label="Pin Restaurant Exact Map Location"
                  description="Use GPS or select a tourism hub to pin your restaurant on Google Maps for diners."
                  onChange={({ latitude, longitude, address: newAddr }) => {
                    if (newAddr && !formData.street) {
                      handleChange("street", newAddr);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* STEP 4: COVER IMAGE & MULTIPLE GALLERY PHOTOS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Restaurant Cover Photo (Hero Banner) *</label>
                <ImageUpload
                  folder="tourism/restaurants"
                  value={formData.restaurantImageUrl ? [formData.restaurantImageUrl] : []}
                  onChange={(urls: string[]) => handleChange("restaurantImageUrl", urls[0] || "")}
                  onRemove={() => handleChange("restaurantImageUrl", "")}
                />
                {errors.restaurantImageUrl && <p className="text-sm text-destructive">{errors.restaurantImageUrl}</p>}
              </div>

              {/* Multiple Gallery Photos */}
              <div className="space-y-3 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="size-4 text-primary" /> Ambience & Food Gallery (Multiple Photos)
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Upload photos of dining seating, kitchen hygiene, popular dishes, outdoor gardens, and bar counters.
                  </p>
                </div>

                <ImageUpload
                  folder="tourism/restaurants/gallery"
                  value={[]}
                  onChange={addGalleryImage}
                  onRemove={() => {}}
                />

                {/* Uploaded Gallery Previews */}
                {formData.galleryImages && formData.galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                    {formData.galleryImages.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border aspect-video bg-muted/40 shadow-xs">
                        <Image
                          src={img.imageUrl}
                          alt={`Gallery ${idx + 1}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          title="Remove image"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="rounded-xl border bg-muted/20 p-5 space-y-5">
                <div>
                  <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500" /> Basic Details & Cuisine
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                    <p><strong>Name:</strong> {formData.name}</p>
                    <p><strong>Cuisine:</strong> {formData.cuisine}</p>
                    {formData.establishedDate && (
                      <p><strong>Established:</strong> {formData.establishedDate}</p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed bg-background/60 p-3 rounded-lg border">
                    {formData.description}
                  </p>
                </div>

                <hr className="border-border" />

                <div>
                  <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
                    <MapPin className="size-4 text-emerald-500" /> Contact & Cascading Location
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                    <p><strong>Phone:</strong> {formData.phoneNumber}</p>
                    <p><strong>Province:</strong> {formData.province} Province</p>
                    <p><strong>District:</strong> {formData.district}</p>
                    <p><strong>Municipality:</strong> {formData.municipality}, Ward {formData.ward}</p>
                    <p className="col-span-2"><strong>Street / Landmark:</strong> {formData.street}</p>
                  </div>
                </div>

                <hr className="border-border" />

                <div>
                  <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
                    <ImageIcon className="size-4 text-emerald-500" /> Media & Photos
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {formData.restaurantImageUrl && (
                      <div className="relative rounded-lg overflow-hidden border w-44 aspect-video shadow-xs">
                        <Image
                          src={formData.restaurantImageUrl}
                          alt="Cover Preview"
                          fill
                          className="object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/70 text-[10px] text-white px-1.5 py-0.5 rounded">
                          Cover Photo
                        </span>
                      </div>
                    )}

                    {formData.galleryImages?.map((img, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden border w-28 aspect-video shadow-xs">
                        <Image
                          src={img.imageUrl}
                          alt={`Gallery ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION ACTIONS */}
        <div className="mt-8 flex justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0 || isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={nextStep}>
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Launching Restaurant...</>
              ) : (
                "Submit & Launch Restaurant"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}