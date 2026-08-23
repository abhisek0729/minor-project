"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Loader2,
  MapPin,
  Sparkles,
  Award,
} from "lucide-react";
import { ZodError } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import ImageUpload from "@/components/ui/image-upload";
import { provinces } from "@/app/features/shared/data/nepal-location";
import { submitGuideOnboarding } from "../../actions/onboarding.action";
import {
  GuideOnboardingData,
  guideOnboardingSchema,
} from "../../schemas/guide.schema";

const STEPS = ["Personal Info", "Location & Base", "Experience & Pricing", "Photo & Bio", "Review"];

export default function GuideOnboardingForm({
  userEmail,
  defaultName,
}: {
  userEmail: string;
  defaultName: string;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Location state for cascading dropdowns
  const [province, setProvince] = useState("Gandaki");
  const [district, setDistrict] = useState("Kaski");
  const [municipality, setMunicipality] = useState("Pokhara Metropolitan City");

  const [formData, setFormData] = useState<Partial<GuideOnboardingData>>({
    name: defaultName || "",
    phoneNumber: "",
    location: "Pokhara Metropolitan City, Kaski, Gandaki",
    experienceYears: 3,
    languages: "Nepali, English",
    dailyRate: 2500,
    licenseNumber: "",
    description: "",
    guideImageUrl: "",
  });

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.name === province),
    [province]
  );

  const selectedDistrict = useMemo(
    () => selectedProvince?.districts.find((d) => d.name === district),
    [selectedProvince, district]
  );

  const handleLocationChange = (type: "province" | "district" | "municipality", val: string) => {
    let p = province;
    let d = district;
    let m = municipality;

    if (type === "province") {
      p = val;
      const foundProv = provinces.find((item) => item.name === val);
      d = foundProv?.districts[0]?.name || "";
      m = foundProv?.districts[0]?.municipalities[0] || "";
      setProvince(p);
      setDistrict(d);
      setMunicipality(m);
    } else if (type === "district") {
      d = val;
      const foundDist = selectedProvince?.districts.find((item) => item.name === val);
      m = foundDist?.municipalities[0] || "";
      setDistrict(d);
      setMunicipality(m);
    } else if (type === "municipality") {
      m = val;
      setMunicipality(m);
    }

    const fullLocation = `${m || ""}, ${d || ""}, ${p || ""}`.replace(/^,\s*/, "").replace(/,\s*$/, "");
    setFormData((prev) => ({ ...prev, location: fullLocation }));
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: "" }));
    }
  };

  const handleChange = (
    field: keyof GuideOnboardingData,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = () => {
    try {
      if (currentStep === 0) {
        if (!formData.name || formData.name.length < 2) {
          setErrors({ name: "Full name is required" });
          return false;
        }
        if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
          setErrors({ phoneNumber: "Valid phone number (10+ digits) is required" });
          return false;
        }
      }

      if (currentStep === 1) {
        if (!formData.location) {
          setErrors({ location: "Please select your base province, district, and city" });
          return false;
        }
      }

      if (currentStep === 2) {
        if (!formData.languages) {
          setErrors({ languages: "Please enter spoken languages" });
          return false;
        }
        if (!formData.dailyRate || formData.dailyRate < 500) {
          setErrors({ dailyRate: "Daily rate must be at least NPR 500" });
          return false;
        }
      }

      if (currentStep === 3) {
        if (!formData.guideImageUrl) {
          setErrors({ guideImageUrl: "Guide profile photo is required" });
          return false;
        }
        if (!formData.description || formData.description.length < 10) {
          setErrors({ description: "Bio must be at least 10 characters" });
          return false;
        }
      }

      setErrors({});
      return true;
    } catch {
      return false;
    }
  };

  const nextStep = () => {
    if (validateStep()) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setIsLoading(true);
    const res = await submitGuideOnboarding(formData as GuideOnboardingData);

    if (res.success) {
      toast.success(res.message);
      router.push("/dashboard/guide");
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

  return (
    <Card className="shadow-lg border bg-card">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Compass className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Tour Guide Registration</h2>
            <p className="text-xs text-muted-foreground">
              Complete your guide profile to receive booking requests for treks and tours across Nepal.
            </p>
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="mt-6 flex justify-between items-center relative">
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
      </div>

      <CardContent className="p-6">
        <div className="min-h-[320px]">
          {/* STEP 1: PERSONAL INFO */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  placeholder="e.g. Pasang Sherpa"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Account Email</label>
                <Input value={userEmail} readOnly className="bg-muted" />
                <p className="text-xs text-muted-foreground">Linked to your registered login.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number / WhatsApp *</label>
                <Input
                  placeholder="e.g. 9841000000"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">{errors.phoneNumber}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: CASCADING LOCATION & BASE STATION */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                  <MapPin className="size-4 text-primary" /> Base Operating Station (All 7 Provinces)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select your primary region so travelers can find and book you for local treks and tours.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Province */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Province *</label>
                  <select
                    aria-label="Province"
                    value={province}
                    onChange={(e) => handleLocationChange("province", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {provinces.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">District *</label>
                  <select
                    aria-label="District"
                    value={district}
                    onChange={(e) => handleLocationChange("district", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {selectedProvince?.districts.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Municipality / Base City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Municipality / Base Station *</label>
                  <select
                    aria-label="Municipality / Base Station"
                    value={municipality}
                    onChange={(e) => handleLocationChange("municipality", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {selectedDistrict?.municipalities.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Formatted Location Display */}
              <div className="p-3 bg-muted/30 border rounded-lg">
                <span className="text-xs text-muted-foreground">Selected Operating Location:</span>
                <p className="text-sm font-semibold text-primary mt-0.5">{formData.location}</p>
              </div>
            </div>
          )}

          {/* STEP 3: EXPERIENCE & PRICING */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Years of Guiding Experience *</label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={formData.experienceYears}
                    onChange={(e) => handleChange("experienceYears", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Daily Guiding Fee (NPR) *</label>
                  <Input
                    type="number"
                    min={500}
                    step={100}
                    value={formData.dailyRate}
                    onChange={(e) => handleChange("dailyRate", Number(e.target.value))}
                  />
                  {errors.dailyRate && (
                    <p className="text-sm text-destructive">{errors.dailyRate}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Spoken Languages *</label>
                <Input
                  placeholder="e.g. Nepali, English, Hindi, French, German"
                  value={formData.languages}
                  onChange={(e) => handleChange("languages", e.target.value)}
                />
                {errors.languages && (
                  <p className="text-sm text-destructive">{errors.languages}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nepal Tourism Board License Number (Optional)</label>
                <Input
                  placeholder="e.g. NTB-TG-2024-8891"
                  value={formData.licenseNumber}
                  onChange={(e) => handleChange("licenseNumber", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 4: PHOTO & BIO */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Profile Photo *</label>
                <ImageUpload
                  folder="tourism/guides"
                  value={formData.guideImageUrl ? [formData.guideImageUrl] : []}
                  onChange={(urls: string[]) => handleChange("guideImageUrl", urls[0] || "")}
                  onRemove={() => handleChange("guideImageUrl", "")}
                />
                {errors.guideImageUrl && (
                  <p className="text-sm text-destructive">{errors.guideImageUrl}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Professional Bio & Mountain Experience *</label>
                <Textarea
                  rows={4}
                  placeholder="Tell travelers about your Himalayan expeditions, certifications, first aid training, and favorite trails..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                <div className="flex items-center gap-4">
                  {formData.guideImageUrl && (
                    <div className="relative size-16 rounded-full overflow-hidden border">
                      <Image
                        src={formData.guideImageUrl}
                        alt="Profile Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{formData.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3 text-primary" /> {formData.location}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground pt-2 border-t">
                  <p><strong>Phone:</strong> {formData.phoneNumber}</p>
                  <p><strong>Daily Rate:</strong> NPR {formData.dailyRate?.toLocaleString()}/day</p>
                  <p><strong>Experience:</strong> {formData.experienceYears} years</p>
                  <p><strong>Languages:</strong> {formData.languages}</p>
                  {formData.licenseNumber && (
                    <p className="col-span-2"><strong>License:</strong> {formData.licenseNumber}</p>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs font-semibold text-foreground mb-1">Bio Summary:</p>
                  <p className="text-xs text-muted-foreground line-clamp-3">{formData.description}</p>
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
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering Profile...</>
              ) : (
                "Submit Guide Application"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
