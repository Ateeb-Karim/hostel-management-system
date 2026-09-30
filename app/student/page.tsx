import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { calculateRentStatus } from "@/lib/rent";
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
    },
  });

  if (!student) {
    redirect("/login");
  }

  const rentStatus = calculateRentStatus(student, student.payments);

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-10 flex justify-center">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-4 pb-5 border-b border-slate-100 mb-5">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
            <User size={28} className="text-slate-400" />
          </div>
          <div>
            <p className="font-medium text-base text-slate-900">
              {student.name}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              Room · ID {student.id}
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
              Rs. 8,000
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
        <div className="flex flex-col gap-1.5">
          {rentStatus.monthsElapsed.map((status) => (
            <div
              key={status.month}
              className={`flex justify-between items-center px-3 py-2.5 rounded-lg ${
                status.status === "paid"
                  ? "bg-green-500"
                  : status.status === "partial"
                    ? "bg-amber-500"
                    : "bg-slate-500"
              }`}
            >
              <span
                className={`text-sm ${
                  status.status === "paid"
                    ? "text-black"
                    : status.status === "partial"
                      ? "text-black"
                      : "text-black"
                }`}
              >
                {status.month}
              </span>
              <span
                className={`text-xs font-medium flex items-center gap-1 ${
                  status.status === "paid"
                    ? "text-black"
                    : status.status === "partial"
                      ? "text-black"
                      : "text-black"
                }`}
              >
                {status.status === "paid" && (
                  <>
                    <Check size={14} /> Paid
                  </>
                )}
                {status.status === "partial" && `Partial · ${status.month}`}
                {status.status === "unpaid" && "Unpaid"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
