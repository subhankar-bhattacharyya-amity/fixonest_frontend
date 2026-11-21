import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { fetchRelatedServices, fetchServiceDetails, useServices } from "@/features/services/index.js";
import { ROUTES } from "@/routes/constants.js";
import {
  ServiceDetailsGallerySection,
  ServiceDetailsInfoSection,
  ServiceDetailsReviewsSection,
  ServiceDetailsRelatedSection,
} from "./components/index.js";

// One reusable page for every service — looked up by :slug (see
// routes/constants.js's SERVICE_DETAILS pattern), not one page per service.
// The service, its details and gallery come from the API; an unknown or
// inactive service sends the shopper back to the Services listing.
export default function ServiceDetailsPage() {
  const dispatch = useDispatch();
  const { slug } = useParams();
  const { details, related } = useServices();

  useDocumentTitle("Fixonest");

  // Same route pattern for every service (/services/:slug), so React Router
  // keeps this page's scroll position when navigating from one service's
  // details to another's (e.g. a related-service card's arrow) - jump back to
  // the top so the new service starts from its own gallery.
  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchServiceDetails(slug));
    dispatch(fetchRelatedServices(slug));
  }, [dispatch, slug]);

  const isCurrent = details.slug === slug;

  if (isCurrent && details.status === "failed") {
    return <Navigate to={ROUTES.SERVICES} replace />;
  }
  if (!isCurrent || details.status !== "succeeded" || !details.data) {
    return <DetailsSkeleton />;
  }

  const service = details.data;
  const relatedForThis = related.slug === slug ? related : { items: [], status: "loading" };
  // The professionals who offer this service come with it (assignedProviders).
  const workersForThis = { items: service.providers, status: "succeeded" };

  return (
    <>
      <ServiceDetailsGallerySection service={service} category={service.category} galleryImages={service.galleryImages} />
      <ServiceDetailsInfoSection service={service} workers={workersForThis} />
      <ServiceDetailsReviewsSection service={service} />
      <ServiceDetailsRelatedSection
        services={relatedForThis.items}
        isLoading={relatedForThis.status === "loading" || relatedForThis.status === "idle"}
        category={service.category}
      />
    </>
  );
}

// The gallery and info sections' footprint, while the service loads.
function DetailsSkeleton() {
  const block = "animate-pulse rounded bg-slate-100 dark:bg-(--surface-2)";
  return (
    <div className="mx-auto max-w-7xl px-3 py-10 sm:px-6 sm:py-14 lg:px-8" aria-busy="true" aria-label="Loading service">
      <div className={`h-4 w-64 max-w-full ${block}`} />
      <div className={`mt-6 h-10 w-96 max-w-full ${block}`} />
      <div className={`mt-4 h-5 w-72 max-w-full ${block}`} />
      <div className="mt-8 grid grid-cols-1 gap-4 md:h-105 md:grid-cols-3 md:grid-rows-2">
        <div className={`h-64 rounded-3xl md:col-span-2 md:row-span-2 md:h-auto ${block}`} />
        <div className={`h-40 rounded-3xl md:h-auto ${block}`} />
        <div className={`h-40 rounded-3xl md:h-auto ${block}`} />
      </div>
      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          <div className={`h-7 w-48 ${block}`} />
          <div className={`h-4 w-full ${block}`} />
          <div className={`h-4 w-5/6 ${block}`} />
          <div className={`h-4 w-2/3 ${block}`} />
        </div>
        <div className={`h-64 rounded-2xl ${block}`} />
      </div>
    </div>
  );
}
