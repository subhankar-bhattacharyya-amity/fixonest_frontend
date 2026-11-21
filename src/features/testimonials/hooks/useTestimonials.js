import { useSelector } from "react-redux";

// Read-only view of the testimonials slice ({ home }). Loading is done by
// dispatching the slice's thunks - see features/testimonials/store/testimonialsSlice.js.
export function useTestimonials() {
  return useSelector((state) => state.testimonials);
}
