import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { calculateRentStatus, getMonthlyBreakdown } from "@/lib/rent";
import { ArrowLeft, User } from "lucide-react";
import AddPaymentForm from "@/app/components/addPaymentForm";
import Link from "next/link";

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
    <main className="w-full min-h-screen bg-slate-50 px-10 py-8">
      <Link
        href="/warden"
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition w-fit mb-5"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-6">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
            <User size={28} className="text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-slate-900">
              {student.name}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              Room {student.roomNo} · {student.user.loginId}
              {student.phone ? ` · ${student.phone}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Remaining</p>
            <p
              className={`text-xl font-semibold ${
                rentStatus.remaining > 0 ? "text-red-600" : "text-green-700"
              }`}
            >
              Rs. {rentStatus.remaining.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-sm font-medium text-slate-600 mb-3">
              Month-by-month status
            </p>
            <div className="flex flex-col gap-1.5 max-h-100 overflow-y-auto pr-1">
              {monthlyBreakdown.map((row) => (
                <div
                  key={`${row.year}-${row.monthNum}`}
                  className={`flex justify-between items-center px-3 py-2.5 rounded-lg ${
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

          <div className="flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-sm font-medium text-slate-600 mb-3">
                Add payment
              </p>
              <AddPaymentForm studentId={student.id} />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-sm font-medium text-slate-600 mb-3">
                Payment history
              </p>
              <div className="flex flex-col gap-1.5 max-h-55 overflow-y-auto pr-1">
                {student.payments.length === 0 && (
                  <p className="text-sm text-slate-400">
                    No payments recorded yet.
                  </p>
                )}
                {student.payments.map((payment) => {
                  const monthName = new Date(
                    2000,
                    payment.month - 1,
                  ).toLocaleString("default", { month: "long" });

                  return (
                    <div
                      key={payment.id}
                      className="flex justify-between items-center px-3 py-2 rounded-lg bg-slate-50"
                    >
                      <div>
                        <p className="text-sm text-slate-700">
                          For {monthName} {payment.year}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Paid on {payment.datePaid.toLocaleDateString("en-GB")}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-slate-800">
                        Rs. {payment.amount.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
