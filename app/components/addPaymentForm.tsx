"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPaymentForm({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [datePaid, setDatePaid] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          amount: Number(amount),
          month: Number(month),
          year: Number(year),
          datePaid,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add payment");
      }

      setAmount("");
      setMonth("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Month (rent for)
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">Select</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Date paid
          </label>
          <input
            type="date"
            value={datePaid}
            onChange={(e) => setDatePaid(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Amount (Rs.)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="1"
            className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="e.g. 5000"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {month && year && amount && datePaid && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
            <p className="text-xs text-slate-500">This will record:</p>
            <p className="text-sm text-slate-800 mt-0.5">
              For{" "}
              <span className="font-medium">
                {new Date(2000, Number(month) - 1).toLocaleString("default", {
                  month: "long",
                })}{" "}
                {year}
              </span>{" "}
              · Paid on{" "}
              <span className="font-medium">
                {new Date(datePaid).toLocaleDateString("en-GB")}
              </span>{" "}
              · Rs.{" "}
              <span className="font-medium">
                {Number(amount).toLocaleString()}
              </span>
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add payment"}
        </button>
      </form>
    </div>
  );
}
