import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ThemeProvider } from "@/components/theme-provider";
import LazyAIRobotChat from "@/app/components/LazyAIRobotChat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXTAUTH_URL || "https://minor-project-orcin-tau.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TravelNepal | Intelligent AI Tourism, Verified Stays & Trekking in Nepal",
    template: "%s | TravelNepal",
  },
  description:
    "Explore Nepal with TravelNepal — the all-in-one smart travel platform. Discover 150+ trekking destinations, book verified hotels with Khalti, hire certified tour guides, find authentic local dining, and plan personalized itineraries with our AI Voice Specialist.",
  keywords: [
    "TravelNepal",
    "Travel Nepal",
    "Travelling Nepal",
    "Nepal Tourism",
    "Visit Nepal 2026",
    "Nepal Travel Guide",
    "Hotels in Nepal",
    "Pokhara Hotels",
    "Kathmandu Stays",
    "Chitwan Safari Lodges",
    "Nepal Trekking Itinerary",
    "Annapurna Circuit Guide",
    "Everest Base Camp Trek",
    "Khalti Hotel Booking",
    "Licensed Himalayan Tour Guides",
    "Authentic Nepali Food & Dining",
    "Nepal Emergency SOS Hotline",
    "AI Travel Planner Nepal",
    "Nepal Trip Budget Calculator",
  ],
  authors: [{ name: "TravelNepal Engineering Team" }],
  creator: "TravelNepal",
  publisher: "TravelNepal",
  applicationName: "TravelNepal",
  category: "travel",
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "TravelNepal",
    title: "TravelNepal | Intelligent AI Tourism & Verified Stays in Nepal",
    description:
      "Your complete Nepal travel guide: AI trip planner, 150+ curated destinations, verified hotels with Khalti checkout, authentic dining, and licensed tour guides.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "TravelNepal - Discover the Himalayas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TravelNepal | AI-Powered Travel & Stays in Nepal",
    description:
      "Plan custom Himalayan itineraries, book verified hotels with instant Khalti checkout, and explore Nepal with AI assistance.",
    images: ["https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200"],
    creator: "@TravelNepalApp",
  },
  alternates: {
    canonical: "/",
  },
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "url": SITE_URL,
      "name": "TravelNepal",
      "alternateName": ["Travel Nepal", "Travelling Nepal", "TravelNepal AI"],
      "description": "Intelligent AI-Powered Tourism, Verified Stays & Trekking Platform in Nepal",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${SITE_URL}/destinations?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "TravelAgency",
      "@id": `${SITE_URL}/#agency`,
      "name": "TravelNepal Platform",
      "url": SITE_URL,
      "logo": `${SITE_URL}/favicon.ico`,
      "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200",
      "description": "Verified hotel stays, licensed Himalayan tour guides, authentic dining, and emergency mountain rescue assistance across Nepal.",
      "areaServed": {
        "@type": "Country",
        "name": "Nepal",
      },
      "priceRange": "NPR",
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I plan a trip to Nepal with AI on TravelNepal?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can use the TravelNepal AI Voice & Chat Assistant or the AI Trip Planner at /ai-planner. Simply enter your travel dates, origin, destination, and budget to receive a personalized day-by-day itinerary with estimated NPR costs, hotel options, and maps.",
          },
        },
        {
          "@type": "Question",
          "name": "Can I book verified hotels in Nepal directly using Khalti?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, TravelNepal offers seamless instant booking for verified hotels and lodges across Kathmandu, Pokhara, Chitwan, Lumbini, and Mustang with secure digital Khalti payment verification.",
          },
        },
        {
          "@type": "Question",
          "name": "What should I do in case of an emergency while trekking in Nepal?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "TravelNepal provides a 24/7 Emergency SOS Hub at /emergency with direct one-tap dialing for Nepal Tourist Police (1144), Nepal Police (100), Ambulance (102), hospital locators, and Acute Mountain Sickness (AMS) safety checklists.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link
          rel="preload"
          as="image"
          href="/images/hero-himalayas.webp"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden w-full max-w-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <LazyAIRobotChat />
          </Providers>
        </ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
