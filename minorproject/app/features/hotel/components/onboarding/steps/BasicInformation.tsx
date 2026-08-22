"use client";

import { Building2, Calendar } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { HotelSchema } from "../../../schemas/hotel.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

interface BasicInformationStepProps {
  next: () => void;
}

export default function BasicInformationStep({
  next,
}: BasicInformationStepProps) {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext<HotelSchema>();

  async function handleNext() {
    const valid = await trigger([
      "hotelName",
      "description",
      "establishedYear",
    ]);

    if (valid) next();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
      {/* Heading */}

      <div className="mb-8 sm:mb-10">
        <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:text-sm">
          Step 1 of 7
        </span>

        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          Tell us about your hotel
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          This information helps travelers discover your property and builds
          trust in your business listing.
        </p>
      </div>

      {/* Card */}

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm sm:rounded-3xl">
        {/* Card Header */}

        <div className="border-b bg-muted/30 px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-start gap-4 sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:h-14 sm:w-14 sm:rounded-2xl">
              <Building2 className="size-6 text-primary sm:size-7" />
            </div>

            <div>
              <h2 className="text-lg font-semibold sm:text-xl">
                Basic Information
              </h2>

              <p className="text-sm text-muted-foreground">
                Let's start with the essentials.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}

        <div className="space-y-8 p-5 sm:p-8 lg:p-10">
          <FieldGroup className="gap-8">
            {/* Hotel Name */}

            <Field className="gap-3" data-invalid={!!errors.hotelName}>
              <FieldLabel>Hotel Name</FieldLabel>

              <Input
                className="h-12"
                placeholder="e.g. Hotel Everest"
                {...register("hotelName")}
              />

              <p className="text-sm text-muted-foreground">
                Use your registered or publicly recognized hotel name.
              </p>

              <FieldError errors={[errors.hotelName]} />
            </Field>

            {/* Description */}

            <Field className="gap-3" data-invalid={!!errors.description}>
              <FieldLabel>Hotel Description</FieldLabel>

              <Textarea
                rows={7}
                className="resize-none"
                placeholder="Describe your hotel, nearby attractions, room types, hospitality, amenities, and what makes your property unique..."
                {...register("description")}
              />

              <p className="text-sm text-muted-foreground">
                A detailed description improves guest confidence and booking
                conversions.
              </p>

              <FieldError errors={[errors.description]} />
            </Field>

            {/* Established Year */}

            <Field className="gap-3" data-invalid={!!errors.establishedYear}>
              <FieldLabel className="flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                Established Year
              </FieldLabel>

              <Input
                type="number"
                className="h-12 w-full sm:max-w-xs"
                placeholder="2018"
                {...register("establishedYear", {
                  valueAsNumber: true,
                })}
              />

              <p className="text-sm text-muted-foreground">
                When did your hotel start operating?
              </p>

              <FieldError errors={[errors.establishedYear]} />
            </Field>
          </FieldGroup>

          {/* Footer */}

          <div className="border-t pt-6 sm:pt-8">
            <Button
              type="button"
              size="lg"
              onClick={handleNext}
              className="w-full rounded-xl sm:ml-auto sm:flex sm:w-auto sm:min-w-36"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
