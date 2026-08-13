"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifySchema } from "@/app/features/auth/schemas/register.schema";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type VerifyEmailFormProps = {
  email: string;
};

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";

const VerifyEmailForm = ({
  email,
}: VerifyEmailFormProps) => {

  const router = useRouter();

  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      setIsVerifyingCode(true);

      const res = await axios.post("/api/auth/verify-email", {
        email,
        code: data.code,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        router.replace("/sign-in");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {

      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsVerifyingCode(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Verify your account</h1>

          <p className="mt-2 text-muted-foreground">
            Enter the verification code sent to your email.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Verification Code</FieldLabel>

                  <Input
                    {...field}
                    placeholder="Enter 6-digit code"
                    className="text-center tracking-[0.4em] text-lg"
                    aria-invalid={fieldState.invalid}
                  />

                  <FieldDescription>
                    Check your email inbox for the code.
                  </FieldDescription>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={isVerifyingCode}>
            {isVerifyingCode ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Account"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Didn't receive the code? Check your spam folder or request a new one.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailForm;
