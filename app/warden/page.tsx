import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { calculateRentStatus } from "@/lib/rent";
import { Plus, Search, User } from "lucide-react";
import Link from "next/link";
import LogoutButton from "../components/logOutBtn";

export default async function WardenPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "WARDEN") {
    redirect("/login");
  }

  const students = await prisma.student.findMany({
    orderBy: { name: "asc" },
    include: {
      payments: true,
      user: true,
    },
  });

  const studentsWithStatus = students.map((student) => ({
    ...student,
    rentStatus: calculateRentStatus(student, student.payments),
  }));

  const totalStudents = studentsWithStatus.length;

  const fullyPaidCount = studentsWithStatus.filter(
    (s) => s.rentStatus.status === "paid",
  ).length;

  const partialCount = studentsWithStatus.filter(
    (s) => s.rentStatus.status === "partial",
  ).length;

  const pendingCount = studentsWithStatus.filter(
    (s) => s.rentStatus.status === "pending",
  ).length;

  const pendingDuesCount = partialCount + pendingCount;

  const statusStyles: Record<string, string> = {
    paid: "bg-green-50 text-green-700",
    partial: "bg-amber-50 text-amber-700",
    pending: "bg-red-50 text-red-700",
    overpaid: "bg-blue-50 text-blue-700",
  };

  return (
    <main className="w-full min-h-screen bg-slate-50 flex flex-col gap-6 px-10 py-8">
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-xl font-semibold text-slate-900">
            River Boys Hostel
          </p>
          <p className="text-sm text-slate-500 mt-0.5">Warden dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/warden/new-student"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition"
          >
            <Plus size={16} />
            Add student
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1 bg-slate-100 rounded-xl p-4">
          <p className="text-xs text-slate-500">Total students</p>
          <p className="text-2xl font-semibold text-slate-900">
            {totalStudents}
          </p>
        </div>
        <div className="flex flex-col gap-1 bg-slate-100 rounded-xl p-4">
          <p className="text-xs text-slate-500">Fully paid</p>
          <p className="text-2xl font-semibold text-green-700">
            {fullyPaidCount}
          </p>
        </div>
        <div className="flex flex-col gap-1 bg-slate-100 rounded-xl p-4">
          <p className="text-xs text-slate-500">Pending dues</p>
          <p className="text-2xl font-semibold text-red-700">
            {pendingDuesCount}
          </p>
        </div>
      </div>

      <div className="flex gap-3 w-full max-w-xl">
        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 w-full">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or room"
            className="w-full py-2.5 outline-none text-sm bg-transparent"
          />
        </div>
        <select className="bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none">
          <option value="all">All students</option>
          <option value="paid">Fully paid</option>
          <option value="partial">Partial</option>
          <option value="pending">Unpaid</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-5 text-xs text-slate-500 px-5 py-3 bg-slate-50 border-b border-slate-200">
          <p>Name</p>
          <p>Room no.</p>
          <p>Rent</p>
          <p>Status</p>
          <p>Dues remaining</p>
        </div>

        {studentsWithStatus.length === 0 && (
          <p className="text-sm text-slate-400 px-5 py-6 text-center">
            No students added yet.
          </p>
        )}

        {studentsWithStatus.map((student) => (
          <Link
            key={student.id}
            href={`/warden/student/${student.id}`}
            className="grid grid-cols-5 items-center px-5 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <User size={16} className="text-slate-400" />
              </div>
              <span className="text-sm text-slate-800">{student.name}</span>
            </div>
            <p className="text-sm text-slate-600">{student.roomNo}</p>
            <p className="text-sm text-slate-600">
              Rs. {student.monthlyRent.toLocaleString()}
            </p>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full w-fit capitalize ${
                statusStyles[student.rentStatus.status]
              }`}
            >
              {student.rentStatus.status === "pending"
                ? "unpaid"
                : student.rentStatus.status}
            </span>
            <p className="text-sm text-slate-600">
              {student.rentStatus.remaining > 0
                ? `Rs. ${student.rentStatus.remaining.toLocaleString()}`
                : "—"}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
