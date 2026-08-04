"use client";

import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Mountain,
} from "lucide-react";

import {
  FaFacebook,
  FaInstagram,
  FaXTwitter,
  FaLinkedin,
} from "react-icons/fa6";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/destinations" },
  { label: "Hotels", href: "/hotels" },
  { label: "AI Planner", href: "/ai-planner" },
];

const resources = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

const partners = [
  { label: "Become a Partner", href: "/partner/register" },
  { label: "Partner Dashboard", href: "/partner" },
  { label: "Partner Support", href: "/partner/support" },
];

const socials = [
  {
    icon: FaFacebook,
    href: "https://facebook.com",
    label: "Facebook",
  },
  {
    icon: FaInstagram,
    href: "https://instagram.com",
    label: "Instagram",
  },
  {
    icon: FaXTwitter,
    href: "https://twitter.com",
    label: "Twitter",
  },
  {
    icon: FaLinkedin,
    href: "https://linkedin.com",
    label: "LinkedIn",
  },
];

export default function Footer() {
  return (
    <footer className="border-t bg-slate-950 text-slate-300 py-10">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}

          <div className="lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Mountain className="h-5 w-5" />
              </div>

              <span className="text-xl font-bold">
                TravelAgent
              </span>
            </Link>

            <p className="mt-5 max-w-sm leading-7 text-muted-foreground">
              Discover destinations, plan smarter with AI agent,
              book trusted accommodations, and create
              unforgettable travel experiences—all from one
              platform.
            </p>

            <div className="mt-8 flex gap-3">
              {socials.map((social) => {
                const Icon = social.icon;

                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    aria-label={social.label}
                    className="rounded-lg border p-2 transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}

          <div>
            <h3 className="font-semibold">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}

          <div>
            <h3 className="font-semibold">
              Resources
            </h3>

            <ul className="mt-5 space-y-3">
              {resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}

          <div>
            <h3 className="font-semibold">
              Contact
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-primary" />

                <span className="text-sm text-muted-foreground">
                  Kathmandu, Nepal
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />

                <span className="text-sm text-muted-foreground">
                  support@travelai.com
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />

                <span className="text-sm text-muted-foreground">
                  +977 9800000000
                </span>
              </div>

              <div className="pt-4">
                <Link
                  href="/partner/register"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Become a Partner →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} TravelAI. All rights
            reserved.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/terms"
              className="hover:text-primary"
            >
              Terms of Service
            </Link>

            <Link
              href="/privacy-policy"
              className="hover:text-primary"
            >
              Privacy Policy
            </Link>

            <Link
              href="/cookies"
              className="hover:text-primary"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}