"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

export default function DeleteStudentButton({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cancelRef = useRef<HTMLButtonElement>(null);

  function close() {
    if (loading) return;
    setOpen(false);
    setError("");
  }

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) {
        setOpen(false);
        setError("");
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, loading]);

  async function handleDelete() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/delete-student/${studentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Failed to delete student");
        setLoading(false);
        return;
      }

      router.push("/warden");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 sm:w-auto"
      >
        <Trash2 size={15} />
        Delete student
      </button>

      {open &&
        createPortal(
          <div
            className="delete-overlay fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <style>{`
              @keyframes delete-overlay-in {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes delete-panel-in {
                from { opacity: 0; transform: translateY(12px) scale(0.97); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
              .delete-overlay { animation: delete-overlay-in 0.2s ease-out both; }
              .delete-panel { animation: delete-panel-in 0.25s ease-out both; }
              @media (prefers-reduced-motion: reduce) {
                .delete-overlay, .delete-panel { animation: none; }
              }
            `}</style>

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-student-title"
              aria-describedby="delete-student-description"
              className="delete-panel w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <AlertTriangle size={22} className="text-red-500" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="delete-student-title"
                    className="text-base font-semibold text-slate-900"
                  >
                    Delete student?
                  </h2>
                  <p
                    id="delete-student-description"
                    className="mt-1.5 text-sm text-slate-500"
                  >
                    You&apos;re about to permanently delete{" "}
                    <span className="wrap-break-word font-medium text-slate-700">
                      {studentName}
                    </span>
                    . This removes their login account and all of their payment
                    records. This can&apos;t be undone.
                  </p>
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  ref={cancelRef}
                  type="button"
                  onClick={close}
                  disabled={loading}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                  {loading ? "Deleting..." : "Yes, delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
