import {
  ROUTES,
  getServiceDetailsPath,
  getWorkerDetailsPath,
} from "@/routes/constants.js";

// Both booking pages render the same flow. These turn a service
// (features/services toServiceDetails) or a worker (features/workers toWorker)
// into one "bookable" shape the booking components read.

// "₹1,499" -> 1499. null when there is no price.
const parsePrice = (label) => {
  if (!label) return null;
  const value = Number(String(label).replace(/[^\d.]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : null;
};

// 1499 -> "₹1,499" (Indian digit grouping).
export const formatRupees = (value) => `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

export const toServiceBookable = (service) => ({
  kind: "service",
  // The service's _id - sent as service_id when the booking is created.
  serviceId: service.id,
  title: service.name,
  shortName: service.name,
  subtitle: service.category?.name ?? "Home service",
  // Used to load the providers who can take this service.
  categorySlug: service.category?.slug ?? null,
  image: service.image,
  hasCover: service.hasCover,
  worker: null,
  rating: Number(service.rating) || 0,
  reviewCount: service.reviewCount,
  priceLabel: service.startingPrice,
  originalPriceLabel: service.originalPrice,
  unitPrice: parsePrice(service.startingPrice),
  perHour: false,
  duration: service.duration,
  breadcrumb: { label: "Services", to: ROUTES.SERVICES },
  detailsTo: getServiceDetailsPath(service.slug),
});

export const toWorkerBookable = (worker) => ({
  kind: "worker",
  title: worker.name,
  shortName: worker.firstName || worker.name,
  subtitle: worker.designation || worker.category?.name || "Professional",
  image: null,
  hasCover: false,
  worker,
  rating: Number(worker.rating) || 0,
  reviewCount: worker.reviewCount,
  priceLabel: worker.hourlyRate ? `${worker.hourlyRate}/hr` : null,
  originalPriceLabel: null,
  unitPrice: parsePrice(worker.hourlyRate),
  perHour: true,
  duration: null,
  breadcrumb: { label: "Workers", to: ROUTES.WORKERS },
  detailsTo: getWorkerDetailsPath(worker.id),
});
