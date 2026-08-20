"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateGuideProfile } from "../../actions/guide.action";

interface GuideProfileFormProps {
  initialGuide: any;
}

export default function GuideProfileForm({ initialGuide }: GuideProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: initialGuide?.name || "",
    description: initialGuide?.description || "",
    location: initialGuide?.location || "Kathmandu, Nepal",
    phoneNumber: initialGuide?.phoneNumber || "",
    experienceYears: initialGuide?.experienceYears || 2,
    languages: initialGuide?.languages || "Nepali, English",
    dailyRate: initialGuide?.dailyRate || 2500,
    licenseNumber: initialGuide?.licenseNumber || "",
    isAvailable: initialGuide?.isAvailable ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "experienceYears" || name === "dailyRate" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateGuideProfile(formData);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg">Personal & Business Details</CardTitle>
          <CardDescription>
            This information will be displayed on your public guide profile for travelers.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Full Name *</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Operating Base / Location *</label>
              <Input
                name="location"
                placeholder="e.g. Pokhara / Kathmandu"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Contact Phone Number *</label>
              <Input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Daily Rate (NPR) *</label>
              <Input
                type="number"
                min={500}
                name="dailyRate"
                value={formData.dailyRate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Years of Experience</label>
              <Input
                type="number"
                min={0}
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Spoken Languages</label>
            <Input
              name="languages"
              placeholder="e.g. Nepali, English, French, Hindi"
              value={formData.languages}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Government / NMA License Number</label>
            <Input
              name="licenseNumber"
              placeholder="e.g. NATHM-GUIDE-88219"
              value={formData.licenseNumber}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Bio & Experience Description</label>
            <Textarea
              name="description"
              placeholder="Share your guiding experience, summit achievements, certifications, and passion..."
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save Profile Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
