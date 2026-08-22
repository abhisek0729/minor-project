import Navbar from "@/app/features/landing/components/Navbar";
import Footer from "@/app/features/landing/components/Footer";
import EmergencyClientView from "./components/EmergencyClientView";

export const metadata = {
  title: "Emergency SOS & Disaster Help | TravelNepal",
  description:
    "24/7 emergency response hotline, Tourist Police contact, flood & natural hazard rescue, and instant online/offline SOS dispatch for travelers in Nepal.",
};

export default function EmergencyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8 w-full flex-1">
        <EmergencyClientView />
      </main>

      <Footer />
    </div>
  );
}
