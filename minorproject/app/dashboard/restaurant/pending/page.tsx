import Link from "next/link";
import { Clock3 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RestaurantPendingPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="items-center text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            <Clock3 className="size-10" />
          </div>

          <CardTitle className="mt-6 text-3xl">Verification Pending</CardTitle>

          <CardDescription className="max-w-lg text-base">
            Your restaurant owner account is pending approval. Dashboard
            operations are temporarily locked until verification is complete.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/40 p-5">
            <h3 className="font-semibold">What you can do now</h3>

            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Review your profile details.</li>
              <li>• Contact support if approval is taking longer than expected.</li>
              <li>• Logout securely from this account.</li>
            </ul>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/profile"
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Open Profile
            </Link>

            <Link
              href="/api/auth/signout"
              className="rounded-lg border px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10"
            >
              Logout
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
