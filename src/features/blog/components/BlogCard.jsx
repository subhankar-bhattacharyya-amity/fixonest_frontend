import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Calendar, ImageOff } from "lucide-react";
import { Link } from "react-router-dom";
import { getBlogDetailsPath } from "@/routes/constants.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function BlogCard({ post, category, image, index = 0 }) {
  return (
    <motion.div
      layout
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={fadeUp}
      transition={{
        layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.35, ease: "easeOut", delay: (index % 9) * 0.05 },
        y: { duration: 0.35, ease: "easeOut", delay: (index % 9) * 0.05 },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/60 transition hover:shadow-lg hover:shadow-slate-200/70 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-none dark:hover:shadow-black/20"
    >
      <div className="relative h-44 overflow-hidden bg-indigo-50 dark:bg-indigo-500/10">
        {/* The cover uploaded from the Admin Panel; null when the blog has none. */}
        {image ? (
          <img src={image} alt="" aria-hidden="true" className="h-full w-full object-contain p-6" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-indigo-200 dark:text-indigo-400/40">
            <ImageOff className="h-10 w-10" aria-hidden="true" />
          </span>
        )}

        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur dark:bg-(--surface-1)/90 dark:text-(--text-primary)">
          {category?.name}
        </span>

        <Link
          to={getBlogDetailsPath(post.id)}
          aria-label={`Read "${post.title}"`}
          className="absolute right-4 top-4 flex h-9 w-9 scale-90 items-center justify-center rounded-full bg-white/90 text-slate-500 opacity-0 shadow-sm backdrop-blur transition duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100 hover:text-indigo-600 dark:bg-(--surface-1)/90 dark:text-(--text-muted)"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-(--text-muted)">
          <Calendar className="h-3.5 w-3.5" />
          {post.publishedAt}
          <span className="text-slate-300 dark:text-(--border-subtle)">•</span>
          {post.readTime}
        </div>

        <h4 className="mt-2.5 line-clamp-2 text-base font-semibold text-slate-900 dark:text-(--text-primary)">
          {post.title}
        </h4>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500 dark:text-(--text-muted)">
          {post.excerpt}
        </p>

        <div className="mt-4 flex justify-end">
          <div className="grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grid-cols-[1fr] group-hover:opacity-100 group-focus-within:grid-cols-[1fr] group-focus-within:opacity-100">
            <div className="overflow-hidden">
              <Link
                to={getBlogDetailsPath(post.id)}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:shadow-indigo-600/40"
              >
                Read more
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
