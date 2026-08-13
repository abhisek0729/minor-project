"use client";

import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";

import { Textarea } from "@/components/ui/textarea";

import RoomImagesUploader from "./RoomImageUploader";
import RoomFacilitySelector from "./RoomFacilitySelector";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createRoom } from "../../actions/createRoom";
import { RoomSchema, roomSchema } from "../../schemas/room.schema";
import z from "zod";
import { Button } from "@/components/ui/button";
import { updateRoom } from "../../actions/updateRoom";

type RoomInput = z.input<typeof roomSchema>;
type RoomOutput = z.output<typeof roomSchema>;

interface Facility {
  id: number;
  name: string;
  icon: string;
}

interface RoomFormProps {
  mode: "create" | "edit";
  roomId?: number;
  initialData?: RoomSchema;
  facilities: Facility[];
}

export default function RoomForm({
  mode,
  roomId,
  initialData,
  facilities,
}: RoomFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const methods = useForm<RoomInput, unknown, RoomOutput>({
    resolver: zodResolver(roomSchema),
    defaultValues: initialData ?? {
      roomNumber: "",
      roomType: "single",
      description: "",
      pricePerNight: 0,
      capacity: 1,
      status: "available",
      facilityIds: [],
      imageUrls: [],
    },
  });

  const handleSubmit = (data: RoomSchema) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createRoom(data)
          : await updateRoom({
              roomId: roomId!,
              data,
            });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.push("/dashboard/hotels/rooms");
    //   router.refresh();
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "create" ? "Add New Room" : "Edit Room"}
            </CardTitle>
            <CardDescription>
              {mode === "create"
                ? "Enter the basic information about this room."
                : "Update the room information."}
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6 md:grid-cols-2">
            {/* Room Number */}

            <Field data-invalid={!!methods.formState.errors.roomNumber}>
              <FieldLabel>Room Number</FieldLabel>

              <Input placeholder="101" {...methods.register("roomNumber")} />

              <FieldError errors={[methods.formState.errors.roomNumber]} />
            </Field>

            {/* Room Type */}

            <Field data-invalid={!!methods.formState.errors.roomType}>
              <FieldLabel>Room Type</FieldLabel>

              <Select
                value={methods.watch("roomType")}
                onValueChange={(value) =>
                  methods.setValue(
                    "roomType",
                    value as RoomSchema["roomType"],
                    {
                      shouldValidate: true,
                    },
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>

                  <SelectItem value="double">Double</SelectItem>

                  <SelectItem value="twin">Twin</SelectItem>

                  <SelectItem value="family">Family</SelectItem>

                  <SelectItem value="suite">Suite</SelectItem>
                </SelectContent>
              </Select>

              <FieldError errors={[methods.formState.errors.roomType]} />
            </Field>

            {/* Price */}

            <Field data-invalid={!!methods.formState.errors.pricePerNight}>
              <FieldLabel>Price Per Night (NPR)</FieldLabel>

              <Input
                type="number"
                min={0}
                placeholder="2500"
                {...methods.register("pricePerNight")}
              />

              <FieldError errors={[methods.formState.errors.pricePerNight]} />
            </Field>

            {/* Capacity */}

            <Field data-invalid={!!methods.formState.errors.capacity}>
              <FieldLabel>Capacity</FieldLabel>

              <Input
                type="number"
                min={1}
                placeholder="2"
                {...methods.register("capacity")}
              />

              <FieldError errors={[methods.formState.errors.capacity]} />
            </Field>

            {/* Status */}

            <Field
              className="md:col-span-2"
              data-invalid={!!methods.formState.errors.status}
            >
              <FieldLabel>Status</FieldLabel>

              <Select
                value={methods.watch("status")}
                onValueChange={(value) =>
                  methods.setValue("status", value as RoomSchema["status"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>

                  <SelectItem value="maintenance">Under Maintenance</SelectItem>

                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <FieldError errors={[methods.formState.errors.status]} />
            </Field>
          </CardContent>
        </Card>

        {/* Description */}

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>

            <CardDescription>
              Describe the room and highlight its features.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Field data-invalid={!!methods.formState.errors.description}>
              <FieldLabel>Room Description</FieldLabel>

              <Textarea
                rows={6}
                placeholder="Spacious room with mountain views, private balcony, air conditioning..."
                {...methods.register("description")}
              />

              <FieldError errors={[methods.formState.errors.description]} />
            </Field>
          </CardContent>
        </Card>

        {/* Images */}

        <Card>
          <CardHeader>
            <CardTitle>Room Images</CardTitle>

            <CardDescription>
              Upload high-quality photos of this room.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <RoomImagesUploader />
          </CardContent>
        </Card>

        {/* Facilities */}

        <Card>
          <CardHeader>
            <CardTitle>Facilities</CardTitle>

            <CardDescription>
              Select the amenities available in this room.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <RoomFacilitySelector facilities={facilities} />
          </CardContent>
        </Card>

        {/* Actions */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              methods.reset(
                initialData ?? {
                  roomNumber: "",
                  roomType: "single",
                  description: "",
                  pricePerNight: 0,
                  capacity: 1,
                  status: "available",
                  facilityIds: [],
                  imageUrls: [],
                },
              )
            }
          >
            Reset
          </Button>

          <Button type="submit" disabled={isPending}>
            {isPending
              ? mode === "create"
                ? "Creating Room..."
                : "Saving Changes..."
              : mode === "create"
                ? "Create Room"
                : "Save Changes"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
