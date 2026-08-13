"use client";

import { Check } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { RoomSchema } from "../../schemas/room.schema";
import { FACILITIES_ICONS } from "../../constants/icon-mapper";

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";



interface Facility {
  id: number;
  name: string;
  icon: string;
}

interface RoomFacilitySelectorProps {
  facilities: Facility[];
}

export default function RoomFacilitySelector({
  facilities,
}: RoomFacilitySelectorProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<RoomSchema>();

  const selectedFacilities = watch("facilityIds") ?? [];

  function toggleFacility(facilityId: number) {
    if (selectedFacilities.includes(facilityId)) {
      setValue(
        "facilityIds",
        selectedFacilities.filter((id) => id !== facilityId),
        {
          shouldValidate: true,
        }
      );

      return;
    }

    setValue(
      "facilityIds",
      [...selectedFacilities, facilityId],
      {
        shouldValidate: true,
      }
    );
  }

  return (
    <Field data-invalid={!!errors.facilityIds}>
      <FieldLabel>Room Facilities</FieldLabel>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((facility) => {
          const selected = selectedFacilities.includes(facility.id);
          const Icon = FACILITIES_ICONS[facility.icon as keyof typeof FACILITIES_ICONS];

          return (
            <button
              key={facility.id}
              type="button"
              onClick={() => toggleFacility(facility.id)}
              className={cn(
                "flex items-center justify-between rounded-lg border p-4 text-left transition-all",
                "hover:border-primary hover:bg-primary/5",
                selected &&
                  "border-primary bg-primary/10"
              )}
            >
              <div className="flex items-center gap-3">
                {/* Replace with your icon renderer later */}
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  {Icon && <Icon className="h-5 w-5" />}
                </div>

                <span className="font-medium">
                  {facility.name}
                </span>
              </div>

              {selected && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </button>
          );
        })}
      </div>

      <FieldError errors={[errors.facilityIds]} />
    </Field>
  );
}