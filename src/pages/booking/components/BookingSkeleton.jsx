// The booking page's footprint while the service / worker loads.
export default function BookingSkeleton({ label }) {
  const block = "animate-pulse rounded bg-slate-100 dark:bg-(--surface-2)";
  return (
    <div className="mx-auto max-w-7xl px-3 py-10 sm:px-6 sm:py-14 lg:px-8" aria-busy="true" aria-label={label}>
      <div className={`h-4 w-72 max-w-full ${block}`} />
      <div className={`mt-6 h-10 w-80 max-w-full ${block}`} />
      <div className={`mt-3 h-5 w-96 max-w-full ${block}`} />
      <div className={`mt-8 h-16 w-full rounded-2xl ${block}`} />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className={`h-130 rounded-3xl ${block}`} />
        <div className={`h-96 rounded-3xl ${block}`} />
      </div>
    </div>
  );
}
