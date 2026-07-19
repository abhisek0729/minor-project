"use client";

import Link from "next/link";

interface AuthLogoProps {
  showTagline?: boolean;
}

export default function AuthLogo({
  showTagline = true,
}: AuthLogoProps) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-3"
    >
      {/* Logo Icon */}
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary font-bold text-lg text-primary-foreground shadow-sm">
        T
      </div>

      {/* Logo Text */}
      <div>
        <h1 className="text-lg font-bold tracking-tight">
          TravelAgent
        </h1>

        {showTagline && (
          <p className="text-xs text-muted-foreground">
            Discover Nepal
          </p>
        )}
      </div>
    </Link>
  );
}