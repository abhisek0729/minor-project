"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  value: string[];
  folder?: string;
  maxFiles?: number;
}

export default function ImageUpload({
  disabled,
  onChange,
  onRemove,
  value,
  folder = "tourism/general",
  maxFiles = 1,
}: ImageUploadProps) {
  // Prevent hydration mismatch errors
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const onUpload = (result: any) => {
    // result.info.secure_url contains the direct image link from Cloudinary
    if (result?.info?.secure_url) {
      onChange([result.info.secure_url]);
    }
  };

  return (
    <div>
      {/* PREVIEW SECTION */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {value.map((url) => (
          <div
            key={url}
            className="relative h-[200px] w-[200px] overflow-hidden rounded-xl border border-border shadow-sm"
          >
            <div className="absolute right-2 top-2 z-10">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="icon"
                className="h-8 w-8 shadow-md"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Uploaded Image"
              src={url}
              sizes="200px"
            />
          </div>
        ))}
      </div>

      {/* CLOUDINARY UPLOAD WIDGET */}
      <CldUploadWidget
        onSuccess={onUpload}
        // Points to the signature API route you created earlier for secure uploads
        signatureEndpoint="/api/sign-cloudinary" 
        options={{
          folder: folder,
          maxFiles: maxFiles,
          resourceType: "image",
          clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
        }}
      >
        {({ open }) => {
          const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            open();
          };

          return (
            <Button
              type="button"
              disabled={disabled}
              variant="secondary"
              onClick={onClick}
              className="w-full sm:w-auto"
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              Upload an Image
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}