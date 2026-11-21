import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { fetchWorkerDetails, useWorkers } from "@/features/workers/index.js";
import { ROUTES } from "@/routes/constants.js";
import { BookingFlow, BookingSkeleton } from "./components/index.js";
import { toWorkerBookable } from "./definitions/bookable.js";

// Booking a worker by the hour - /book/worker/:workerId. The worker comes
// from the API (same thunk as their profile page); their start times come
// from the booking API (see BookingFlow). A worker who can't be booked by the
// hour (no rate) isn't returned, so this redirects to the Workers list.
export default function WorkerBookingPage() {
  const dispatch = useDispatch();
  const { workerId } = useParams();
  const { details } = useWorkers();

  useDocumentTitle("Book a professional | Fixonest");

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchWorkerDetails(workerId));
  }, [dispatch, workerId]);

  const isCurrent = details.id === workerId;

  if (isCurrent && details.status === "failed") {
    return <Navigate to={ROUTES.WORKERS} replace />;
  }
  if (!isCurrent || details.status !== "succeeded" || !details.data) {
    return <BookingSkeleton label="Loading booking" />;
  }

  return <BookingFlow key={workerId} bookable={toWorkerBookable(details.data)} />;
}
