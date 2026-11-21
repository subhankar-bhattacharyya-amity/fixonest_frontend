import { useSelector } from "react-redux";

// Read-only view of the blog slice ({ categories, list, details, highlights }).
// Loading is done by dispatching the slice's thunks - see
// features/blog/store/blogSlice.js.
export function useBlog() {
  return useSelector((state) => state.blog);
}
