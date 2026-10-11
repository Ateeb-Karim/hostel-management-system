import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { calculateRentStatus, getMonthlyBreakdown } from "@/lib/rent";
import { ArrowLeft, User, Phone, CalendarDays, Wallet } from "lucide-react";
import AddPaymentForm from "@/app/components/addPaymentForm";
import Link from "next/link";
import DeleteStudentButton from "@/app/components/deleteStudentBtn";

const statusBadge: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  partial: "bg-amber-100 text-amber-700",
  pending: "bg-red-100 text-red-700",
  overpaid: "bg-blue-100 text-blue-700",
};

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
      user: true,
    },
  });

  if (!student) {
    notFound();
  }

  const rentStatus = calculateRentStatus(student, student.payments);
  const monthlyBreakdown = getMonthlyBreakdown(student, student.payments);

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

        <div className="flex flex-col gap-6">
          {/* Header card */}
          <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <User size={28} className="text-slate-400" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-lg font-semibold text-slate-900">
                    {student.name}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      statusBadge[rentStatus.status] ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {rentStatus.status}
                  </span>
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

            <div className="border-t border-slate-100 pt-4 sm:border-0 sm:pt-0 sm:text-right">
              <p className="text-xs text-slate-400">Remaining</p>
              <p
                className={`text-2xl font-semibold ${
                  rentStatus.remaining > 0 ? "text-red-600" : "text-green-700"
                }`}
              >
                Rs. {rentStatus.remaining.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <Wallet size={13} />
                Monthly rent
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                Rs. {student.monthlyRent.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <Wallet size={13} />
                Total paid
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                Rs. {rentStatus.totalPaid.toLocaleString()}
                <span className="text-sm font-normal text-slate-400">
                  {" "}
                  / {rentStatus.totalDue.toLocaleString()}
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <CalendarDays size={13} />
                Joined
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {student.joinDate.toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Month-by-month */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="mb-3 text-sm font-medium text-slate-600">
                Month-by-month status
              </p>
              <div className="flex max-h-96 flex-col gap-1.5 overflow-y-auto pr-1">
                {monthlyBreakdown.length === 0 && (
                  <p className="text-sm text-slate-400">
                    No months to show yet.
                  </p>
                )}
                {monthlyBreakdown.map((row) => (
                  <div
                    key={`${row.year}-${row.monthNum}`}
                    className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg px-3 py-2.5 ${
                      row.status === "paid"
                        ? "bg-green-50"
                        : row.status === "partial"
                          ? "bg-amber-50"
                          : "bg-slate-50"
                    }`}
                  >
                    <span
                      className={`text-sm ${
                        row.status === "paid"
                          ? "text-green-700"
                          : row.status === "partial"
                            ? "text-amber-700"
                            : "text-slate-500"
                      }`}
                    >
                      {row.month}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        row.status === "paid"
                          ? "text-green-700"
                          : row.status === "partial"
                            ? "text-amber-700"
                            : "text-slate-400"
                      }`}
                    >
                      {row.status === "paid" && "Paid"}
                      {row.status === "partial" &&
                        `Partial · Rs. ${row.paidAmount} of ${row.dueAmount}`}
                      {row.status === "unpaid" && "Unpaid"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="mb-3 text-sm font-medium text-slate-600">
                  Add payment
                </p>
                <AddPaymentForm studentId={student.id} />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="mb-3 text-sm font-medium text-slate-600">
                  Payment history
                </p>
                <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1">
                  {student.payments.length === 0 && (
                    <p className="text-sm text-slate-400">
                      No payments recorded yet.
                    </p>
                  )}
                  {student.payments.map((payment) => {
                    const monthName = new Date(
                      2000,
                      payment.month - 1,
                    ).toLocaleString("en-US", { month: "long" });

                    return (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-slate-700">
                            For {monthName} {payment.year}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            Paid on{" "}
                            {payment.datePaid.toLocaleDateString("en-GB")}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-medium text-slate-800">
                          Rs. {payment.amount.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="flex flex-col gap-4 rounded-xl border border-red-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
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
