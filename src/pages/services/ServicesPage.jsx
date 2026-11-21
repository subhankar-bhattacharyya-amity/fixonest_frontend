import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import {
  ServicesHeroSection,
  // ServicesTrustSection, // commented out for now — see chat
  ServicesCatalogSection,
  ServicesRequestCtaSection,
} from "./components/index.js";

// Built section by section — see chat for order. Search query lives here
// (not inside either section) since the hero's search bar and the catalog
// grid below it both need to share it. Category filtering itself lives in
// ServicesCatalogSection's left-sidebar accordion; a ?category=<slug> URL
// param (e.g. a link from Home's category cards) still seeds that sidebar's
// initial selection via the initialCategorySlug prop. Once the shopper changes
// or clears the category filter, the param is dropped from the URL so a
// reload or Back doesn't bring the old category filter back.
export default function ServicesPage() {
  useDocumentTitle("Fixonest");
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategorySlug = searchParams.get("category")?.trim() || null;

  const [query, setQuery] = useState("");

  const clearCategoryParam = () => {
    if (!searchParams.has("category")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("category");
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <ServicesHeroSection query={query} onQueryChange={setQuery} />
      {/* <ServicesTrustSection /> commented out for now — see chat */}
      <ServicesCatalogSection
        query={query}
        initialCategorySlug={initialCategorySlug}
        onCategoryFilterChange={clearCategoryParam}
      />
      <ServicesRequestCtaSection />
    </>
  );
}
