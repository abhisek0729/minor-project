"use client";

import { useState } from "react";
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
} from "lucide-react";
import { ZodError } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import ImageUpload from "@/components/ui/image-upload";
import { submitGuideOnboarding } from "../../actions/onboarding.action";
import {
  GuideOnboardingData,
  guideOnboardingSchema,
} from "../../schemas/guide.schema";

const STEPS = ["Personal Info", "Experience & Pricing", "Photo & Bio", "Review"];

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

  const [formData, setFormData] = useState<Partial<GuideOnboardingData>>({
    name: defaultName || "",
    phoneNumber: "",
    location: "Kathmandu, Nepal",
    experienceYears: 3,
    languages: "Nepali, English",
    dailyRate: 2500,
    licenseNumber: "",
    description: "",
    guideImageUrl: "",
  });

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
        if (!formData.location) {
          setErrors({ location: "Base location is required" });
          return false;
        }
      }

      if (currentStep === 1) {
        if (!formData.languages) {
          setErrors({ languages: "Please enter spoken languages" });
          return false;
        }
        if (!formData.dailyRate || formData.dailyRate < 500) {
          setErrors({ dailyRate: "Daily rate must be at least NPR 500" });
          return false;
        }
      }

      if (currentStep === 2) {
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number *</label>
                  <Input
                    placeholder="e.g. 9841000000"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive">{errors.phoneNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Base Location / City *</label>
                  <Input
                    placeholder="e.g. Pokhara / Kathmandu"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EXPERIENCE & PRICING */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Years of Experience *</label>
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
                  placeholder="e.g. Nepali, English, Hindi, French"
                  value={formData.languages}
                  onChange={(e) => handleChange("languages", e.target.value)}
                />
                {errors.languages && (
                  <p className="text-sm text-destructive">{errors.languages}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Government License / Trekking ID (Optional)</label>
                <Input
                  placeholder="e.g. NATHM-G-4089"
                  value={formData.licenseNumber}
                  onChange={(e) => handleChange("licenseNumber", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 3: PHOTO & BIO */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Guide Profile Photo *</label>
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
                <label className="text-sm font-medium">About / Guide Bio *</label>
                <Textarea
                  placeholder="Tell travelers about your trekking experience, routes you specialize in (e.g. Annapurna Circuit, Everest Base Camp), and personal highlights..."
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="rounded-xl border bg-muted/20 p-5 space-y-4">
                <div className="flex items-start gap-4">
                  {formData.guideImageUrl && (
                    <Image
                      src={formData.guideImageUrl}
                      alt="Guide Preview"
                      width={80}
                      height={80}
                      className="size-20 object-cover rounded-xl border shadow-sm shrink-0"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{formData.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 text-primary" /> {formData.location}
                    </p>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                      NPR {formData.dailyRate?.toLocaleString()} / Day • {formData.experienceYears} Years Exp.
                    </p>
                  </div>
                </div>

                <hr className="border-border" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <p><strong>Languages:</strong> {formData.languages}</p>
                  <p><strong>Phone:</strong> {formData.phoneNumber}</p>
                  {formData.licenseNumber && (
                    <p><strong>License:</strong> {formData.licenseNumber}</p>
                  )}
                </div>

                <div className="pt-1">
                  <p className="text-xs text-muted-foreground italic">"{formData.description}"</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-between border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0 || isLoading}
          >
            <ArrowLeft className="mr-2 size-4" /> Previous
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button type="button" onClick={nextStep}>
              Next <ArrowRight className="ml-2 size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Submitting Profile...
                </>
              ) : (
                "Complete Guide Profile →"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
