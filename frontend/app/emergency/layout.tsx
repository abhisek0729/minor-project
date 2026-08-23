import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "24/7 Emergency SOS Hub, Rescue Helplines & Mountain Safety Nepal",
  description:
    "Instant emergency assistance for tourists and trekkers in Nepal. One-tap dialing for Nepal Tourist Police (1144), Nepal Police (100), Ambulance (102), hospital directory, and Acute Mountain Sickness (AMS) protocols.",
  keywords: [
    "Nepal Tourist Police 1144",
    "Nepal Emergency Helplines",
    "Mountain Rescue Nepal",
    "Helicopter Evacuation Nepal",
    "Acute Mountain Sickness Symptoms",
    "Tourist Safety Nepal",
    "Emergency SOS Nepal",
  ],
  openGraph: {
    title: "24/7 Tourist Emergency SOS Hub & Rescue Directory | TravelNepal",
    description:
      "Essential safety guidelines, 1-tap emergency dialers, hospital locators, and mountain distress assistance across Nepal.",
    images: ["https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200"],
  },
  alternates: {
    canonical: "/emergency",
  },
};

export default function EmergencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
