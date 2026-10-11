export default function Loading() {
  return (
    <main
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="loading-fade min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
    >
      <style>{`
        @keyframes loading-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        /* Short delay so quick navigations never flash a skeleton */
        .loading-fade { animation: loading-fade 0.3s ease-out 0.15s both; }
        .loading-bar { animation: loading-slide 1.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .loading-fade { animation: none; opacity: 1; }
          .loading-bar { animation: none; }
        }
      `}</style>

      <span className="sr-only">Loading…</span>

      <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-slate-200/60">
        <div className="loading-bar h-full w-1/3 rounded-full bg-slate-900" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:gap-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="h-6 w-44 animate-pulse rounded-md bg-slate-200" />
            <div className="h-4 w-28 animate-pulse rounded-md bg-slate-200" />
          </div>
          <div className="h-9 w-20 animate-pulse rounded-lg bg-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
              <div className="h-7 w-16 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-14 animate-pulse rounded bg-slate-200" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 last:border-0 sm:px-5"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-200 sm:w-44" />
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
              <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
