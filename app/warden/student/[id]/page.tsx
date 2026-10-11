import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { calculateRentStatus, getMonthlyBreakdown } from "@/lib/rent";
import {
  ArrowLeft,
  Phone,
  CalendarDays,
  Wallet,
  Pencil,
  Receipt,
  Info,
} from "lucide-react";
import AddPaymentForm from "@/app/components/addPaymentForm";
import PaymentHistory from "@/app/components/paymentHistory";
import Link from "next/link";
import DeleteStudentButton from "@/app/components/deleteStudentBtn";
import ResetPasswordForm from "@/app/components/resetPasswordForm";
import MarkAsLeftButton from "@/app/components/markAsLeftButton";

const statusBadge: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  partial: "bg-amber-100 text-amber-700",
  pending: "bg-red-100 text-red-700",
  overpaid: "bg-blue-100 text-blue-700",
};

const rowStyle: Record<string, { bg: string; text: string; dot: string }> = {
  paid: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  partial: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  unpaid: { bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-300" },
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

function formatDate(date: Date) {
  const [y, m, d] = date.toISOString().slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

function monthYear(date: Date) {
  const [y, m] = date.toISOString().slice(0, 10).split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

function statusLabel(status: string) {
  return status === "pending" ? "unpaid" : status;
}

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

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "WARDEN") {
    redirect("/login");
  }

  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      payments: {
        orderBy: { datePaid: "desc" },
      },
      user: { select: { loginId: true } },
    },
  });

  if (!student) {
    notFound();
  }

  const rentStatus = calculateRentStatus(student, student.payments);
  const monthlyBreakdown = getMonthlyBreakdown(student, student.payments);

  const hasLeft = Boolean(student.leaveDate);

  const progress =
    rentStatus.totalDue > 0
      ? Math.min(
          100,
          Math.round((rentStatus.totalPaid / rentStatus.totalDue) * 100),
        )
      : 0;

  const paidMonths = monthlyBreakdown.filter((r) => r.status === "paid").length;

  const paymentsForClient = student.payments.map((p) => ({
    id: p.id,
    amount: p.amount,
    month: p.month,
    year: p.year,
    datePaid: p.datePaid.toISOString(),
  }));

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/warden"
          className="mb-5 flex w-fit items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="flex flex-col gap-5 sm:gap-6">
          {/* Header card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600">
                  {getInitials(student.name)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="wrap-break-word text-lg font-semibold text-slate-900">
                      {student.name}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        statusBadge[rentStatus.status] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {statusLabel(rentStatus.status)}
                    </span>
                    {hasLeft && (
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        Left
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 wrap-break-word text-sm text-slate-500">
                    Room {student.roomNo} · {student.user.loginId}
                  </p>
                  {student.phone && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                      <Phone size={13} />
                      {student.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 sm:items-end sm:border-0 sm:pt-0">
                <div className="sm:text-right">
                  <p className="text-xs text-slate-400">Remaining</p>
                  <p
                    className={`text-2xl font-semibold ${
                      rentStatus.remaining > 0
                        ? "text-red-600"
                        : "text-green-700"
                    }`}
                  >
                    Rs. {rentStatus.remaining.toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/warden/student/${student.id}/edit`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 sm:flex-none"
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>
                  <MarkAsLeftButton
                    studentId={student.id}
                    studentName={student.name}
                    joinDate={student.joinDate.toISOString()}
                    leaveDate={
                      student.leaveDate ? student.leaveDate.toISOString() : null
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs text-slate-400">
                <span>Rent paid</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    progress >= 100 ? "bg-green-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {hasLeft && student.leaveDate && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <Info size={18} className="mt-0.5 shrink-0" />
              <p>
                <span className="font-medium">
                  Left on {formatDate(student.leaveDate)}.
                </span>{" "}
                Rent, dues and the month list stop after{" "}
                {monthYear(student.leaveDate)}. Payments can still be recorded
                so any remaining dues can be settled.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <Wallet size={13} />
                Monthly rent
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                Rs. {student.monthlyRent.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <Receipt size={13} />
                Total paid
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                Rs. {rentStatus.totalPaid.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">
                of Rs. {rentStatus.totalDue.toLocaleString()} due
              </p>
            </div>
            <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-1">
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <CalendarDays size={13} />
                Joined
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {formatDate(student.joinDate)}
              </p>
              {hasLeft && student.leaveDate && (
                <p className="text-xs text-slate-400">
                  Left {formatDate(student.leaveDate)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <p className="text-sm font-medium text-slate-600">
                  Month-by-month status
                </p>
                <span className="text-xs text-slate-400">
                  {paidMonths} of {monthlyBreakdown.length} paid
                </span>
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
                      <span className={`text-xs font-medium ${style.text}`}>
                        {row.status === "paid" && "Paid"}
                        {row.status === "partial" &&
                          `Partial · Rs. ${row.paidAmount.toLocaleString()} of ${row.dueAmount.toLocaleString()}`}
                        {row.status === "unpaid" && "Unpaid"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-3 text-sm font-medium text-slate-600">
                  Add payment
                </p>
                <AddPaymentForm studentId={student.id} />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">
                    Payment history
                  </p>
                  <span className="text-xs text-slate-400">
                    {student.payments.length}{" "}
                    {student.payments.length === 1 ? "payment" : "payments"}
                  </span>
                </div>
                <PaymentHistory payments={paymentsForClient} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Reset password</p>
            <p className="mb-4 mt-0.5 text-sm text-slate-500">
              Set a new password for{" "}
              <span className="font-medium text-slate-700">
                {student.user.loginId}
              </span>
              . Students can&apos;t change it themselves, so share the new one
              with them.
            </p>
            <ResetPasswordForm studentId={student.id} />
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-red-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Danger zone</p>
              <p className="mt-0.5 text-sm text-slate-500">
                Permanently deletes this student, their login account and all
                their payment records.
              </p>
            </div>
            <DeleteStudentButton
              studentId={student.id}
              studentName={student.name}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
