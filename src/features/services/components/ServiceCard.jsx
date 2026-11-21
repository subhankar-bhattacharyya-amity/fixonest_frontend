import { motion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import AuthGatedLink from "@/routes/guards/AuthGatedLink.jsx";
import { getServiceDetailsPath } from "@/routes/constants.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// Shared by Home's "Featured services" spotlight, the Services page catalog
// and the details page's related services. `service` is the shape
// definitions/services.js's toServiceCard builds from the API. `imageFit` is
// "cover" on Home, and "contain" (with a soft tint behind it) in the catalog
// and for a service that only has its category's icon.
export default function ServiceCard({ service, category, image, imageFit = "cover", index = 0 }) {
  return (
    <motion.div
      layout
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={fadeUp}
      transition={{
        layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.35, ease: "easeOut", delay: (index % 6) * 0.06 },
        y: { duration: 0.35, ease: "easeOut", delay: (index % 6) * 0.06 },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/60 transition hover:shadow-lg hover:shadow-slate-200/70 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-none dark:hover:shadow-black/20"
    >
      <div
        className={`relative h-44 overflow-hidden ${
          imageFit === "contain" ? "bg-indigo-50 dark:bg-indigo-500/10" : ""
        }`}
      >
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className={`h-full w-full ${imageFit === "contain" ? "object-contain p-6" : "object-cover"}`}
        />

        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur dark:bg-(--surface-1)/90 dark:text-(--text-primary)">
          {category?.name}
        </span>

        <Link
          to={getServiceDetailsPath(service.slug)}
          aria-label={`View details for ${service.name}`}
          className="absolute right-4 top-4 flex h-9 w-9 -translate-x-2 items-center justify-center rounded-full bg-white/90 text-slate-500 opacity-0 shadow-sm backdrop-blur transition duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100 hover:text-indigo-600 dark:bg-(--surface-1)/90 dark:text-(--text-muted)"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h4 className="line-clamp-2 text-base font-semibold text-slate-900 dark:text-(--text-primary)">
            {service.name}
          </h4>
          <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-xs font-medium text-slate-600 dark:text-(--text-muted)">
            {service.reviewCount > 0 ? (
              <>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {service.rating.toFixed(1)}
              </>
            ) : (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                New
              </span>
            )}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-(--text-muted)">Starting from</p>
            <p className="mt-0.5 flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-(--text-primary)">
                {service.startingPrice}
              </span>
              {service.originalPrice ? (
                <span className="text-sm text-slate-400 line-through dark:text-(--text-muted)">
                  {service.originalPrice}
                </span>
              ) : null}
            </p>
          </div>

          <div className="grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grid-cols-[1fr] group-hover:opacity-100 group-focus-within:grid-cols-[1fr] group-focus-within:opacity-100">
            <div className="overflow-hidden">
              <AuthGatedLink
                to={getServiceDetailsPath(service.slug)}
                className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:shadow-indigo-600/40"
              >
                Book Now
              </AuthGatedLink>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
