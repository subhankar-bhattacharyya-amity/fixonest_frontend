import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, Clock, Tag, User, X as XIcon } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "@/components/common/icons/index.js";
import { ROUTES } from "@/routes/constants.js";
import { sanitizeHtml } from "@/utils/sanitizeHtml.js";
import BlogSidebarWidget from "./BlogSidebarWidget.jsx";
import BlogCommentsSection from "./BlogCommentsSection.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const SHARE_LINKS = [
  { id: "facebook", label: "Share on Facebook", Icon: FacebookIcon },
  { id: "x", label: "Share on X", Icon: XIcon },
  { id: "linkedin", label: "Share on LinkedIn", Icon: LinkedinIcon },
  { id: "instagram", label: "Share on Instagram", Icon: InstagramIcon },
];

// Backgrounds behind the article's gallery images, used in turn.
const GALLERY_TONES = ["bg-fuchsia-50 dark:bg-fuchsia-500/10", "bg-amber-50 dark:bg-amber-500/10"];

// `post` comes from the backend (see features/blog/definitions/blogs.js's
// toBlogPost). Its body is the HTML the admin wrote in the panel's editor,
// cleaned before it is rendered; the `.blog-content` rules in
// styles/index.css give it this page's typography. The comments below the
// article come from the backend too - see BlogCommentsSection.jsx.
export default function BlogDetailsContentSection({ post, category, mainImage, detailImages }) {
  const contentHtml = useMemo(() => sanitizeHtml(post.contentHtml), [post.contentHtml]);

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10" />
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/10" />

      <div className="relative mx-auto max-w-7xl px-3 py-10 sm:px-6 sm:py-14 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-(--text-muted)"
        >
          <Link to={ROUTES.HOME} className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to={ROUTES.BLOG} className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
            Blog
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-slate-700 dark:text-(--text-primary)">{post.title}</span>
        </nav>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5, ease: "easeOut" }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
              {category?.name}
            </span>

            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-4xl">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-(--text-muted)">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {post.publishedAt}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4" />
                By {post.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            </div>

            {/* The cover uploaded from the Admin Panel - left out when the blog has none. */}
            {mainImage ? (
              <div className="mt-8 aspect-video overflow-hidden rounded-3xl border border-slate-100 bg-indigo-50 shadow-xl shadow-indigo-900/5 dark:border-(--border-subtle) dark:bg-indigo-500/10 dark:shadow-black/20">
                <img src={mainImage} alt="" className="h-full w-full object-contain p-10" />
              </div>
            ) : null}

            <div className="mt-8">
              <div className="blog-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />

              {detailImages.length > 0 ? (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {detailImages.map((image, index) => (
                    <div
                      key={image}
                      className={`aspect-square overflow-hidden rounded-2xl ${GALLERY_TONES[index % GALLERY_TONES.length]}`}
                    >
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 dark:border-(--border-subtle)">
              <div className="flex flex-wrap items-center gap-2">
                {post.tags.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-(--text-primary)">
                    <Tag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Tags:
                  </span>
                ) : null}
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-(--surface-2) dark:text-(--text-muted)"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-(--text-primary)">Share:</span>
                {SHARE_LINKS.map(({ id, label, Icon }) => (
                  <a
                    key={id}
                    href="#"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-(--border-subtle) dark:text-(--text-muted)"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <BlogCommentsSection blogId={post.blogId} postSlug={post.id} />
          </motion.div>

          <motion.aside
            className="lg:sticky lg:top-24 lg:self-start"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <BlogSidebarWidget currentPostId={post.id} />
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
