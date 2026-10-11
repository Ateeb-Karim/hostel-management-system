"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Loader2 } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  function handleRetry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  const isDev = process.env.NODE_ENV === "development";

  return (
    <main
      role="alert"
      className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-10"
    >
      <style>{`
        @keyframes error-rise {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .error-card { animation: error-rise 0.35s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .error-card { animation: none; }
        }
      `}</style>

      <div className="error-card w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle size={26} className="text-red-500" />
        </div>

        <h1 className="mt-5 text-lg font-semibold text-slate-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          We couldn&apos;t load this page. This is usually temporary, so try
          again. If it keeps happening, go back to the start and retry from
          there.
        </p>

        {isDev && error.message && (
          <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-slate-50 p-3 text-left text-xs text-red-600 whitespace-pre-wrap wrap-break-words">
            {error.message}
          </pre>
        )}

        {error.digest && (
          <p className="mt-3 text-xs text-slate-400">
            Reference: <span className="font-mono">{error.digest}</span>
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <RefreshCw size={15} />
            )}
            {isPending ? "Retrying..." : "Try again"}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <Home size={15} />
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
