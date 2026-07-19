import Image from "next/image";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  backgroundImage?: string;
  overlay?: boolean;
}

export default function AuthLayout({
  children,
  backgroundImage = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1800&auto=format&fit=crop",
  overlay = true,
}: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background Image */}

      <Image
        src={backgroundImage}
        alt="Beautiful destination in Nepal"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Overlay */}

      {overlay && (
        <div className="absolute inset-0 bg-black/40" />
      )}

      {/* Content */}

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/20 bg-card/95 p-8 shadow-2xl backdrop-blur-md">
          {children}
        </div>
      </div>
    </main>
  );
}