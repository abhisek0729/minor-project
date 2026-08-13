import Navbar from "./features/landing/components/Navbar";
import Hero from "./features/landing/components/Hero";
import BecomePartnerPage from "./features/auth/components/BecomePartner";
import Footer from "./features/landing/components/Footer";
import DestinationSection from "./features/landing/components/Destination";
import FeaturedHotels from "./features/landing/components/FeaturedHotels";
import AIPlanner from "./features/landing/components/AIPlanner";
import CTA from "./features/landing/components/CTA";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <DestinationSection />
      <FeaturedHotels />
      <AIPlanner />
      <BecomePartnerPage />
      <CTA />
      <Footer />
    </div>
  );
}
