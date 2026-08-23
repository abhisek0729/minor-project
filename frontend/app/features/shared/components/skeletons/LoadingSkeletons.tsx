"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  type?: "page-header" | "stats" | "table" | "card" | "form";
  rows?: number;
}

export default function LoadingSkeleton({
  type = "card",
  rows = 5,
}: LoadingSkeletonProps) {
  switch (type) {
    case "page-header":
      return (
        <div className="space-y-3">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      );

    case "stats":
      return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>

              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      );

    case "table":
      return (
        <div className="rounded-xl border">
          <div className="border-b p-4">
            <Skeleton className="h-10 w-64" />
          </div>

          <div className="divide-y">
            {Array.from({ length: rows }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-5 items-center gap-4 p-4"
              >
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="ml-auto h-8 w-20" />
              </div>
            ))}
          </div>
        </div>
      );

    case "form":
      return (
        <div className="space-y-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border p-6 space-y-6"
            >
              <Skeleton className="h-6 w-40" />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case "card":
    default:
      return (
        <div className="rounded-xl border p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      );
  }
}