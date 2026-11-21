import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { fetchBlogCategories, fetchBlogs, useBlog } from "@/features/blog/index.js";
import { BlogHeroSection, BlogListingSection } from "./components/index.js";

// How long to wait after the last keystroke before searching.
const SEARCH_DEBOUNCE_MS = 350;

// Search query, active category and page live here (not inside either
// section) since the hero's search bar/pills and the listing grid below them
// all drive the same request - same pattern as ServicesPage.jsx/WorkersPage.jsx.
// The categories and the posts come from the backend, which also does the
// searching, filtering and paging.
export default function BlogPage() {
  useDocumentTitle("Fixonest");
  const dispatch = useDispatch();
  const { categories, list } = useBlog();

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchBlogCategories());
  }, [dispatch]);

  // Debounce typing, and go back to page 1 whenever the search changes.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const request = dispatch(
      fetchBlogs({ page, search, categoryId: activeCategory === "all" ? undefined : activeCategory }),
    );
    // A newer search or filter makes this one's result irrelevant.
    return () => request.abort();
  }, [dispatch, page, search, activeCategory]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setPage(1);
  };

  return (
    <>
      <BlogHeroSection
        query={query}
        onQueryChange={setQuery}
        categories={categories.items}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      <BlogListingSection
        posts={list.items}
        total={list.meta.total}
        page={page}
        totalPages={Math.max(1, list.meta.totalPages)}
        onPageChange={setPage}
        isLoading={list.status === "idle" || list.status === "loading"}
        hasFilters={Boolean(search) || activeCategory !== "all"}
      />
    </>
  );
}
