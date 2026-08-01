"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { signUpSchema } from "@/app/features/auth/schemas/sign-up-schema";
import { clearPartnerRole } from "@/app/features/auth/actions/partner-role";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import {
  AuthLogo,
  AuthHeading,
  GoogleButton,
  AuthDivider,
  PasswordInput,
  AuthFooter,
} from "@/app/features/auth/components";

export default function SignUpForm({ role,mode }: { role: string | undefined, mode : "partner-signup" | "signin" | "tourist-signup" }) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof signUpSchema>) {
    try {
      await clearPartnerRole();
      setIsSubmitting(true);
      const res = await axios.post("/api/auth/register", {
        ...data,
        role: role,
      });
      
      if (res.data.success) {
        toast.success(res.data.message);
        router.replace(`/verify-email/${data.email}`);
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-5">
        <AuthLogo />
      </div>

      <AuthHeading
        title="Create Account"
        description="Join TravelAgent and start exploring Nepal with AI-powered trip planning."
      />

      <GoogleButton mode={mode} />

      <AuthDivider />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FieldGroup className="gap-2">
          {/* Name */}

          <Field className="gap-1" data-invalid={!!form.formState.errors.name}>
            <FieldLabel>Full Name</FieldLabel>

            <Input
              placeholder="Enter your full name"
              {...form.register("name")}
            />

            <div className="min-h-5">
              <FieldError errors={[form.formState.errors.name]} />
            </div>
          </Field>

          {/* Email */}

          <Field className="gap-1" data-invalid={!!form.formState.errors.email}>
            <FieldLabel>Email</FieldLabel>

            <Input
              type="email"
              placeholder="Enter your email"
              {...form.register("email")}
            />

            <div className="min-h-5">
              <FieldError errors={[form.formState.errors.email]} />
            </div>
          </Field>

          {/* Password */}

          <PasswordInput
            form={form}
            name="password"
            placeholder="Create a password"
          />
        </FieldGroup>

        <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <AuthFooter
        text="Already have an account?"
        linkText="Sign In"
        href="/sign-in"
      />
    </>
  );
}
