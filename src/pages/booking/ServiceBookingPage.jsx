import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { fetchServiceDetails, useServices } from "@/features/services/index.js";
import { ROUTES } from "@/routes/constants.js";
import { BookingFlow, BookingSkeleton } from "./components/index.js";
import { toServiceBookable } from "./definitions/bookable.js";

// Booking a service - /book/service/:slug. The service itself comes from the
// API (same thunk as its details page); the booking is created through the
// booking API (see components/BookingFlow.jsx).
export default function ServiceBookingPage() {
  const dispatch = useDispatch();
  const { slug } = useParams();
  const { details } = useServices();

  useDocumentTitle("Book a service | Fixonest");

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchServiceDetails(slug));
  }, [dispatch, slug]);

  const isCurrent = details.slug === slug;

  if (isCurrent && details.status === "failed") {
    return <Navigate to={ROUTES.SERVICES} replace />;
  }
  if (!isCurrent || details.status !== "succeeded" || !details.data) {
    return <BookingSkeleton label="Loading booking" />;
  }

  return <BookingFlow key={slug} bookable={toServiceBookable(details.data)} />;
}
