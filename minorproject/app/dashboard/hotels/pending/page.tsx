import Link from "next/link";
import { Clock3, Mail, ArrowLeft } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HotelPendingPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="items-center text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            <Clock3 className="size-10" />
          </div>

          <CardTitle className="mt-6 text-3xl">
            Approval Pending
          </CardTitle>

          <CardDescription className="max-w-lg text-base">
            Your hotel registration has been submitted successfully and is
            currently under review by our administrators.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="rounded-lg border bg-muted/40 p-5">
            <h3 className="font-semibold">
              What happens next?
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                • Our team will verify your hotel information and submitted
                documents.
              </li>

              <li>
                • The review process typically takes <strong>1–2 business days</strong>.
              </li>

              <li>
                • You'll receive an email once your hotel has been approved.
              </li>

              <li>
                • After approval, you'll have full access to manage rooms,
                bookings, pricing, and more.
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button >
              <Link className="flex" href="mailto:support@tourism.com">
                <Mail className="mr-2 size-4" />
                Contact Support
              </Link>
            </Button>

            <Button
              variant="outline"
            >
              <Link className="flex" href="/">
                <ArrowLeft className="mr-2 size-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Thank you for your patience. We'll notify you as soon as your hotel
            has been reviewed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}