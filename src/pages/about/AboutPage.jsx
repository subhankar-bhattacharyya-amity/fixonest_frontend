import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import {
  AboutHeroSection,
  AboutJourneySection,
  AboutValuesSection,
  AboutTeamSection,
  AboutJoinCtaSection,
} from "./components/index.js";

// Built section by section — see chat for order.
export default function AboutPage() {
  useDocumentTitle("Fixonest");
  return (
    <>
      <AboutHeroSection />
      <AboutJourneySection />
      <AboutValuesSection />
      <AboutTeamSection />
      <AboutJoinCtaSection />
    </>
  );
}
