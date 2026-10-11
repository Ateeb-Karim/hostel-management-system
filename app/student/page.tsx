import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { calculateRentStatus, getMonthlyBreakdown } from "@/lib/rent";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  Check,
  Wallet,
} from "lucide-react";
import LogoutButton from "../components/logOutBtn";

const statusStyles: Record<string, string> = {
  paid: "bg-green-50 text-green-700",
  partial: "bg-amber-50 text-amber-700",
  pending: "bg-red-50 text-red-700",
  overpaid: "bg-blue-50 text-blue-700",
};

const rowStyle: Record<string, { bg: string; text: string; dot: string }> = {
  paid: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  partial: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  unpaid: { bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-300" },
};

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export default async function StudentPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "STUDENT") {
    redirect("/login");
  }

  const student = await prisma.student.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      payments: true,
      user: { select: { loginId: true } },
    },
  });

  if (!student) {
    redirect("/login");
  }

  const rentStatus = calculateRentStatus(student, student.payments);
  const monthlyBreakdown = getMonthlyBreakdown(student, student.payments);

  const hasDues = rentStatus.remaining > 0;

  const progress =
    rentStatus.totalDue > 0
      ? Math.min(
          100,
          Math.round((rentStatus.totalPaid / rentStatus.totalDue) * 100),
        )
      : 0;

  const paidMonths = monthlyBreakdown.filter((r) => r.status === "paid").length;
  const partialMonths = monthlyBreakdown.filter(
    (r) => r.status === "partial",
  ).length;
  const unpaidMonths = monthlyBreakdown.filter(
    (r) => r.status === "unpaid",
  ).length;

  const statusLabel =
    rentStatus.status === "pending" ? "unpaid" : rentStatus.status;

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 sm:gap-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xl font-semibold text-slate-900">
            River Boys Hostel
          </p>
          <LogoutButton role="student" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600">
              {getInitials(student.name)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="wrap-break-word text-base font-semibold text-slate-900">
                  {student.name}
                </p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    statusStyles[rentStatus.status] ??
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="mt-0.5 wrap-break-word text-sm text-slate-500">
                Room {student.roomNo} · {student.user.loginId}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <CalendarDays size={13} />
                Renting since
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {student.joinDate.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <Wallet size={13} />
                Monthly rent
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                Rs. {student.monthlyRent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${
            hasDues
              ? "border-red-100 bg-red-50"
              : "border-green-100 bg-green-50"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p
                className={`text-xs font-medium ${
                  hasDues ? "text-red-600" : "text-green-700"
                }`}
              >
                {hasDues ? "Remaining balance" : "Rent status"}
              </p>
              <p
                className={`mt-1 wrap-break-word text-2xl font-semibold ${
                  hasDues ? "text-red-600" : "text-green-700"
                }`}
              >
                {hasDues
                  ? `Rs. ${rentStatus.remaining.toLocaleString()}`
                  : "All paid up"}
              </p>
              {!hasDues && (
                <p className="mt-0.5 text-sm text-green-700/80">
                  {rentStatus.status === "overpaid"
                    ? "You've paid ahead of what's due."
                    : "You have no dues remaining."}
                </p>
              )}
            </div>
            {hasDues ? (
              <AlertCircle size={28} className="shrink-0 text-red-500" />
            ) : (
              <BadgeCheck size={28} className="shrink-0 text-green-600" />
            )}
          </div>

          {rentStatus.totalDue > 0 && (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Rs.{" "}
                  {Math.min(
                    rentStatus.totalPaid,
                    rentStatus.totalDue,
                  ).toLocaleString()}{" "}
                  of Rs. {rentStatus.totalDue.toLocaleString()} paid
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/70">
                <div
                  className={`h-full rounded-full ${
                    progress >= 100 ? "bg-green-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <p className="text-sm font-medium text-slate-600">
              Month-by-month status
            </p>
            {monthlyBreakdown.length > 0 && (
              <p className="text-xs text-slate-400">
                {paidMonths} paid
                {partialMonths > 0 && ` · ${partialMonths} partial`}
                {unpaidMonths > 0 && ` · ${unpaidMonths} unpaid`}
              </p>
            )}
          </div>

          <div className="flex max-h-96 flex-col gap-1.5 overflow-y-auto pr-1">
            {monthlyBreakdown.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">
                No months to show yet.
              </p>
            )}
            {monthlyBreakdown.map((row) => {
              const style = rowStyle[row.status] ?? rowStyle.unpaid;
              return (
                <div
                  key={`${row.year}-${row.monthNum}`}
                  className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg px-3 py-2.5 ${style.bg}`}
                >
                  <span
                    className={`flex items-center gap-2 text-sm ${style.text}`}
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`}
                    />
                    {row.month}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-xs font-medium ${style.text}`}
                  >
                    {row.status === "paid" && (
                      <>
                        <Check size={14} /> Paid
                      </>
                    )}
                    {row.status === "partial" &&
                      `Partial · Rs. ${row.paidAmount.toLocaleString()} of ${row.dueAmount.toLocaleString()}`}
                    {row.status === "unpaid" && "Unpaid"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
