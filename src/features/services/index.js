// Public API of the services feature. Import from "@/features/services/index.js".
export { POPULAR_SERVICE_CATEGORIES_LIMIT } from "./definitions/serviceCategories.js";
export { FEATURED_SERVICES_LIMIT, SERVICES_PAGE_SIZE, buildServiceImageUrl } from "./definitions/services.js";
export { useServiceCategories } from "./hooks/useServiceCategories.js";
export { useServices } from "./hooks/useServices.js";
export {
  default as serviceCategoryReducer,
  fetchPopularServiceCategories,
  fetchServiceCategories,
} from "./store/serviceCategorySlice.js";
export {
  default as serviceReducer,
  fetchFeaturedServices,
  fetchServiceCatalog,
  fetchServiceDetails,
  fetchRelatedServices,
  fetchServiceReviews,
} from "./store/serviceSlice.js";
