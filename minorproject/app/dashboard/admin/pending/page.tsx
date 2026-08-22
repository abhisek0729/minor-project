import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowLeft, Clock3, Database, ShieldAlert, ShieldCheck } from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminPendingPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-xl border shadow-lg">
        <CardHeader className="items-center text-center pb-2">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2 ring-8 ring-amber-500/5">
            <ShieldAlert className="size-10" />
          </div>

          <CardTitle className="text-2xl font-bold">
            Administrator Access Pending
          </CardTitle>

          <CardDescription className="max-w-md text-sm mt-1">
            Your request for system administrator privileges has been recorded and is awaiting manual approval by the website owner in the database.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-4">
          <div className="rounded-xl border bg-muted/40 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Database className="size-4 text-primary" />
              Website Owner Verification Info
            </div>
            <p className="text-muted-foreground leading-relaxed">
              For security, Administrator roles cannot be self-activated. The website owner must change your status to <strong>"approved"</strong> in the database:
            </p>
            <div className="p-2.5 rounded-lg bg-black text-emerald-400 font-mono text-[11px] overflow-x-auto select-all">
              {`UPDATE user_roles SET "approvalStatus" = 'approved' WHERE user_id = ${userId || "<user_id>"} AND role_id = 5;`}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/dashboard">
              <Button variant="default" className="gap-2 text-xs">
                <ArrowLeft className="size-3.5" /> Back to Dashboard
              </Button>
            </Link>

            <Link href="/profile">
              <Button variant="outline" className="text-xs">
                My Profile
              </Button>
            </Link>

            <Link href="/api/auth/signout">
              <Button variant="ghost" className="text-xs text-destructive hover:bg-destructive/10">
                Sign Out
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
