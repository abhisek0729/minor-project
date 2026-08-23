import Link from "next/link";
import { ArrowLeft, Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border shadow-xl rounded-3xl overflow-hidden text-center p-8 space-y-5 bg-card">
        <div className="size-16 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-500/5">
          <ShieldAlert className="size-8" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Access Restricted
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You do not have permission to access the <strong>Super Administrator Dashboard</strong>. This area is reserved exclusively for verified platform owners and authorized system administrators.
          </p>
        </div>

        <div className="rounded-2xl bg-muted/40 p-4 border text-xs text-muted-foreground space-y-1 text-left">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Lock className="size-3.5 text-primary" /> Security Policy
          </div>
          <p>
            Role-Based Access Control (RBAC) is enforced. Only users with the <code className="font-mono text-primary font-bold">admin</code> role approved by the platform database administrator can view this console.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link href="/dashboard" className="block w-full">
            <Button className="w-full font-bold gap-1.5 rounded-xl h-11 cursor-pointer">
              <ArrowLeft className="size-4" /> Return to My Dashboard
            </Button>
          </Link>
          <Link href="/" className="block w-full">
            <Button variant="ghost" className="w-full text-xs rounded-xl cursor-pointer">
              Go to Homepage
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}