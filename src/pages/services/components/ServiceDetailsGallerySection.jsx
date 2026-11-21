import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import { ROUTES } from "@/routes/constants.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const TILE_BORDER = "overflow-hidden rounded-3xl border border-slate-100 dark:border-(--border-subtle)";

// Title/breadcrumb + the gallery (one big image + two stacked) - the page's
// opening section. Price and the Book Now CTA live in
// ServiceDetailsInfoSection's sticky sidebar instead, not here.
// `galleryImages` is the cover first, then the admin's gallery in order. With
// fewer than three images the big one takes the free space; with more than
// three the last tile shows "+N", and every tile opens a full-screen viewer.
export default function ServiceDetailsGallerySection({ service, category, galleryImages = [] }) {
  const [viewerIndex, setViewerIndex] = useState(null);
  const [mainImage, ...detailImages] = galleryImages;
  const shownDetails = detailImages.slice(0, 2);
  const hiddenCount = detailImages.length - shownDetails.length;

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10" />
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/10" />

      <div className="relative mx-auto max-w-7xl px-3 py-10 sm:px-6 sm:py-14 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5, ease: "easeOut" }}>
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-(--text-muted)"
          >
            <Link to={ROUTES.HOME} className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={ROUTES.SERVICES} className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              Services
            </Link>
            {category ? (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link
                  to={`${ROUTES.SERVICES}?category=${category.slug}`}
                  className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {category.name}
                </Link>
              </>
            ) : null}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate text-slate-700 dark:text-(--text-primary)">{service.name}</span>
          </nav>

          <div className="mt-5">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-4xl lg:text-5xl">
              {service.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-(--text-muted)">
              {category ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {category.name}
                </span>
              ) : null}
              {service.reviewCount > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-slate-900 dark:text-(--text-primary)">
                    {service.rating.toFixed(1)}
                  </span>
                  <span>
                    ({service.reviewCount.toLocaleString()} {service.reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-slate-200 text-slate-200 dark:fill-(--surface-2) dark:text-(--surface-2)" />
                  No reviews yet
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {mainImage ? (
          <motion.div
            className={`mt-8 grid grid-cols-1 gap-4 md:h-105 md:grid-cols-3 ${shownDetails.length === 2 ? "md:grid-rows-2" : ""}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            <GalleryTile
              className={`bg-indigo-50 shadow-xl shadow-indigo-900/5 dark:bg-indigo-500/10 dark:shadow-black/20 ${
                shownDetails.length === 0 ? "md:col-span-3" : "md:col-span-2"
              } ${shownDetails.length === 2 ? "md:row-span-2" : ""}`}
              label={`View ${service.name} photo 1`}
              onOpen={() => setViewerIndex(0)}
            >
              <img src={mainImage} alt="" aria-hidden="true" className="h-full w-full object-contain p-10" />
            </GalleryTile>
            {shownDetails.map((image, index) => (
              <GalleryTile
                key={image}
                className="shadow-lg shadow-indigo-900/5 dark:shadow-black/20"
                label={`View ${service.name} photo ${index + 2}`}
                onOpen={() => setViewerIndex(index + 1)}
              >
                <img src={image} alt="" aria-hidden="true" className="h-full w-full object-cover" />
                {index === shownDetails.length - 1 && hiddenCount > 0 ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-slate-900/50 text-2xl font-extrabold text-white">
                    +{hiddenCount}
                  </span>
                ) : null}
              </GalleryTile>
            ))}
          </motion.div>
        ) : null}
      </div>

      <AnimatePresence>
        {viewerIndex !== null ? (
          <GalleryViewer
            images={galleryImages}
            index={viewerIndex}
            title={service.name}
            onIndexChange={setViewerIndex}
            onClose={() => setViewerIndex(null)}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function GalleryTile({ className = "", label, onOpen, children }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      className={`group relative block h-56 cursor-zoom-in md:h-auto ${TILE_BORDER} ${className} focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30`}
    >
      <span className="block h-full w-full transition duration-500 group-hover:scale-[1.03]">{children}</span>
    </button>
  );
}

// Full-screen photo viewer: arrows or ← → keys to move, Esc or the backdrop to close.
function GalleryViewer({ images, index, title, onIndexChange, onClose }) {
  const count = images.length;
  const go = useCallback((step) => onIndexChange((index + step + count) % count), [index, count, onIndexChange]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", handleKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = overflow;
    };
  }, [go, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      <AnimatePresence mode="wait">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt={`${title} - photo ${index + 1} of ${count}`}
          className="max-h-[80vh] max-w-full rounded-2xl bg-white object-contain shadow-2xl"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          onClick={(event) => event.stopPropagation()}
        />
      </AnimatePresence>

      {count > 1 ? (
        <>
          <ViewerArrow side="left" label="Previous photo" onClick={() => go(-1)}>
            <ChevronLeft className="h-6 w-6" />
          </ViewerArrow>
          <ViewerArrow side="right" label="Next photo" onClick={() => go(1)}>
            <ChevronRight className="h-6 w-6" />
          </ViewerArrow>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
            {index + 1} / {count}
          </span>
        </>
      ) : null}
    </motion.div>
  );
}

function ViewerArrow({ side, label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      aria-label={label}
      className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 ${
        side === "left" ? "left-3 sm:left-6" : "right-3 sm:right-6"
      }`}
    >
      {children}
    </button>
  );
}
