"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Mountain, Siren, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  {
    label: "Destinations",
    href: "/destinations",
  },
  {
    label: "Hotels",
    href: "/hotels",
  },
  {
    label: "Restaurants",
    href: "/restaurants",
  },
  {
    label: "Guides",
    href: "/guides",
  },
  {
    label: "Emergency",
    href: "/emergency",
    isEmergency: true,
  },
  {
    label: "About",
    href: "/about",
  },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b bg-background/90 shadow-sm backdrop-blur-xl"
          : "bg-black/0 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}

        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
            <Mountain className="h-5 w-5" />
          </div>

          <div className="hidden sm:block">
            <h1
              className={`text-lg font-bold transition-colors ${
                isScrolled ? "text-foreground" : "text-white"
              }`}
            >
              TravelNepal
            </h1>

            <p
              className={`-mt-1 text-xs transition-colors ${
                isScrolled ? "text-muted-foreground" : "text-white/70"
              }`}
            >
              Discover the Himalayas
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main Navigation" className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;

            if (item.isEmergency) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label="Emergency SOS - Police & Rescue Helpline"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                    active
                      ? "bg-rose-600 text-white shadow-md ring-2 ring-rose-500/50"
                      : isScrolled
                      ? "bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-500/30"
                      : "bg-rose-600/90 text-white hover:bg-rose-600 border border-white/20 backdrop-blur-md"
                  }`}
                >
                  <Siren className="size-3.5 animate-pulse text-current" />
                  <span>Emergency SOS</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  active
                    ? isScrolled
                      ? "text-primary font-bold"
                      : "text-white font-bold"
                    : isScrolled
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-white/85 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          {session ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="default"
                  className="rounded-xl shadow-xs font-semibold px-5"
                  aria-label="Go to Dashboard"
                >
                  Dashboard
                </Button>
              </Link>

              <Button
                variant="ghost"
                className={`rounded-xl transition hover:-translate-y-0.5 ${
                  isScrolled ? "text-destructive hover:bg-destructive/10" : "text-white hover:bg-white/10"
                }`}
                aria-label="Sign out of account"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/partner/business-type">
                <Button variant={isScrolled ? "ghost" : "secondary"}>
                  Become a Partner
                </Button>
              </Link>

              <Link href="/sign-in">
                <Button variant={isScrolled ? "outline" : "secondary"}>
                  Sign In
                </Button>
              </Link>

              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          className={`lg:hidden ${
            isScrolled ? "text-foreground" : "text-white hover:bg-white/10"
          }`}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}

      {isOpen && (
        <div className="border-t bg-background backdrop-blur-xl lg:hidden">
          <div className="space-y-2 px-4 py-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  item.isEmergency
                    ? "bg-rose-500/15 text-rose-600 font-bold border border-rose-500/30 flex items-center gap-2"
                    : pathname === item.href
                    ? "bg-primary/10 text-primary font-bold"
                    : "hover:bg-muted"
                }`}
              >
                {item.isEmergency && <Siren className="size-4 animate-pulse" />}
                {item.label} {item.isEmergency && "SOS (Police / Flood Rescue)"}
              </Link>
            ))}

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex justify-center pb-2">
                <ThemeToggle />
              </div>
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full"
                  >
                    <Button className="w-full font-semibold">Dashboard</Button>
                  </Link>

                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/partner/business-type"
                    onClick={() => setIsOpen(false)}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full">
                      Become a Partner
                    </Button>
                  </Link>

                  <Link
                    href="/sign-in"
                    onClick={() => setIsOpen(false)}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>

                  <Link
                    href="/sign-up"
                    onClick={() => setIsOpen(false)}
                    className="w-full"
                  >
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
