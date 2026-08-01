"use client";

import { Globe, Mail, Phone, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { useFormContext } from "react-hook-form";

import { HotelSchema } from "../../schemas/hotel.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

interface ContactInformationStepProps {
  next: () => void;
  previous: () => void;
}

export default function ContactInformationStep({
  next,
  previous,
}: ContactInformationStepProps) {
  const { data: session } = useSession();

  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext<HotelSchema>();

  async function handleNext() {
    const valid = await trigger([
      "phone",
      "website",
    ]);

    if (valid) {
      next();
    }
  }

  return (
    <div className="mx-auto px-4 sm:px-6 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Heading */}

      <div className="mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <Sparkles className="size-3.5" />
          Step 2 of 5
        </span>

        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Contact Information
        </h1>

        <p className="mt-3 max-w-2xl text-muted-foreground leading-7">
          Provide the contact details guests will use to reach your hotel.
        </p>
      </div>

      {/* Card */}

      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm transition-shadow hover:shadow-md">

        {/* Card Header */}

        <div className="border-b bg-muted/30 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Phone className="size-7 text-primary" />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                Contact Details
              </h2>

              <p className="text-sm text-muted-foreground">
                Guests will use these details to communicate with your hotel.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}

        <div className="space-y-8 p-5 sm:p-8 lg:p-10">
          <FieldGroup className="gap-8">

            {/* Account Email */}

            <Field className="gap-3">
              <FieldLabel className="flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                Account Email
              </FieldLabel>

              <Input
                value={session?.user.email ?? ""}
                readOnly
                disabled
                className="h-12 bg-muted/50"
              />

              <p className="text-sm text-muted-foreground">
                This verified email is used for login and account-related
                notifications.
              </p>
            </Field>

            {/* Phone */}

            <Field
              className="gap-3"
              data-invalid={!!errors.phone}
            >
              <FieldLabel className="flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                Phone Number
              </FieldLabel>

              <Input
                placeholder="+977 98XXXXXXXX"
                className="h-12 transition-colors focus-visible:ring-2 focus-visible:ring-primary/40"
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />

              <p className="text-sm text-muted-foreground">
                This number will be visible to guests for inquiries and
                reservations.
              </p>

              <FieldError errors={[errors.phone]} />
            </Field>

            {/* Website */}

            <Field
              className="gap-3"
              data-invalid={!!errors.website}
            >
              <FieldLabel className="flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                Website
                <span className="font-normal text-muted-foreground">
                  (Optional)
                </span>
              </FieldLabel>

              <Input
                placeholder="https://yourhotel.com"
                className="h-12 transition-colors focus-visible:ring-2 focus-visible:ring-primary/40"
                autoComplete="url"
                aria-invalid={!!errors.website}
                {...register("website")}
              />

              <p className="text-sm text-muted-foreground">
                Add your official website if you have one.
              </p>

              <FieldError errors={[errors.website]} />
            </Field>

          </FieldGroup>

          {/* Footer */}

          <div className="flex flex-col-reverse gap-3 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={previous}
              className="min-w-36 rounded-xl transition-transform active:scale-[0.98]"
            >
              Back
            </Button>

            <Button
              type="button"
              size="lg"
              onClick={handleNext}
              className="min-w-36 rounded-xl transition-transform active:scale-[0.98]"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}