"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

type Payment = {
  id: string;
  amount: number;
  month: number;
  year: number;
  datePaid: string;
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

// Fixed format from the ISO string, so server and browser always agree
function formatDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

function PaymentRow({ payment }: { payment: Payment }) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit" | "confirmDelete">("view");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [month, setMonth] = useState(String(payment.month));
  const [year, setYear] = useState(String(payment.year));
  const [amount, setAmount] = useState(String(payment.amount));
  const [datePaid, setDatePaid] = useState(payment.datePaid.slice(0, 10));

  function reset() {
    setMonth(String(payment.month));
    setYear(String(payment.year));
    setAmount(String(payment.amount));
    setDatePaid(payment.datePaid.slice(0, 10));
    setError("");
    setMode("view");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/payments/${payment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year, amount, datePaid }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Failed to save changes");
        setLoading(false);
        return;
      }

      setLoading(false);
      setMode("view");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/payments/${payment.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Failed to delete payment");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (mode === "edit") {
    return (
      <form
        onSubmit={handleSave}
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Month
            </label>
            <select
              className={inputClass}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {MONTHS.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Year
            </label>
            <input
              type="number"
              min={2000}
              max={2100}
              className={inputClass}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Amount (Rs.)
            </label>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Date paid
            </label>
            <input
              type="date"
              className={inputClass}
              value={datePaid}
              onChange={(e) => setDatePaid(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60"
          >
            <X size={14} />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    );
  }

  if (mode === "confirmDelete") {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
        <p className="text-sm text-red-700">
          Delete the Rs. {payment.amount.toLocaleString()} payment for{" "}
          {MONTHS[payment.month - 1]} {payment.year}? This can&apos;t be undone.
        </p>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setError("");
              setMode("view");
            }}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm text-slate-700">
          For {MONTHS[payment.month - 1]} {payment.year}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          Paid on {formatDate(payment.datePaid)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span className="mr-1 text-sm font-semibold text-slate-800">
          Rs. {payment.amount.toLocaleString()}
        </span>
        <button
          type="button"
          onClick={() => setMode("edit")}
          aria-label="Edit payment"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          onClick={() => setMode("confirmDelete")}
          aria-label="Delete payment"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

export default function PaymentHistory({ payments }: { payments: Payment[] }) {
  return (
    <div className="flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
      {payments.length === 0 && (
        <p className="py-4 text-center text-sm text-slate-400">
          No payments recorded yet.
        </p>
      )}
      {payments.map((payment) => (
        <PaymentRow key={payment.id} payment={payment} />
      ))}
    </div>
  );
}
