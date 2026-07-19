"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

interface PasswordInputProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  rightElement?: React.ReactNode;
}

export default function PasswordInput<T extends FieldValues>({
  form,
  name,
  label = "Password",
  placeholder = "Enter your password",
  rightElement,
}: PasswordInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

  const { error } = form.getFieldState(name, form.formState);

  return (
    <Field data-invalid={!!error}>
      <FieldLabel>{label}</FieldLabel>

      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="pr-10"
          {...form.register(name)}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>

      <div className="mt-2 flex items-start">
        <div className="min-h-5 flex-1">
          <FieldError errors={[error]} />
        </div>

        {rightElement}
      </div>
    </Field>
  );
}
