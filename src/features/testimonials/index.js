// Public API of the testimonials feature. Import from
// "@/features/testimonials/index.js", never reach into store/ from outside
// this folder.
export { useTestimonials } from "./hooks/useTestimonials.js";
export {
  default as testimonialsReducer,
  fetchHomeTestimonials,
} from "./store/testimonialsSlice.js";
