"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { ZodError } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ImageUpload from "../../../../../components/ui/image-upload";
import LocationMapPicker from "@/components/maps/LocationMapPicker";

import { submitRestaurantOnboarding } from "../../actions/onboarding.action";
import {
  RestaurantOnboardingData,
  basicInfoSchema,
  contactInfoSchema,
  locationSchema,
  imagesSchema
} from "../../schemas/restaurant.schema";

const STEPS = ["Basic Info", "Contact", "Location", "Images", "Review"];

export default function RestaurantOnboardingForm({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<RestaurantOnboardingData>>({
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
  });

  const handleChange = (
    field: keyof RestaurantOnboardingData,
    value: RestaurantOnboardingData[keyof RestaurantOnboardingData]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when typing
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
          Object.entries(res.errors).map(([key, value]) => [
            key,
            value?.[0] ?? "Invalid value",
          ])
        );

        setErrors(normalizedErrors);
      }
    }

    setIsLoading(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-muted/10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </p>
          <div className="flex gap-1">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-8 rounded-full transition-colors ${idx <= currentStep ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
        </div>
        <CardTitle className="text-2xl">{STEPS[currentStep]}</CardTitle>
        <CardDescription>Setup your restaurant profile for the marketplace.</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="min-h-[300px]">
          {/* STEP 1: BASIC INFO */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Restaurant Name</label>
                <Input
                  placeholder="e.g. The Kathmandu Kitchen"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Tell customers about your restaurant..."
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Established Date / Year (Optional)</label>
                <Input
                  placeholder="e.g. 2015"
                  value={formData.establishedDate}
                  onChange={(e) => handleChange("establishedDate", e.target.value)}
                />
                {errors.establishedDate && <p className="text-sm text-destructive">{errors.establishedDate}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: CONTACT INFO */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Owner Email</label>
                <Input value={userEmail} readOnly className="bg-muted" />
                <p className="text-xs text-muted-foreground">Linked to your account (Cannot be changed here)</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Restaurant Phone Number</label>
                <Input
                  placeholder="e.g. 9800000000"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                />
                {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION */}
          {currentStep === 2 && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium">Province</label>
                <Input
                  placeholder="e.g. Bagmati"
                  value={formData.province}
                  onChange={(e) => handleChange("province", e.target.value)}
                />
                {errors.province && <p className="text-sm text-destructive">{errors.province}</p>}
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium">District</label>
                <Input
                  placeholder="e.g. Kathmandu"
                  value={formData.district}
                  onChange={(e) => handleChange("district", e.target.value)}
                />
                {errors.district && <p className="text-sm text-destructive">{errors.district}</p>}
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium">Municipality/City</label>
                <Input
                  placeholder="e.g. KMC"
                  value={formData.municipality}
                  onChange={(e) => handleChange("municipality", e.target.value)}
                />
                {errors.municipality && <p className="text-sm text-destructive">{errors.municipality}</p>}
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium">Ward No.</label>
                <Input
                  placeholder="e.g. 1"
                  value={formData.ward}
                  onChange={(e) => handleChange("ward", e.target.value)}
                />
                {errors.ward && <p className="text-sm text-destructive">{errors.ward}</p>}
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Street Name / Exact Location</label>
                <Input
                  placeholder="e.g. Thamel Marg"
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

          {/* STEP 4: IMAGES */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cover Image</label>
                <ImageUpload
                  folder="tourism/restaurants"
                  value={formData.restaurantImageUrl ? [formData.restaurantImageUrl] : []}
                  onChange={(urls: string[]) => handleChange("restaurantImageUrl", urls[0] || "")}
                  onRemove={() => handleChange("restaurantImageUrl", "")}
                />
                {errors.restaurantImageUrl && <p className="text-sm text-destructive">{errors.restaurantImageUrl}</p>}
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="rounded-xl border bg-muted/20 p-4 space-y-4">

                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Basic Info
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1"><strong>Name:</strong> {formData.name}</p>
                  {formData.establishedDate && (
                    <p className="text-sm text-muted-foreground"><strong>Established:</strong> {formData.establishedDate}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">{formData.description}</p>
                </div>

                <hr className="border-border" />

                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Contact & Location
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1"><strong>Phone:</strong> {formData.phoneNumber}</p>
                  <p className="text-sm text-muted-foreground"><strong>Address:</strong> {formData.street}, Ward {formData.ward}, {formData.municipality}, {formData.district}, {formData.province}</p>
                </div>

                <hr className="border-border" />

                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Cover Image
                  </h3>
                  {formData.restaurantImageUrl && (
                    <Image
                      src={formData.restaurantImageUrl}
                      alt="Preview"
                      width={192}
                      height={128}
                      className="mt-2 h-32 w-48 object-cover rounded-md shadow-sm border"
                    />
                  )}
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
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                "Submit & Launch"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}