import Navbar from "./features/landing/components/Navbar";
import Hero from "./features/landing/components/Hero";
import ModuleExplorer from "./features/landing/components/ModuleExplorer";
import Footer from "./features/landing/components/Footer";
import CTA from "./features/landing/components/CTA";
import { getCachedLandingData } from "./features/landing/actions/getLandingData";

export const dynamic = "force-static";
export const revalidate = 3600; // Cache and revalidate once per hour

export default async function Home() {
  const {
    featuredHotels,
    featuredRestaurants,
    featuredDestinations,
    featuredGuides,
  } = await getCachedLandingData();

  return (
    <div className="bg-background text-foreground min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <main className="w-full overflow-x-hidden">
        <Hero />
        <ModuleExplorer
          featuredHotels={featuredHotels}
          featuredRestaurants={featuredRestaurants}
          featuredDestinations={featuredDestinations}
          featuredGuides={featuredGuides}
        />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
