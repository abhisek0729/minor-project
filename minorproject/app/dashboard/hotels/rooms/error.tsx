"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & {
    digest?: string;
  };

  reset: () => void;
}

export default function RoomsError({
  error,
  reset,
}: ErrorPageProps) {
  console.error(error);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="size-10 text-destructive" />
      </div>

      <h2 className="mt-6 text-2xl font-bold">
        Something went wrong
      </h2>

      <p className="mt-2 max-w-md text-muted-foreground">
        We couldn't load the room information. Please try again.
      </p>

      <Button
        className="mt-8"
        onClick={reset}
      >
        <RefreshCw className="mr-2 size-4" />
        Try Again
      </Button>
    </div>
  );
}