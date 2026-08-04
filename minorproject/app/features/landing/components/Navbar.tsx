"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Mountain, X } from "lucide-react";

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
                isScrolled ? "text-muted-foreground" : "text-white/80"
              }`}
            >
              AI Tourism Platform
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  active
                    ? isScrolled
                      ? "text-primary"
                      : "text-white"
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
              <Button
                variant={isScrolled ? "outline" : "secondary"}
                className="rounded-xl transition hover:-translate-y-0.5 hover:shadow-sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant={isScrolled ? "ghost" : "secondary"}>
                <Link href="/partner/business-type">Become a Partner</Link>
              </Button>

              <Button variant={isScrolled ? "outline" : "secondary"}>
                <Link href="/sign-in">Sign In</Link>
              </Button>

              <Button>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}

        <Button
          variant="ghost"
          size="icon"
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
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex justify-center pb-2">
                <ThemeToggle />
              </div>
              {session ? (
                <>
                  <Button variant="outline">
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>

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
                  <Button variant="outline">
                    <Link
                      href="/partner/business-type"
                      onClick={() => setIsOpen(false)}
                    >
                      Become a Partner
                    </Link>
                  </Button>

                  <Button variant="outline">
                    <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                  </Button>

                  <Button>
                    <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
