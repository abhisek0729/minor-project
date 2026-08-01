"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Wifi,
  Car,
  UtensilsCrossed,
  Dumbbell,
  Waves,
  ShieldCheck,
  Coffee,
  Snowflake,
  Tv,
  WashingMachine,
  PawPrint,
  Accessibility,
  Plus,
  X,
} from "lucide-react";

import { HotelSchema } from "../../schemas/hotel.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export const facilityIcons = {
  wifi: Wifi,
  car: Car,
  "utensils-crossed": UtensilsCrossed,
  dumbbell: Dumbbell,
  waves: Waves,
  "shield-check": ShieldCheck,
  coffee: Coffee,
  snowflake: Snowflake,
  tv: Tv,
  "washing-machine": WashingMachine,
  "paw-print": PawPrint,
  accessibility: Accessibility,
};
export type FacilityIconKey = keyof typeof facilityIcons;

interface FacilitiesStepProps {
  predefinedFacilities: { id: number; name: string; icon: FacilityIconKey }[];
  next: () => void;
  previous: () => void;
}

// const predefinedFacilities = [
//   { value: "Free WiFi", icon: Wifi },
//   { value: "Parking", icon: Car },
//   { value: "Restaurant", icon: UtensilsCrossed },
//   { value: "Gym", icon: Dumbbell },
//   { value: "Swimming Pool", icon: Waves },
//   { value: "24/7 Security", icon: ShieldCheck },
//   { value: "Breakfast Included", icon: Coffee },
//   { value: "Air Conditioning", icon: Snowflake },
//   { value: "Television", icon: Tv },
//   { value: "Laundry Service", icon: WashingMachine },
//   { value: "Pet Friendly", icon: PawPrint },
//   { value: "Wheelchair Accessible", icon: Accessibility },
// ];

export default function FacilitiesStep({
  predefinedFacilities,
  next,
  previous,
}: FacilitiesStepProps) {
  const {
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<HotelSchema>();


  const selectedFacilities = watch("facilities") ?? [];

  function toggleFacility(facilityId : number) {
    const exists = selectedFacilities.includes(facilityId);

    if (exists) {
      setValue(
        "facilities",
        selectedFacilities.filter((item) => item !== facilityId),
        {
          shouldValidate: true,
        }
      );
    } else {
      setValue(
        "facilities",
        [...selectedFacilities, facilityId],
        {
          shouldValidate: true,
        }
      );
    }
  }

  async function handleNext() {
    const valid = await trigger("facilities");

    if (valid) next();
  }



  return (
    <div className="mx-auto w-full  px-4 sm:px-6">
      {/* Header */}

      <div className="mb-10">
        <p className="text-sm font-medium text-primary">
          Step 4 of 5
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Hotel Facilities
        </h1>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          Select the facilities available at your hotel.
          You can also add your own unique amenities.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        {/* Card Header */}

        <div className="border-b bg-muted/30 px-8 py-6">
          <h2 className="text-lg font-semibold">
            Available Amenities
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Choose all that apply.
          </p>
        </div>

        {/* Body */}

        <div className="space-y-8 p-5 sm:p-8 lg:p-10">
          <FieldGroup className="gap-6">
            <Field data-invalid={!!errors.facilities}>
              <FieldLabel className="mb-4">
                Common Facilities
              </FieldLabel>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {predefinedFacilities.map((facility) => {
                  const Icon = facilityIcons[facility.icon];

                  const active =
                    selectedFacilities.includes(
                      facility.id
                    );

                  return (
                    <button
                      key={facility.id}
                      type="button"
                      onClick={() =>
                        toggleFacility(facility.id)
                      }
                      className={`flex items-center gap-4 rounded-xl border p-2 py-3 text-left transition-all ${
                        active
                          ? "border-primary bg-primary/10"
                          : "hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <div
                        className={`rounded-lg p-2 ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <Icon className="size-5" />
                      </div>

                      <div className="font-medium">
                        {facility.name}
                      </div>
                    </button>
                  );
                })}
              </div>

              <FieldError
                errors={[errors.facilities]}
              />
            </Field>

            {/* Custom Facilities */}

            {/* <div className="space-y-4 border-t pt-8">
              <FieldLabel>
                Other Facilities
              </FieldLabel> */}

              {/* <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={facilityInput}
                  placeholder="Conference Hall"
                  onChange={(e) =>
                    setFacilityInput(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFacility();
                    }
                  }}
                />

                <Button
                  type="button"
                  onClick={addFacility}
                >
                  <Plus className="mr-2 size-4" />
                  Add
                </Button>
              </div> */}

              {/* {customFacilities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customFacilities.map(
                    (facility) => (
                      <button
                        key={facility}
                        type="button"
                        onClick={() =>
                          removeFacility(
                            facility
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-full border bg-primary/10 px-4 py-2 text-sm transition hover:bg-destructive hover:text-destructive-foreground"
                      >
                        {facility}

                        <X className="size-3.5" />
                      </button>
                    )
                  )}
                </div>
              )} */}
            {/* </div> */}

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
          </FieldGroup>
        </div>
      </div>
    </div>
  );
}