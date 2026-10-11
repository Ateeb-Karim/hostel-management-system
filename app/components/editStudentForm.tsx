"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  student: {
    id: string;
    name: string;
    roomNo: string;
    phone: string | null;
    monthlyRent: number;
  };
};

export default function EditStudentForm({ student }: Props) {
  const router = useRouter();
  const [name, setName] = useState(student.name);
  const [roomNo, setRoomNo] = useState(student.roomNo);
  const [phone, setPhone] = useState(student.phone ?? "");
  const [monthlyRent, setMonthlyRent] = useState(String(student.monthlyRent));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rentChanged = Number(monthlyRent) !== student.monthlyRent;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, roomNo, phone, monthlyRent }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Failed to save changes");
        setLoading(false);
        return;
      }

      router.push(`/warden/student/${student.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          Full name
        </label>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Room number
          </label>
          <input
            className={inputClass}
            value={roomNo}
            onChange={(e) => setRoomNo(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Phone (optional)
          </label>
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          Monthly rent (Rs.)
        </label>
        <input
          type="number"
          min={1}
          className={inputClass}
          value={monthlyRent}
          onChange={(e) => setMonthlyRent(e.target.value)}
          required
        />
        {rentChanged && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Changing the rent applies to all months, including past ones, so
            previously paid months may show as partial or overpaid.
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={`/warden/student/${student.id}`}
          className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
