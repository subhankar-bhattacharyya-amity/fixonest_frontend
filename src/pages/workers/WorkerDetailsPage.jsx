import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { fetchWorkerDetails, useWorkers } from "@/features/workers/index.js";
import { ROUTES } from "@/routes/constants.js";
import {
  WorkerDetailsHeroSection,
  WorkerDetailsAboutSection,
  WorkerDetailsContactSection,
} from "./components/index.js";

// One reusable page for every provider — looked up by :workerId (the
// provider's id, see routes/constants.js's WORKER_DETAILS pattern), not one
// page per worker. The profile comes from the API; an unknown or unlisted
// provider sends the visitor back to the Workers listing.
export default function WorkerDetailsPage() {
  const dispatch = useDispatch();
  const { workerId } = useParams();
  const { details } = useWorkers();

  useDocumentTitle("Fixonest");

  // Same route pattern for every worker (/workers/:workerId), so React
  // Router keeps this page's scroll position when navigating from one
  // provider's details to another's - jump back to the top on change.
  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchWorkerDetails(workerId));
  }, [dispatch, workerId]);

  const isCurrent = details.id === workerId;

  if (isCurrent && details.status === "failed") {
    return <Navigate to={ROUTES.WORKERS} replace />;
  }
  if (!isCurrent || details.status !== "succeeded" || !details.data) {
    return <DetailsSkeleton />;
  }

  const worker = details.data;

  return (
    <>
      <WorkerDetailsHeroSection worker={worker} />
      <WorkerDetailsAboutSection worker={worker} />
      <WorkerDetailsContactSection worker={worker} />
    </>
  );
}

// The hero section's footprint, while the provider loads.
function DetailsSkeleton() {
  const block = "animate-pulse rounded bg-slate-100 dark:bg-(--surface-2)";
  return (
    <div className="mx-auto max-w-7xl px-3 py-10 sm:px-6 sm:py-14 lg:px-8" aria-busy="true" aria-label="Loading provider">
      <div className={`h-4 w-64 max-w-full ${block}`} />
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        <div className={`mx-auto aspect-4/5 w-full max-w-md rounded-3xl ${block}`} />
        <div className="space-y-4">
          <div className={`h-10 w-72 max-w-full ${block}`} />
          <div className={`h-5 w-32 ${block}`} />
          <div className={`h-4 w-40 ${block}`} />
          <div className={`h-20 w-full ${block}`} />
          <div className="grid grid-cols-2 gap-4 pt-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className={`h-10 ${block}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
