"use client";

import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { HotelSchema } from "../../../schemas/hotel.schema";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

interface MediaUploadStepProps {
  next: () => void;
  previous: () => void;
}

export default function MediaUploadStep({
  next,
  previous,
}: MediaUploadStepProps) {
  const {
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useFormContext<HotelSchema>();

  const coverImage = watch("coverImage");
  const galleryImages = watch("galleryImages") ?? [];

  function addGalleryImage(image: { imageUrl: string; publicId: string }) {
    const current = getValues("galleryImages") ?? [];

    setValue("galleryImages", [...current, image], {
      shouldValidate: true,
    });
  }

  function removeGallery(publicId: string) {
    setValue(
      "galleryImages",
      galleryImages.filter(
        (_: { imageUrl: string; publicId: string }) => _.publicId !== publicId,
      ),
    );
  }

  async function handleNext() {
    const valid = await trigger(["coverImage", "galleryImages"]);
    if (valid) next();
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      {/* Header */}

      <div className="mb-10">
        <p className="text-sm font-medium text-primary">Step 5 of 5</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">Hotel Photos</h1>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          Upload beautiful photos of your property. Hotels with quality photos
          receive significantly more bookings.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b bg-muted/30 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <ImagePlus className="size-6" />
            </div>

            <div>
              <h2 className="font-semibold text-lg">Property Images</h2>

              <p className="text-sm text-muted-foreground">
                Showcase your hotel with attractive photos.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-10 p-5 sm:p-8 lg:p-10">
          <FieldGroup className="gap-10">
            {/* Cover Image */}

            <Field data-invalid={!!errors.coverImage}>
              <FieldLabel>Cover Image</FieldLabel>

              <CldUploadWidget
                signatureEndpoint="/api/sign-cloudinary"
                options={{
                  folder: "tourism/hotels",
                  multiple: false,
                }}
                onSuccess={(result: any) => {
                  setValue(
                    "coverImage",
                    {
                      imageUrl: result.info.secure_url,
                      publicId: result.info.public_id,
                    },
                    {
                      shouldValidate: true,
                    },
                  );
                }}
                onError={(error) => {
                  console.error("ERROR", error);
                }}
              >
                {({ open }) =>
                  coverImage.imageUrl ? (
                    <div className="relative overflow-hidden rounded-xl border">
                      <Image
                        src={coverImage.imageUrl}
                        alt="Cover"
                        width={1200}
                        height={500}
                        className="h-72 w-full object-cover"
                      />

                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute right-4 top-4"
                        onClick={() =>
                          setValue("coverImage", { imageUrl: "", publicId: "" })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="flex h-72 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition hover:border-primary hover:bg-muted/40"
                    >
                      <Upload className="mb-4 size-10 text-primary" />

                      <p className="font-medium">Upload Cover Image</p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        PNG, JPG, WEBP
                      </p>
                    </button>
                  )
                }
              </CldUploadWidget>

              <FieldError errors={[errors.coverImage]} />
            </Field>

            {/* Gallery */}

            <Field data-invalid={!!errors.galleryImages}>
              <FieldLabel>Gallery Images</FieldLabel>

              <CldUploadWidget
                signatureEndpoint="/api/sign-cloudinary"
                options={{
                  folder: "tourism/hotels",
                  multiple: true,
                }}
                onSuccess={(result: any) => {
                  addGalleryImage({
                    imageUrl: result.info.secure_url,
                    publicId: result.info.public_id,
                  });
                }}
              >
                {({ open }) => (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => open()}
                  >
                    <Upload className="mr-2 size-4" />
                    Add Images
                  </Button>
                )}
              </CldUploadWidget>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {galleryImages
                  .filter((image) => image.imageUrl)
                  .map((image: { imageUrl: string; publicId: string }) => (
                    <div
                      key={image.publicId}
                      className="group relative overflow-hidden rounded-xl border"
                    >
                      <Image
                        src={image.imageUrl}
                        alt=""
                        width={400}
                        height={300}
                        className="aspect-4/3 w-full object-cover transition group-hover:scale-105"
                      />

                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute right-2 top-2"
                        onClick={() => removeGallery(image.publicId)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
              </div>

              <FieldError errors={[errors.galleryImages]} />
            </Field>

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

              <Button size="lg" type="button" onClick={handleNext}>
                Review Details
              </Button>
            </div>
          </FieldGroup>
        </div>
      </div>
    </div>
  );
}
