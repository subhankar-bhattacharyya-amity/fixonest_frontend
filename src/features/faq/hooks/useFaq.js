import { useSelector } from "react-redux";

// Read-only view of the FAQ slice ({ home }). Loading is done by dispatching
// the slice's thunks - see features/faq/store/faqSlice.js.
export function useFaq() {
  return useSelector((state) => state.faq);
}
