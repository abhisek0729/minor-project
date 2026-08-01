"use client";

import Image from "next/image";
import { FileCheck2, Upload, Trash2, ShieldCheck } from "lucide-react";
import { useRef } from "react";
import { useFormContext } from "react-hook-form";

import { HotelSchema } from "../../schemas/hotel.schema";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

interface VerificationStepProps {
  previous: () => void;
  next: () => void;
}

export default function VerificationStep({
  previous,
  next,
}: VerificationStepProps) {
  const {
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<HotelSchema>();

  const registrationCertificate = watch("registrationCertificate");
  const panCertificate = watch("panCertificate");

  const registrationInputRef = useRef<HTMLInputElement>(null);
  const panInputRef = useRef<HTMLInputElement>(null);

  function handleRegistrationUpload(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    const preview = URL.createObjectURL(file);

    // TODO: Replace with Cloudinary upload
    setValue("registrationCertificate", preview, {
      shouldValidate: true,
    });
  }

  function handlePanUpload(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    const preview = URL.createObjectURL(file);

    // TODO: Replace with Cloudinary upload
    setValue("panCertificate", preview, {
      shouldValidate: true,
    });
  }

  async function handleNext() {
    const valid = await trigger([
      "registrationCertificate",
      "panCertificate",
    ]);

    if (valid) {
      next();
    }
  }

  function UploadCard({
    title,
    description,
    value,
    inputRef,
    onChange,
    remove,
  }: {
    title: string;
    description: string;
    value?: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    remove: () => void;
  }) {
    return (
      <div className="rounded-xl border bg-card">
        <input
          hidden
          type="file"
          accept="image/*,.pdf"
          ref={inputRef}
          onChange={onChange}
        />

        {!value ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-72 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors hover:border-primary hover:bg-muted/40"
          >
            <Upload className="mb-4 size-10 text-primary" />

            <h3 className="font-semibold">{title}</h3>

            <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
              {description}
            </p>
          </button>
        ) : (
          <div className="relative">
            <Image
              src={value}
              alt={title}
              width={700}
              height={500}
              className="h-72 w-full rounded-xl object-cover"
            />

            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute right-3 top-3"
              onClick={remove}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      {/* Header */}

      <div className="mb-10">
        <p className="text-sm font-medium text-primary">
          Step 6 of 7
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Business Verification
        </h1>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          Upload your legal business documents. These documents are only
          visible to administrators and are required before your hotel can be
          approved.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        {/* Card Header */}

        <div className="border-b bg-muted/30 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <ShieldCheck className="size-6" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Verification Documents
              </h2>

              <p className="text-sm text-muted-foreground">
                Upload clear images or PDF copies of your legal documents.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}

        <div className="space-y-8 p-5 sm:p-8 lg:p-10">
          <FieldGroup className="gap-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Registration Certificate */}

              <Field data-invalid={!!errors.registrationCertificate}>
                <FieldLabel className="mb-4">
                  Registration Certificate
                </FieldLabel>

                <UploadCard
                  title="Upload Registration Certificate"
                  description="PNG, JPG or PDF"
                  value={registrationCertificate}
                  inputRef={registrationInputRef}
                  onChange={handleRegistrationUpload}
                  remove={() =>
                    setValue("registrationCertificate", "", {
                      shouldValidate: true,
                    })
                  }
                />

                <FieldError
                  errors={[errors.registrationCertificate]}
                />
              </Field>

              {/* PAN Certificate */}

              <Field data-invalid={!!errors.panCertificate}>
                <FieldLabel className="mb-4">
                  PAN Certificate
                </FieldLabel>

                <UploadCard
                  title="Upload PAN Certificate"
                  description="PNG, JPG or PDF"
                  value={panCertificate}
                  inputRef={panInputRef}
                  onChange={handlePanUpload}
                  remove={() =>
                    setValue("panCertificate", "", {
                      shouldValidate: true,
                    })
                  }
                />

                <FieldError
                  errors={[errors.panCertificate]}
                />
              </Field>
            </div>

            {/* Information Box */}

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-start gap-3">
                <FileCheck2 className="mt-0.5 size-5 shrink-0 text-primary" />

                <div>
                  <h3 className="font-semibold">
                    What happens after submission?
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Our team will review your hotel information, verify the
                    uploaded documents, and approve your account. Once approved,
                    your hotel listing will become visible to travelers across
                    the platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="flex flex-col-reverse gap-3 border-t pt-8 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                size="lg"
                type="button"
                onClick={previous}
              >
                Back
              </Button>

              <Button
                size="lg"
                type="button"
                onClick={handleNext}
                className="min-w-44"
              >
                Review Details
              </Button>
            </div>
          </FieldGroup>
        </div>
      </div>
    </div>
  );
}