"use client";

import Image from "next/image";
import { CldUploadWidget, CloudinaryUploadWidgetResults, } from "next-cloudinary";
import { Trash2, Upload } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { RoomSchema } from "../../schemas/room.schema";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

type UploadedImage = RoomSchema["imageUrls"][number];

const MAX_IMAGES = 10;

export default function RoomImagesUploader() {
  const {
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<RoomSchema>();

  const images = watch("imageUrls");

  function addImage(image: UploadedImage) {
    const current = getValues("imageUrls");

    const exists = current.some(
      (item) => item.publicId === image.publicId,
    );

    if (exists) {
      return;
    }

    setValue("imageUrls", [...current, image], {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  function removeImage(publicId: string) {
    setValue(
      "imageUrls",
      images.filter((image) => image.publicId !== publicId),
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );
  }

  return (
    <Field data-invalid={!!errors.imageUrls}>
      <FieldLabel>Room Images</FieldLabel>

      <CldUploadWidget
        signatureEndpoint="/api/sign-cloudinary"
        options={{
          folder: "tourism/rooms",
          multiple: true,
          maxFiles: MAX_IMAGES,
        }}
        onSuccess={(result:CloudinaryUploadWidgetResults) => {
          if (!result.info || typeof result.info === "string") {
            return;
          }

          addImage({
            imageUrl: result.info.secure_url,
            publicId: result.info.public_id,
          });
        }}
        onError={() => {
          toast.error("Failed to upload image.");
        }}
      >
        {({ open }) => (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (images.length >= MAX_IMAGES) {
                toast.error(
                  `You can upload a maximum of ${MAX_IMAGES} images.`,
                );
                return;
              }

              open();
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Images
          </Button>
        )}
      </CldUploadWidget>

      {images.length === 0 ? (
        <div className="mt-6 flex h-48 items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            No images uploaded yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.publicId}
              className="group relative overflow-hidden rounded-lg border"
            >
              <Image
                src={image.imageUrl}
                alt={`Room image ${index + 1}`}
                width={400}
                height={300}
                className="aspect-4/3 w-full object-cover transition-all duration-300 group-hover:scale-105"
              />

              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => removeImage(image.publicId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <FieldError errors={[errors.imageUrls]} />
    </Field>
  );
}