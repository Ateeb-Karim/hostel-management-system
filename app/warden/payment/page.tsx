import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Receipt,
  Wallet,
  CalendarDays,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 20;

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

// Same fixed format used on the student page, so dates always match
function formatDate(date: Date) {
  const [y, m, d] = date.toISOString().slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    month?: string;
    year?: string;
    page?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "WARDEN") {
    redirect("/login");
  }

  const params = await searchParams;

  const q = params.q?.trim() || "";
  const monthNum = Number(params.month);
  const yearNum = Number(params.year);
  const month =
    Number.isInteger(monthNum) && monthNum >= 1 && monthNum <= 12
      ? monthNum
      : undefined;
  const year =
    Number.isInteger(yearNum) && yearNum >= 2000 && yearNum <= 2100
      ? yearNum
      : undefined;
  const requestedPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const where = {
    ...(month ? { month } : {}),
    ...(year ? { year } : {}),
    ...(q
      ? {
          student: {
            is: {
              OR: [
                { name: { contains: q, mode: "insensitive" as const } },
                { roomNo: { contains: q, mode: "insensitive" as const } },
              ],
            },
          },
        }
      : {}),
  };

  // "Collected this month" is by the date the money was received
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const nextMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );

  const [totalCount, filteredSum, thisMonthSum, yearRows] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.aggregate({ where, _sum: { amount: true } }),
    prisma.payment.aggregate({
      where: { datePaid: { gte: monthStart, lt: nextMonthStart } },
      _sum: { amount: true },
    }),
    prisma.payment.findMany({
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const payments = await prisma.payment.findMany({
    where,
    orderBy: [{ datePaid: "desc" }, { id: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      student: { select: { id: true, name: true, roomNo: true } },
    },
  });

  const totalCollected = filteredSum._sum.amount ?? 0;
  const collectedThisMonth = thisMonthSum._sum.amount ?? 0;
  const hasFilters = Boolean(q) || Boolean(month) || Boolean(year);

  function buildHref(p: number) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (month) sp.set("month", String(month));
    if (year) sp.set("year", String(year));
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/warden/payments?${qs}` : "/warden/payments";
  }

  const firstShown = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastShown = Math.min(page * PAGE_SIZE, totalCount);

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/warden"
          className="mb-5 flex w-fit items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="flex flex-col gap-5 sm:gap-6">
          <div>
            <p className="text-xl font-semibold text-slate-900">
              Payment history
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              Every payment recorded across all students
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            <div className="col-span-2 flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-1">
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays size={13} />
                Collected this month
              </p>
              <p className="text-xl font-semibold text-green-700 sm:text-2xl">
                Rs. {collectedThisMonth.toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <Wallet size={13} />
                {hasFilters ? "Total (filtered)" : "Total collected"}
              </p>
              <p className="wrap-break-word text-xl font-semibold text-slate-900 sm:text-2xl">
                Rs. {totalCollected.toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <Receipt size={13} />
                Payments
              </p>
              <p className="text-xl font-semibold text-slate-900 sm:text-2xl">
                {totalCount.toLocaleString()}
              </p>
            </div>
          </div>

          <form
            method="get"
            className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_180px_140px_auto]"
          >
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search student name or room"
                className={`${inputClass} pl-9`}
              />
            </div>

            <select
              name="month"
              defaultValue={month ? String(month) : ""}
              className={inputClass}
            >
              <option value="">All months</option>
              {MONTHS.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>

            <select
              name="year"
              defaultValue={year ? String(year) : ""}
              className={inputClass}
            >
              <option value="">All years</option>
              {yearRows.map((row) => (
                <option key={row.year} value={row.year}>
                  {row.year}
                </option>
              ))}
            </select>

            <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 lg:flex-none"
              >
                Apply
              </button>
              {hasFilters && (
                <Link
                  href="/warden/payments"
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-600 transition hover:bg-slate-50 lg:flex-none"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden grid-cols-5 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-500 md:grid">
              <p>Student</p>
              <p>Room no.</p>
              <p>For</p>
              <p>Paid on</p>
              <p className="text-right">Amount</p>
            </div>

            {payments.length === 0 && (
              <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Receipt size={22} className="text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">
                  {hasFilters
                    ? "No payments match your search or filters."
                    : "No payments have been recorded yet."}
                </p>
              </div>
            )}

            {payments.map((payment) => (
              <Link
                key={payment.id}
                href={`/warden/student/${payment.student.id}`}
                className="block border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
              >
                <div className="hidden grid-cols-5 items-center gap-4 px-5 py-3 md:grid">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <User size={16} className="text-slate-400" />
                    </div>
                    <span className="truncate text-sm text-slate-800">
                      {payment.student.name}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {payment.student.roomNo}
                  </p>
                  <p className="text-sm text-slate-600">
                    {MONTHS[payment.month - 1]} {payment.year}
                  </p>
                  <p className="text-sm text-slate-600">
                    {formatDate(payment.datePaid)}
                  </p>
                  <p className="text-right text-sm font-semibold text-slate-900">
                    Rs. {payment.amount.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 p-4 md:hidden">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <User size={18} className="text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {payment.student.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Room {payment.student.roomNo} ·{" "}
                        {MONTHS[payment.month - 1]} {payment.year}
                      </p>
                      <p className="text-xs text-slate-400">
                        Paid on {formatDate(payment.datePaid)}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-slate-900">
                    Rs. {payment.amount.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}

            {payments.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  Showing {firstShown}–{lastShown} of {totalCount}{" "}
                  {totalCount === 1 ? "payment" : "payments"}
                </p>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    {page > 1 ? (
                      <Link
                        href={buildHref(page - 1)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                      >
                        <ChevronLeft size={14} />
                        Previous
                      </Link>
                    ) : (
                      <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-300">
                        <ChevronLeft size={14} />
                        Previous
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      Page {page} of {totalPages}
                    </span>
                    {page < totalPages ? (
                      <Link
                        href={buildHref(page + 1)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                      >
                        Next
                        <ChevronRight size={14} />
                      </Link>
                    ) : (
                      <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-300">
                        Next
                        <ChevronRight size={14} />
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
