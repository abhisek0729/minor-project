"use client";

import Image from "next/image";
import {
  Building2,
  Phone,
  Globe,
  MapPin,
  Calendar,
  BadgeCheck,
  Images,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useFormContext } from "react-hook-form";

import { HotelSchema } from "../../schemas/hotel.schema";

import { Button } from "@/components/ui/button";
import { FacilityIconKey } from "./Facilities";

interface ReviewStepProps {
  predefinedFacilities: { id: number; name: string; icon: FacilityIconKey }[];
  previous: () => void;
  isSubmitting?: boolean;
}

function ReviewCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm ">
      <div className="flex items-center gap-3 border-b bg-muted/30 px-6 py-4">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>

        <h2 className="font-semibold">{title}</h2>
      </div>

      <div className="space-y-4 p-6">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b pb-3 last:border-none">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "-"}</span>
    </div>
  );
}

export default function ReviewStep({
  predefinedFacilities,
  previous,
  isSubmitting = false,
}: ReviewStepProps) {
  const { getValues } = useFormContext<HotelSchema>();

  const values = getValues();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      {/* Header */}

      <div className="mb-10">
        <p className="text-sm font-medium text-primary">Step 7 of 7</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Review Your Hotel
        </h1>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          Please review your information before submitting it for verification.
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic */}

        <ReviewCard
          title="Basic Information"
          icon={<Building2 className="size-5" />}
        >
          <Row label="Hotel Name" value={values.hotelName} />

          <Row label="Established Year" value={values.establishedYear} />

          <Row label="Description" value={values.description} />
        </ReviewCard>

        {/* Contact */}

        <ReviewCard
          title="Contact Information"
          icon={<Phone className="size-5" />}
        >
          <Row label="Phone Number" value={values.phone} />

          <Row label="Business Email" value={values.email} />

          <Row label="Website" value={values.website} />
        </ReviewCard>

        {/* Location */}

        <ReviewCard title="Location" icon={<MapPin className="size-5" />}>
          <Row label="Province" value={values.province} />

          <Row label="District" value={values.district} />

          <Row label="Municipality" value={values.municipality} />

          <Row label="Ward" value={values.ward} />

          <Row label="Street" value={values.street} />
        </ReviewCard>

        {/* Facilities */}

        <ReviewCard title="Facilities" icon={<BadgeCheck className="size-5" />}>
          <div className="flex flex-wrap gap-3">
            {values.facilities.length ? (
              values.facilities.map((facility) => (
                <div
                  key={facility}
                  className="rounded-full border bg-muted px-4 py-2 text-sm"
                >
                  {predefinedFacilities.find((f) => f.id === facility)?.name}
                </div>
              ))
            ) : (
              <span className="text-muted-foreground">
                No facilities selected.
              </span>
            )}
          </div>
        </ReviewCard>

        {/* Images */}

        <ReviewCard title="Hotel Images" icon={<Images className="size-5" />}>
          {values.coverImage && (
            <>
              <h3 className="font-medium">Cover Image</h3>

              <Image
                src={values.coverImage.imageUrl}
                alt=""
                width={1200}
                height={600}
                className="mb-6 h-64 w-full rounded-xl object-cover"
              />
            </>
          )}

          {values.galleryImages.length > 0 && (
            <>
              <h3 className="mb-4 font-medium">Gallery Images</h3>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {values.galleryImages.map((image) => (
                  <Image
                    key={image.publicId}
                    src={image.imageUrl}
                    alt=""
                    width={400}
                    height={300}
                    className="aspect-4/3 rounded-xl object-cover"
                  />
                ))}
              </div>
            </>
          )}
        </ReviewCard>

        {/* Documents */}

        {/* <ReviewCard
          title="Verification Documents"
          icon={<ShieldCheck className="size-5" />}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-green-600" />
              Registration Certificate Uploaded
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-green-600" />
              PAN Certificate Uploaded
            </div>
          </div>
        </ReviewCard> */}

        {/* Footer */}

        <div className="flex flex-col-reverse gap-3 border-t pt-8 sm:flex-row sm:justify-between">
          <Button variant="outline" size="lg" type="button" onClick={previous}>
            Back
          </Button>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="min-w-52"
          >
            {isSubmitting ? "Submitting..." : "Complete Onboarding"}
          </Button>
        </div>
      </div>
    </div>
  );
}
