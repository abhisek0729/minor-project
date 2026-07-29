"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SignInSchema } from "@/app/features/auth/schemas/sign-in-schema";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import {
  AuthLogo,
  AuthHeading,
  GoogleButton,
  AuthDivider,
  PasswordInput,
  AuthFooter,
} from "@/app/features/auth/components";

export default function SignInForm() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof SignInSchema>) {
    try {
      setIsSubmitting(true);

      const res = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      });

      if (res?.error) {
        console.log(res.error)
        toast.error(res.error);
        return;
      }

      toast.success("Welcome back!");

      router.replace("/dashboard");
    } catch(error) {
      toast.error("Something went wrong.");
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
        title="Welcome Back"
        description="Sign in to continue planning your next journey."
      />

      <GoogleButton mode="signin" />

      <AuthDivider />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FieldGroup className="gap-3">
          <Field data-invalid={!!form.formState.errors.identifier}>
            <FieldLabel>Email</FieldLabel>

            <Input
              placeholder="Enter your email"
              {...form.register("identifier")}
            />
            <div className="min-h-5 flex-1">
              <FieldError errors={[form.formState.errors.identifier]} />
            </div>
          </Field>

          <PasswordInput
            form={form}
            name="password"
            rightElement={
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            }
          />
        </FieldGroup>

        <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <AuthFooter
        text="Don't have an account?"
        linkText="Create Account"
        href="/sign-up/role-choice"
      />
    </>
  );
}
