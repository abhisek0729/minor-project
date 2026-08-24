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
  backgroundImage = "/images/hero-himalayas.webp",
  overlay = true,
}: AuthLayoutProps) {
  return (
    <main
      className={`relative flex min-h-screen items-center justify-center overflow-hidden p-2 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950`}
    >
      {/* Background Image */}
      {showBackground && (
        <>
          <Image
            src={backgroundImage}
            alt="Beautiful Himalayas in Nepal"
            fill
            priority
            sizes="100vw"
            unoptimized={backgroundImage.startsWith("http")}
            className="object-cover opacity-90"
          />

          {overlay && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
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