"use client";

import { MapPin, MapPinned, Navigation } from "lucide-react";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import { HotelSchema } from "../../../schemas/hotel.schema";
import { provinces } from "../../../data/nepal-location";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationStepProps {
  next: () => void;
  previous: () => void;
}

export default function LocationStep({
  next,
  previous,
}: LocationStepProps) {
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<HotelSchema>();

  const province = watch("province");
  const district = watch("district");

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.name === province),
    [province],
  );

  const selectedDistrict = useMemo(
    () =>
      selectedProvince?.districts.find(
        (d) => d.name === district,
      ),
    [selectedProvince, district],
  );

  async function handleNext() {
    const valid = await trigger([
      "province",
      "district",
      "municipality",
      "ward",
      "street",
    ]);

    if (valid) next();
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
      {/* Header */}

      <div className="mb-10">
        <p className="text-sm font-medium text-primary">
          Step 3 of 5
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Hotel Location
        </h1>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          Help travelers discover your property by providing its
          complete location.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        {/* Card Header */}

        <div className="border-b bg-muted/30 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <MapPin className="size-6" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Property Address
              </h2>

              <p className="text-sm text-muted-foreground">
                This will be displayed to guests after booking.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}

        <div className="space-y-10 p-5 sm:p-8 lg:p-10">
          <FieldGroup className="gap-8">
            {/* Province */}

            <Field
              className="gap-3"
              data-invalid={!!errors.province}
            >
              <FieldLabel>Province</FieldLabel>

              <Select
                value={province}
                onValueChange={(value) => {
                  setValue("province", value!);
                  setValue("district", "");
                  setValue("municipality", "");
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>

                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem
                      key={province.id}
                      value={province.name}
                    >
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FieldError errors={[errors.province]} />
            </Field>

            {/* District & Municipality */}

            <div className="grid gap-6 lg:grid-cols-2">
              <Field
                className="gap-3"
                data-invalid={!!errors.district}
              >
                <FieldLabel>District</FieldLabel>

                <Select
                  value={district}
                  onValueChange={(value) => {
                    setValue("district", value!);
                    setValue("municipality", "");
                  }}
                  disabled={!selectedProvince}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>

                  <SelectContent>
                    {selectedProvince?.districts.map(
                      (district) => (
                        <SelectItem
                          key={district.name}
                          value={district.name}
                        >
                          {district.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>

                <FieldError errors={[errors.district]} />
              </Field>

              <Field
                className="gap-3"
                data-invalid={!!errors.municipality}
              >
                <FieldLabel>Municipality</FieldLabel>

                <Select
                  value={watch("municipality")}
                  onValueChange={(value) =>
                    setValue("municipality", value!)
                  }
                  disabled={!selectedDistrict}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select Municipality" />
                  </SelectTrigger>

                  <SelectContent>
                    {selectedDistrict?.municipalities.map(
                      (municipality) => (
                        <SelectItem
                          key={municipality}
                          value={municipality}
                        >
                          {municipality}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>

                <FieldError
                  errors={[errors.municipality]}
                />
              </Field>
            </div>

            {/* Ward & Street */}

            <div className="grid gap-6 lg:grid-cols-3">
              <Field
                className="gap-3"
                data-invalid={!!errors.ward}
              >
                <FieldLabel>Ward No.</FieldLabel>

                <Input
                  type="number"
                  min={1}
                  max={35}
                  placeholder="1"
                  className="h-12"
                  {...register("ward")}
                />

                <FieldError errors={[errors.ward]} />
              </Field>

              <Field
                className="gap-3 lg:col-span-2"
                data-invalid={!!errors.street}
              >
                <FieldLabel>Street / Tole</FieldLabel>

                <Input
                  placeholder="Putalisadak, Lakeside, Bhedetar..."
                  className="h-12"
                  {...register("street")}
                />

                <FieldError errors={[errors.street]} />
              </Field>
            </div>
          </FieldGroup>

          {/* Map Section */}

          <div className="rounded-2xl border border-dashed bg-muted/20 p-10">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MapPinned className="size-8" />
              </div>

              <h3 className="text-lg font-semibold">
                Pin Your Hotel Location
              </h3>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                In the next version you'll be able to drag a marker
                on the map to set the exact location of your hotel.
                This improves search accuracy and navigation.
              </p>

              <Button
                variant="secondary"
                disabled
                className="mt-6"
              >
                <Navigation className="mr-2 size-4" />
                Map Picker Coming Soon
              </Button>
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
              className="min-w-36"
              onClick={handleNext}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}