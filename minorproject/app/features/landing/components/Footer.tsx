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
    <footer className="border-t bg-slate-950 text-slate-200 py-10" aria-label="Site Footer">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label="TravelNepal Home"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
                <Mountain className="h-5 w-5" />
              </div>

              <span className="text-xl font-bold text-white">
                TravelNepal
              </span>
            </Link>

            <p className="mt-5 max-w-sm leading-7 text-slate-300">
              Discover destinations, plan smarter with multi-agent AI,
              book verified accommodations with Khalti, and explore
              authentic Himalayan experiences.
            </p>

            <div className="mt-8 flex gap-3">
              {socials.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow TravelNepal on ${social.label}`}
                    className="rounded-lg border border-slate-700 bg-slate-900/60 p-2.5 text-slate-300 transition-colors hover:bg-primary hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-300 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white">
              Resources
            </h3>

            <ul className="mt-5 space-y-3">
              {resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-300 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white">
              Contact
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-slate-300">
                  Kathmandu / Pokhara, Nepal
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a
                  href="mailto:support@travelnepal.app"
                  className="text-sm text-slate-300 hover:text-primary transition-colors"
                >
                  support@travelnepal.app
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a
                  href="tel:+9779800000000"
                  className="text-sm text-slate-300 hover:text-primary transition-colors"
                >
                  +977 9800000000
                </a>
              </div>

              <div className="pt-4">
                <Link
                  href="/partner/business-type"
                  className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>Become a Partner</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-sm text-slate-400 md:flex-row">
          <p>
            © {new Date().getFullYear()} TravelNepal. All rights reserved. IOE Purwanchal Campus.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>

            <Link
              href="/privacy-policy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>

            <Link
              href="/emergency"
              className="text-rose-400 hover:text-rose-300 transition-colors font-semibold"
            >
              Emergency Helpline
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}