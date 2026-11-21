import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { fetchHomeTestimonials, useTestimonials } from "@/features/testimonials/index.js";

// Section heading copy. The testimonials themselves come from the API
// (Super Admin managed) - see features/testimonials.
const testimonialsContent = {
  eyebrow: "Loved by homeowners",
  title: "Don't just take ",
  titleHighlight: "our word for it.",
  subtitle: "Real feedback from customers who've booked repair and household services through Fixonest.",
};

const SLIDE_CLASS = "min-w-0 flex-[0_0_100%] pl-4 sm:flex-[0_0_50%] sm:pl-6 lg:flex-[0_0_33.3333%]";
const CARD_CLASS =
  "flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/20 sm:p-8";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// Own local state per card instance (each mapped element gets its own),
// so one broken image never affects any other card. Shows the
// gradient-initials badge when there is no photo or it fails to load.
function TestimonialAvatar({ testimonial }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!testimonial.avatar || imageFailed) {
    return (
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${testimonial.gradient} text-sm font-semibold text-white`}
      >
        {testimonial.initials}
      </span>
    );
  }

  return (
    <span className={`shrink-0 rounded-full bg-linear-to-br p-0.5 ${testimonial.gradient}`}>
      <img
        src={testimonial.avatar}
        onError={() => setImageFailed(true)}
        alt={testimonial.name}
        className="h-11 w-11 rounded-full object-cover ring-2 ring-white dark:ring-(--surface-1)"
      />
    </span>
  );
}

// Placeholder card with a testimonial card's proportions, shown while loading.
function TestimonialCardSkeleton() {
  return (
    <div className={SLIDE_CLASS}>
      <div className={`${CARD_CLASS} animate-pulse`}>
        <div className="h-8 w-8 rounded bg-slate-100 dark:bg-(--surface-2)" />
        <div className="mt-3 h-4 w-24 rounded bg-slate-100 dark:bg-(--surface-2)" />
        <div className="mt-4 flex-1 space-y-2">
          <div className="h-3 w-full rounded bg-slate-100 dark:bg-(--surface-2)" />
          <div className="h-3 w-full rounded bg-slate-100 dark:bg-(--surface-2)" />
          <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-(--surface-2)" />
        </div>
        <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-(--border-subtle)">
          <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-(--surface-2)" />
          <div className="h-3 w-28 rounded bg-slate-100 dark:bg-(--surface-2)" />
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const dispatch = useDispatch();
  const { items: testimonials, status } = useTestimonials().home;
  const isLoading = status === "idle" || status === "loading";

  useEffect(() => {
    dispatch(fetchHomeTestimonials());
  }, [dispatch]);

  // AutoScroll drifts continuously at a constant speed (a smooth marquee),
  // rather than Autoplay's discrete snap-and-pause per slide.
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    AutoScroll({ speed: 1, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback((api) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  // Slides arrive after the API responds, so Embla re-initialises; refresh
  // the dot count then too.
  const onReInit = useCallback(
    (api) => {
      setScrollSnaps(api.scrollSnapList());
      onSelect(api);
    },
    [onSelect],
  );

  useEffect(() => {
    if (!emblaApi) return undefined;
    onReInit(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onReInit);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onReInit);
    };
  }, [emblaApi, onSelect, onReInit]);

  // Nothing to show (no active testimonials, or the request failed): hide the section.
  if (!isLoading && testimonials.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
            {testimonialsContent.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-4xl">
            {testimonialsContent.title}
            <span className="gradient-text-animate">{testimonialsContent.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-(--text-muted)">
            {testimonialsContent.subtitle}
          </p>
        </motion.div>

        <div className="mt-10 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous testimonial"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-(--border-subtle) dark:text-(--text-muted) dark:hover:bg-(--surface-2)"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next testimonial"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-(--border-subtle) dark:text-(--text-muted) dark:hover:bg-(--surface-2)"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 overflow-hidden" ref={emblaRef}>
          <div className="-ml-4 flex sm:-ml-6">
            {isLoading
              ? Array.from({ length: 3 }, (_, index) => <TestimonialCardSkeleton key={index} />)
              : testimonials.map((testimonial) => (
              <div key={testimonial.id} className={SLIDE_CLASS}>
                <div className={CARD_CLASS}>
                  <Quote className="h-8 w-8 text-indigo-200 dark:text-indigo-500/30" />

                  <div className="mt-3 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < testimonial.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200 dark:fill-(--surface-2) dark:text-(--surface-2)"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600 dark:text-(--text-muted)">
                    "{testimonial.quote}"
                  </p>

                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-(--border-subtle)">
                    <TestimonialAvatar testimonial={testimonial} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-(--text-primary)">
                        {testimonial.name}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-(--text-muted)">
                        {[testimonial.service, testimonial.location].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Go to testimonial ${index + 1}`}
              className={`h-2 rounded-full transition-all ${
                index === selectedIndex
                  ? "w-6 bg-linear-to-r from-indigo-600 to-fuchsia-600"
                  : "w-2 bg-slate-200 dark:bg-(--surface-2)"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
