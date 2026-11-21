import { appConfig } from "@/lib/config.js";
import { toWorker } from "@/features/workers/index.js";

// backend/app/router/customer/service.routes.js - public, read-only endpoints
// (no login needed). Only Active services in Active categories come back.
export const SERVICES_API_PATH = "/api/v1/services";
export const getServiceApiPath = (slug) => `${SERVICES_API_PATH}/${encodeURIComponent(slug)}`;
export const getRelatedServicesApiPath = (slug) => `${getServiceApiPath(slug)}/related`;
// backend/app/router/customer/service_reviews_ratings.routes.js
export const getServiceReviewsApiPath = (slug) => `${getServiceApiPath(slug)}/reviews`;

// Review cards loaded per "Show more reviews" click.
export const SERVICE_REVIEWS_PAGE_SIZE = 6;

// Home's "Featured services" spotlight shows up to this many (the backend
// never lets more than 6 be featured).
export const FEATURED_SERVICES_LIMIT = 6;

// Cards per page of the Services listing.
export const SERVICES_PAGE_SIZE = 12;

// Image paths are stored relative to the backend's public folder
// ("uploads/services/<file>"). null when empty.
export const buildServiceImageUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${appConfig.apiBaseUrl}/${path.replace(/^\/+/, "")}`;
};

// A customer's photo, or null for the shared placeholder ("…/default.png") so
// the review card can show the reviewer's initials instead.
const buildAvatarUrl = (path) => {
  if (!path || /\/default\.(png|jpe?g)$/i.test(path)) return null;
  return buildServiceImageUrl(path);
};

// "3 weeks ago" for a review date.
const formatReviewAge = (date) => {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

// A review from the API, as the Customer Reviews cards render it.
export const toServiceReview = (review) => ({
  id: review._id,
  author: review.customer?.fullName ?? "Fixonest customer",
  avatar: buildAvatarUrl(review.customer?.profile_image),
  rating: Number(review.rating) || 0,
  comment: review.comment,
  date: formatReviewAge(review.reviewedAt),
});

// 1499 -> "₹1,499" (Indian digit grouping).
export const formatServicePrice = (value) => `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

// 90 -> "1 hr 30 min". Empty for 0.
const formatDuration = (minutes) => {
  const total = Math.round(Number(minutes) || 0);
  if (total <= 0) return "";
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (!hours) return `${rest} minutes`;
  if (!rest) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${hours} hr ${rest} min`;
};

// Turns a service from the API into the shape the service cards render
// (features/services/components/ServiceCard.jsx). The price customers pay is
// the discounted price when there is one, with the full price struck through.
// A service without a cover falls back to its category's icon.
export const toServiceCard = (service) => {
  const price = Number(service.price) || 0;
  const discountPrice = Number(service.discountPrice) || 0;
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const coverUrl = buildServiceImageUrl(service.image_url);
  return {
    id: service._id,
    slug: service.slug,
    name: service.name,
    description: service.description ?? "",
    rating: Number(service.rating) || 0,
    reviewCount: Number(service.reviewCount) || 0,
    startingPrice: formatServicePrice(hasDiscount ? discountPrice : price),
    originalPrice: hasDiscount ? formatServicePrice(price) : null,
    image: coverUrl ?? buildServiceImageUrl(service.category_data?.icon_url),
    hasCover: Boolean(coverUrl),
    category: service.category_data
      ? { id: service.category_data._id, slug: service.category_data.slug, name: service.category_data.name }
      : null,
  };
};

// The details page: the card fields plus the gallery (cover first), the
// ServiceDetails content and the providers who offer it (assignedProviders,
// best rated first - mapped with the workers feature's toWorker).
export const toServiceDetails = (service) => {
  const card = toServiceCard(service);
  const details = service.details ?? {};
  const gallery = [service.image_url, ...(service.images ?? []).map((image) => image.image_url)]
    .map(buildServiceImageUrl)
    .filter(Boolean);
  return {
    ...card,
    galleryImages: gallery.length ? gallery : [card.image].filter(Boolean),
    overview: details.overview || "",
    whatYouGet: details.whatYouGet ?? [],
    packageBenefits: details.packageBenefits ?? [],
    skills: details.skills ?? [],
    duration: details.durationLabel || formatDuration(service.durationInMinutes),
    providers: (service.assignedProviders ?? []).map(toWorker),
  };
};
