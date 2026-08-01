import Link from "next/link";
import { ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/30 px-6 py-12">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="items-center text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-destructive">
              Error 403
            </p>

            <CardTitle className="text-3xl">
              Access Denied
            </CardTitle>

            <CardDescription className="text-base">
              You don't have permission to access this page. If you believe this
              is a mistake, please contact an administrator or return to your
              dashboard.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline">
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}