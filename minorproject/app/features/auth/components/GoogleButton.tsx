"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { clearPartnerRole } from "@/app/features/auth/actions/partner-role";


interface GoogleSignInButtonProps {
  mode?: "signin" | "partner-signup" | "tourist-signup";
  callbackUrl?: string;
}

export default function GoogleSignInButton({
  mode = "signin",
  callbackUrl = "/dashboard",
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      if(mode === "tourist-signup"){
        await clearPartnerRole();
      }
      setIsLoading(true);

      await signIn("google", {
        callbackUrl,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting...
        </>
      ) : (
        <>
          <FcGoogle className="mr-2 h-5 w-5" />

          {mode === "signin" ? "Continue with Google" : "Sign up with Google"}
        </>
      )}
    </Button>
  );
}
