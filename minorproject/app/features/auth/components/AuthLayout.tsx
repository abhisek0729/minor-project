import Image from "next/image";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  showBackground?: boolean;
  backgroundImage?: string;
  overlay?: boolean;
}

export default function AuthLayout({
  children,
  showBackground = true,
  backgroundImage = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1800&auto=format&fit=crop",
  overlay = true,
}: AuthLayoutProps) {
  return (
    <main
      className={`relative flex min-h-screen items-center justify-center overflow-hidden p-2 ${
        showBackground ? "" : "bg-background"
      }`}
    >
      {/* Background Image */}
      {showBackground && (
        <>
          <Image
            src={backgroundImage}
            alt="Beautiful destination in Nepal"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          {overlay && (
            <div className="absolute inset-0 bg-black/40" />
          )}
        </>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div
          className={`rounded-3xl border p-8 shadow-2xl ${
            showBackground
              ? "border-white/20 bg-card/95 backdrop-blur-md"
              : "border-border bg-card"
          }`}
        >
          {children}
        </div>
      </div>
    </main>
  );
}