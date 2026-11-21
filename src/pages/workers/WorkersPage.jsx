import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { WorkersHeroSection, WorkersListingSection } from "./components/index.js";

// Search query lives here (not inside either section) since the hero's
// search bar and the listing grid below it both need to share it - same
// pattern as ServicesPage.jsx.
export default function WorkersPage() {
  useDocumentTitle("Fixonest");
  const [query, setQuery] = useState("");

  return (
    <>
      <WorkersHeroSection query={query} onQueryChange={setQuery} />
      <WorkersListingSection query={query} />
    </>
  );
}
