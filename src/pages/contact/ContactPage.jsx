import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { ContactHeroSection, ContactFormSection } from "./components/index.js";

// Built section by section — see chat for order.
export default function ContactPage() {
  useDocumentTitle("Fixonest");
  return (
    <>
      <ContactHeroSection />
      <ContactFormSection />
    </>
  );
}
