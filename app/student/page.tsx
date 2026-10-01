import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { calculateRentStatus, getMonthlyBreakdown } from "@/lib/rent";
import { AlertCircle, Check, User } from "lucide-react";

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
      user: true,
    },
  });

  if (!student) {
    redirect("/login");
  }

  const rentStatus = calculateRentStatus(student, student.payments);
  const monthlyBreakdown = getMonthlyBreakdown(student, student.payments);

  return (
    <main className="h-screen w-full bg-slate-50 px-4 py-10 flex justify-center overflow-hidden">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
        <div className="flex items-center gap-4 pb-5 border-b border-slate-100 mb-5">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
            <User size={28} className="text-slate-400" />
          </div>
          <div>
            <p className="font-medium text-base text-slate-900">
              {student.name}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              Room {student.roomNo} · {student.user.loginId}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xs text-slate-400">Renting since</p>
            <p className="text-sm font-medium text-slate-800 mt-0.5">
              {student.joinDate.toDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Monthly rent</p>
            <p className="text-sm font-medium text-slate-800 mt-0.5">
              Rs. {student.monthlyRent}
            </p>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg px-4 py-3 flex justify-between items-center mb-5">
          <div>
            <p className="text-xs text-red-600">Remaining balance</p>
            <p className="text-xl font-medium text-red-600 mt-0.5">
              Rs. {rentStatus.remaining}
            </p>
          </div>
          <AlertCircle size={22} className="text-red-600" />
        </div>

        <p className="text-sm font-medium text-slate-600 mb-2.5">
          Month-by-month status
        </p>
        <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 pr-1 min-h-50">
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
                className={`text-xs font-medium flex items-center gap-1 ${
                  row.status === "paid"
                    ? "text-green-700"
                    : row.status === "partial"
                      ? "text-amber-700"
                      : "text-slate-400"
                }`}
              >
                {row.status === "paid" && (
                  <>
                    <Check size={14} /> Paid
                  </>
                )}
                {row.status === "partial" &&
                  `Partial · Rs. ${row.paidAmount} of ${row.dueAmount}`}
                {row.status === "unpaid" && "Unpaid"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
