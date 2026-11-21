import { appConfig } from "@/lib/config.js";

// backend/app/router/customer/providers.routes.js - public, read-only
// endpoints (no login needed). Only active providers assigned to at least one
// service category are returned, best rated first.
export const WORKERS_API_PATH = "/api/v1/providers";
export const getWorkerApiPath = (id) => `${WORKERS_API_PATH}/${encodeURIComponent(id)}`;
export const WORKERS_PAGE_SIZE = 12;

// profile_image is an upload path served by the backend ("/uploads/...") or
// an absolute http(s) URL. null when empty.
const buildPhotoUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${appConfig.apiBaseUrl}/${path.replace(/^\/+/, "")}`;
};

const initialsOf = (name = "") => {
  const [first, second] = name.trim().split(/\s+/);
  return `${first?.[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase() || "?";
};

// Older accounts store the number without its country code.
const formatPhone = (phone, countryCode) => {
  if (!phone) return null;
  return phone.startsWith("+") ? phone : `${countryCode || "+91"} ${phone}`;
};

const formatPrice = (price) =>
  price === null || price === undefined ? null : `₹${Number(price).toLocaleString("en-IN")}`;

const toCategory = (category) =>
  category
    ? { id: category._id, slug: category.slug, name: category.name, icon: buildPhotoUrl(category.icon_url) }
    : null;

// Turns a provider from the API into the shape features/workers/components
// and pages/workers render. designation/category come from the provider's
// first service-category assignment (the card badge); expertise (Areas of
// Experience) is only present on the details endpoint.
export const toWorker = (provider) => ({
  id: provider._id,
  name: provider.fullName,
  firstName: provider.fullName?.trim().split(/\s+/)[0] ?? "",
  initials: initialsOf(provider.fullName),
  avatar: buildPhotoUrl(provider.profile_image),
  designation: provider.designation,
  category: toCategory(provider.primary_category),
  hourlyRate: formatPrice(provider.per_hours_price),
  rating: Number(provider.ratings ?? 0).toFixed(1),
  reviewCount: Number(provider.review_count ?? 0),
  yearsExperience: provider.years_experience,
  languages: provider.languages ?? [],
  phone: formatPhone(provider.phone, provider.country_code),
  email: provider.email,
  bio: provider.bio ?? "",
  whyBook: provider.why_book ?? [],
  expertise: (provider.expertise ?? []).map(toCategory),
});
