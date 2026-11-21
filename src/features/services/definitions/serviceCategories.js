import { appConfig } from "@/lib/config.js";

// backend/app/router/customer/service_category.routes.js - public, read-only
// endpoint (no login needed). Returns up to 8 Active service categories,
// sorted by how many providers are assigned to each (newest first on a tie).
export const POPULAR_SERVICE_CATEGORIES_API_PATH = "/api/v1/popular-service-categories";

// Every active category (paginated - loaded page by page), for the Services
// page's category filter.
export const SERVICE_CATEGORIES_API_PATH = "/api/v1/service-categories";
export const SERVICE_CATEGORIES_FETCH_SIZE = 100;

// How many placeholder cards Home's grid shows while the request is in flight
// (the backend returns at most 8).
export const POPULAR_SERVICE_CATEGORIES_LIMIT = 8;

// icon_url is an upload path served by the backend
// ("uploads/service_categories/<file>"). null when empty.
const buildIconUrl = (iconUrl) => {
  if (!iconUrl) return null;
  if (/^https?:\/\//i.test(iconUrl)) return iconUrl;
  return `${appConfig.apiBaseUrl}/${iconUrl.replace(/^\/+/, "")}`;
};

// Turns a service category from the API into the shape
// pages/home/components/PopularCategoryCard.jsx renders. providerCount is
// the number of providers assigned to the category - 0 until providers exist.
export const toPopularCategory = (category) => ({
  id: category._id,
  slug: category.slug,
  name: category.name,
  icon: buildIconUrl(category.icon_url),
  providerCount: category.provider_count ?? 0,
});

// A category as the Services page's filter lists it. The slug is what the
// filter, the ?category=<slug> URL and the API's categoryIds use.
export const toCategoryOption = (category) => ({
  id: category._id,
  slug: category.slug,
  name: category.name,
});
