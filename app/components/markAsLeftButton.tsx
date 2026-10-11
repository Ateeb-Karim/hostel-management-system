"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertTriangle, LogOut, RotateCcw, Loader2 } from "lucide-react";

type Props = {
  studentId: string;
  studentName: string;
  joinDate: string;
  leaveDate: string | null;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function monthYear(isoOrDate: string) {
  const [y, m] = isoOrDate.slice(0, 10).split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

function localToday() {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

const actionButtonClass =
  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 sm:flex-none";

export default function MarkAsLeftButton({
  studentId,
  studentName,
  joinDate,
  leaveDate,
}: Props) {
  const router = useRouter();
  const [dialog, setDialog] = useState<null | "leave" | "reinstate">(null);
  const [date, setDate] = useState("");
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cancelRef = useRef<HTMLButtonElement>(null);

  const hasLeft = Boolean(leaveDate);

  function openDialog(mode: "leave" | "reinstate") {
    const t = localToday();
    setToday(t);
    setDate(t);
    setError("");
    setDialog(mode);
  }

  function close() {
    if (loading) return;
    setDialog(null);
    setError("");
  }

  useEffect(() => {
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [dialog]);

  useEffect(() => {
    if (!dialog) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) {
        setDialog(null);
        setError("");
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dialog, loading]);

  async function handleConfirm() {
    if (dialog === "leave" && !date) {
      setError("Please choose the date the student left");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/left-student/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveDate: dialog === "leave" ? date : null }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Failed to update student");
        setLoading(false);
        return;
      }

      setLoading(false);
      setDialog(null);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      {hasLeft ? (
        <button
          type="button"
          onClick={() => openDialog("reinstate")}
          className={actionButtonClass}
        >
          <RotateCcw size={14} />
          Reinstate
        </button>
      ) : (
        <button
          type="button"
          onClick={() => openDialog("leave")}
          className={actionButtonClass}
        >
          <LogOut size={14} />
          Mark as left
        </button>
      )}

      {dialog &&
        createPortal(
          <div
            className="leave-overlay fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <style>{`
              @keyframes leave-overlay-in {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes leave-panel-in {
                from { opacity: 0; transform: translateY(12px) scale(0.97); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
              .leave-overlay { animation: leave-overlay-in 0.2s ease-out both; }
              .leave-panel { animation: leave-panel-in 0.25s ease-out both; }
              @media (prefers-reduced-motion: reduce) {
                .leave-overlay, .leave-panel { animation: none; }
              }
            `}</style>

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="leave-title"
              aria-describedby="leave-description"
              className="leave-panel w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    dialog === "leave" ? "bg-amber-50" : "bg-slate-100"
                  }`}
                >
                  {dialog === "leave" ? (
                    <AlertTriangle size={22} className="text-amber-500" />
                  ) : (
                    <RotateCcw size={20} className="text-slate-500" />
                  )}
                </div>

                <div className="min-w-0">
                  <h2
                    id="leave-title"
                    className="text-base font-semibold text-slate-900"
                  >
                    {dialog === "leave"
                      ? "Mark student as left?"
                      : "Reinstate student?"}
                  </h2>

                  {dialog === "leave" ? (
                    <p
                      id="leave-description"
                      className="mt-1.5 text-sm text-slate-500"
                    >
                      <span className="wrap-break-word font-medium text-slate-700">
                        {studentName}
                      </span>
                      &apos;s rent, dues and month-by-month status will stop
                      after the month they leave. No rent is charged for later
                      months. All payments stay on record, and you can reinstate
                      them at any time.
                    </p>
                  ) : (
                    <p
                      id="leave-description"
                      className="mt-1.5 text-sm text-slate-500"
                    >
                      This removes the leave date, so{" "}
                      <span className="wrap-break-word font-medium text-slate-700">
                        {studentName}
                      </span>{" "}
                      is charged rent every month again, up to the current
                      month.
                    </p>
                  )}
                </div>
              </div>

              {dialog === "leave" && (
                <div className="mt-5">
                  <label className="mb-1 block text-sm font-medium text-slate-600">
                    Date they left
                  </label>
                  <input
                    type="date"
                    value={date}
                    min={joinDate.slice(0, 10)}
                    max={today}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none  focus:ring-2 focus:ring-slate-200"
                  />
                  {date && (
                    <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      Rent will be charged up to {monthYear(date)} and nothing
                      after that.
                    </p>
                  )}
                </div>
              )}

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
                  onClick={handleConfirm}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : dialog === "leave" ? (
                    <LogOut size={15} />
                  ) : (
                    <RotateCcw size={15} />
                  )}
                  {loading
                    ? "Saving..."
                    : dialog === "leave"
                      ? "Yes, mark as left"
                      : "Yes, reinstate"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
