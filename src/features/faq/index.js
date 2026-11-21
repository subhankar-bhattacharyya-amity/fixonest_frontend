// Public API of the FAQ feature. Import from "@/features/faq/index.js",
// never reach into store/ from outside this folder.
export { useFaq } from "./hooks/useFaq.js";
export { default as faqReducer, fetchHomeFaqs } from "./store/faqSlice.js";
