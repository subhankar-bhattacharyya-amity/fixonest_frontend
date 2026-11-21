import { appConfig } from "@/lib/config.js";
import { formatDate } from "@/utils/formatDate.js";

// backend/app/router/customer/blog.routes.js and blog_category.routes.js -
// public, read-only endpoints (no login needed).
export const BLOG_API_PATH = "/api/v1/blogs";
export const BLOG_CATEGORY_API_PATH = "/api/v1/blog-categories";

// Cards per page of the Blog listing.
export const BLOGS_PER_PAGE = 9;

// Posts shown in each of the details page's Popular / Recent / Trendy lists.
export const BLOG_HIGHLIGHT_COUNT = 3;

// Every blog image is uploaded from the Admin Panel and served by the
// backend; paths are stored relative to its public folder
// ("uploads/blogs/<file>"). null when there is no image.
const buildImageUrl = (path) => (path ? `${appConfig.apiBaseUrl}/${path.replace(/^\/+/, "")}` : null);

// Turns a blog from the API into the `post` shape the blog components have
// always rendered (see features/blog/components/BlogCard.jsx):
//   id          - the slug; what the details page URL is built from.
//   blogId      - the MongoDB _id; what the comment endpoints are keyed by.
//   category    - { id, name } of its blog category.
//   image       - the cover's URL, or null when the blog has none.
//   publishedAt - e.g. "Jan 8, 2025".   readTime - e.g. "4 min read".
//   contentHtml / galleryImages - only on a blog loaded by slug (details page).
export const toBlogPost = (blog) => {
  const category = blog.blogCategoryId ?? null;

  return {
    id: blog.slug,
    blogId: blog._id,
    title: blog.title,
    excerpt: blog.excerpt ?? "",
    author: blog.writtenBy,
    tags: blog.tags ?? [],
    publishedAt: formatDate(new Date(blog.createdAt)),
    readTime: `${blog.readingTimeInMin ?? 1} min read`,
    category: category ? { id: category._id, name: category.name } : null,
    image: buildImageUrl(blog.coverImage),
    contentHtml: blog.content ?? "",
    galleryImages: (blog.images ?? []).map((image) => buildImageUrl(image.image_url)).filter(Boolean),
  };
};
