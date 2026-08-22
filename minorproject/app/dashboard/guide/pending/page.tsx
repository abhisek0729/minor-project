import Link from "next/link";
import { Clock3, ArrowLeft, Compass } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GuidePendingPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
      <Card className="w-full max-w-2xl border shadow-md rounded-3xl bg-card">
        <CardHeader className="items-center text-center">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <Clock3 className="size-10" />
          </div>

          <CardTitle className="mt-6 text-3xl font-extrabold tracking-tight">
            Guide Verification Pending
          </CardTitle>

          <CardDescription className="max-w-lg text-base mt-2">
            Your Tour Guide application and credentials have been submitted successfully and are currently under review by our administration team.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-2xl border bg-muted/40 p-5 space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Compass className="size-4 text-primary" />
              What happens during review?
            </h3>

            <ul className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Our team verifies your guide certification, experience details, and spoken languages.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>The verification process typically takes <strong>1–2 business days</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Once approved by Super Admin, your profile will be published live in the public Tour Guides directory, and you can publish trekking packages & accept bookings.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-2">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full sm:w-auto text-xs gap-1.5 rounded-xl cursor-pointer">
                <ArrowLeft className="size-3.5" /> Back to My Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
