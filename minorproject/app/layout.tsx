import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ThemeProvider } from "@/components/theme-provider";
import AIRobotChat from "./features/landing/components/AIRobotChat";

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "TravelNepal | Intelligent AI Tourism & Verified Stays in Nepal",
    template: "%s | TravelNepal",
  },
  description:
    "Discover Nepal's premier travel platform. Plan custom Himalayan itineraries, book verified hotels with instant Khalti checkout, find authentic dining, and calculate student transit discounts.",
  keywords: [
    "Nepal Tourism",
    "Pokhara Hotels",
    "Kathmandu Stays",
    "Chitwan Safari",
    "Nepal Travel Itinerary",
    "Khalti Hotel Booking",
    "Himalayan Tour Guides",
    "Nepal Transit Discounts",
    "TravelNepal AI",
    "Mustang Treks",
  ],
  authors: [{ name: "TravelNepal Team" }],
  creator: "TravelNepal IOE",
  publisher: "TravelNepal",
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
    url: "https://travelnepal.app",
    siteName: "TravelNepal",
    title: "TravelNepal | Intelligent AI Tourism & Verified Stays in Nepal",
    description:
      "Plan custom Himalayan itineraries, book verified hotels with instant Khalti checkout, and discover authentic Nepal dining with AI assistance.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "TravelNepal - Explore the Himalayas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TravelNepal | AI-Powered Travel Planning in Nepal",
    description:
      "Discover verified hotels, authentic food, Himalayan guides, and custom trip itineraries across Nepal.",
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
      "@id": "https://travelnepal.app/#website",
      "url": "https://travelnepal.app",
      "name": "TravelNepal",
      "description": "Intelligent AI-Powered Tourism & Verified Stays Platform in Nepal",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://travelnepal.app/destinations?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "TravelAgency",
      "@id": "https://travelnepal.app/#agency",
      "name": "TravelNepal Platform",
      "url": "https://travelnepal.app",
      "logo": "https://travelnepal.app/favicon.ico",
      "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200",
      "description": "Verified hotel stays, authentic dining, and Himalayan tour planning across Nepal.",
      "areaServed": "Nepal",
      "priceRange": "NPR",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <AIRobotChat />
          </Providers>
        </ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
