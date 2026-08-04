"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import HotelStepper from "./HotelSteeper";
import BasicInformationStep from "./steps/BasicInformation";
import ContactInformationStep from "./steps/ContactInformation";
import LocationStep from "./steps/Location";
import FacilitiesStep from "./steps/Facilities";
import MediaUploadStep from "./steps/MediaUpload";
import VerificationStep from "./steps/Verification";
import ReviewStep from "./steps/Review";
import { FacilityIconKey } from "./steps/Facilities";
import { createHotel } from "../../actions/createHotel";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { hotelSchema, HotelSchema } from "../../schemas/hotel.schema";
import { toast } from "sonner";

type HotelInput = z.input<typeof hotelSchema>;
type HotelOutput = z.output<typeof hotelSchema>;

const TOTAL_STEPS = 6;
interface HotelOnboardingFormProps {
  facilities: {id:number, name: string; icon: FacilityIconKey }[];
}

export default function HotelOnboardingForm(props: HotelOnboardingFormProps) {
  const [step, setStep] = useState(1);
  const {data : session } = useSession();
  const router = useRouter();

  const methods = useForm<HotelInput, unknown, HotelOutput>({
    resolver: zodResolver(hotelSchema),
    mode: "onTouched",
    defaultValues: {
      // Step 1
      hotelName: "",
      description: "",
      establishedYear: undefined,

      // Step 2
      phone: "",
      email: session?.user?.email || "",
      website: "",

      // Step 3
      province: "",
      district: "",
      municipality: "",
      ward: "",
      street: "",
      latitude: undefined,
      longitude: undefined,

      // Step 4
      facilities: [],

      // Step 5
      coverImage: {
        imageUrl: "",
        publicId: "",
      },
      galleryImages: [],
    },
  });

  function nextStep() {
    if (step < TOTAL_STEPS) {
      setStep((prev) => prev + 1);
    }
  }

  function previousStep() {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  }

  async function onSubmit(data: HotelSchema) {

    const result = await createHotel(data);
    if(result.success){
      toast.success("Hotel information added successfully");
      router.push("/dashboard/hotels");
    }
    else{
      toast.error(result.message || "Failed to add hotel information");
    }
  }

  const steps: React.ReactNode[] = [
    <BasicInformationStep next={nextStep} />,
    <ContactInformationStep next={nextStep} previous={previousStep} />,
    <LocationStep next={nextStep} previous={previousStep} />,
    <FacilitiesStep predefinedFacilities={props.facilities} next={nextStep} previous={previousStep} />,
    <MediaUploadStep next={nextStep} previous={previousStep} />,
    // <VerificationStep next={nextStep} previous={previousStep} />,

    <ReviewStep
      predefinedFacilities={props.facilities}
      previous={previousStep}
      isSubmitting={methods.formState.isSubmitting}
    />,
  ];

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="mx-auto max-w-6xl space-y-8 py-10"
      >
        <HotelStepper currentStep={step} totalSteps={TOTAL_STEPS} />

        {steps[step - 1]}
      </form>
    </FormProvider>
  );
}
