import Navbar from "./features/landing/components/Navbar";
import Hero from "./features/landing/components/Hero";
import ModuleExplorer from "./features/landing/components/ModuleExplorer";
import Footer from "./features/landing/components/Footer";
import CTA from "./features/landing/components/CTA";

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <Navbar />
      <Hero />
      <ModuleExplorer />
      <CTA />
      <Footer />
    </div>
  );
}
