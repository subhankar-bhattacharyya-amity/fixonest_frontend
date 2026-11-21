import { useSelector } from "react-redux";

// Read-only view of the blog comments slice ({ blogId, byId, topLevel,
// replies, likedIds, likePendingIds }). Loading and changes are done by
// dispatching the slice's thunks - see features/blog/store/blogCommentSlice.js.
export function useBlogComments() {
  return useSelector((state) => state.blogComments);
}
