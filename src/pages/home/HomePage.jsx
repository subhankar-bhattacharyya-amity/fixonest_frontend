import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import {
  HeroSection,
  ServicesSection,
  FeaturedServicesSection,
  HowItWorksSection,
  StatsSection,
  TestimonialsSection,
  FaqSection,
  FinalCtaSection,
  QuickBookButton,
} from "./components/index.js";

// Built section by section (navbar, hero, services, ...) — see chat for the
// confirmed section order.
export default function HomePage() {
  useDocumentTitle("Fixonest");
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <FeaturedServicesSection />
      <HowItWorksSection />
      <StatsSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCtaSection />
      <QuickBookButton />
    </>
  );
}
