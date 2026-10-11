import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { calculateRentStatus } from "@/lib/rent";
import {
  Plus,
  User,
  Users,
  BadgeCheck,
  Clock,
  Wallet,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import LogoutButton from "../components/logOutBtn";
import StudentSearchBar from "../components/studentSearchBar";

const statusStyles: Record<string, string> = {
  paid: "bg-green-50 text-green-700",
  partial: "bg-amber-50 text-amber-700",
  pending: "bg-red-50 text-red-700",
  overpaid: "bg-blue-50 text-blue-700",
};

function statusLabel(status: string) {
  return status === "pending" ? "unpaid" : status;
}

export default async function WardenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "WARDEN") {
    redirect("/login");
  }

  const { q, status } = await searchParams;

  const students = await prisma.student.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { roomNo: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
    include: {
      payments: true,
    },
  });

  const allWithStatus = students.map((student) => ({
    ...student,
    rentStatus: calculateRentStatus(student, student.payments),
  }));

  const studentsWithStatus = allWithStatus.filter((student) =>
    status && status !== "all" ? student.rentStatus.status === status : true,
  );

  const totalStudents = allWithStatus.length;
  const fullyPaidCount = allWithStatus.filter(
    (s) => s.rentStatus.status === "paid",
  ).length;
  const pendingDuesCount = allWithStatus.filter(
    (s) =>
      s.rentStatus.status === "partial" || s.rentStatus.status === "pending",
  ).length;
  const totalOutstanding = allWithStatus.reduce(
    (sum, s) => sum + (s.rentStatus.remaining > 0 ? s.rentStatus.remaining : 0),
    0,
  );

  const hasFilters = Boolean(q) || (Boolean(status) && status !== "all");

  const stats = [
    {
      label: "Total students",
      value: totalStudents.toLocaleString(),
      color: "text-slate-900",
      icon: Users,
    },
    {
      label: "Fully paid",
      value: fullyPaidCount.toLocaleString(),
      color: "text-green-700",
      icon: BadgeCheck,
    },
    {
      label: "Pending dues",
      value: pendingDuesCount.toLocaleString(),
      color: "text-red-700",
      icon: Clock,
    },
    {
      label: "Total outstanding",
      value: `Rs. ${totalOutstanding.toLocaleString()}`,
      color: "text-red-700",
      icon: Wallet,
    },
  ];

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <p className="text-xl font-semibold text-slate-900">
              River Boys Hostel
            </p>
            <p className="mt-0.5 text-sm text-slate-500">Warden dashboard</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/warden/payments"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:flex-none"
            >
              <Receipt size={16} />
              Payments
            </Link>
            <Link
              href="/warden/new-student"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 sm:flex-none"
            >
              <Plus size={16} />
              Add student
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <stat.icon size={13} />
                {stat.label}
              </p>
              <p
                className={`wrap-break-word text-xl font-semibold sm:text-2xl ${stat.color}`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <StudentSearchBar />

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-5 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-500 md:grid">
            <p>Name</p>
            <p>Room no.</p>
            <p>Rent</p>
            <p>Status</p>
            <p>Dues remaining</p>
          </div>

          {studentsWithStatus.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Users size={22} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">
                {hasFilters
                  ? "No students match your search or filter."
                  : "No students yet. Add your first student to get started."}
              </p>
              {!hasFilters && (
                <Link
                  href="/warden/new-student"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <Plus size={16} />
                  Add student
                </Link>
              )}
            </div>
          )}

          {studentsWithStatus.map((student) => (
            <Link
              key={student.id}
              href={`/warden/student/${student.id}`}
              className="block border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
            >
              <div className="hidden grid-cols-5 items-center gap-4 px-5 py-3 md:grid">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <User size={16} className="text-slate-400" />
                  </div>
                  <span className="truncate text-sm text-slate-800">
                    {student.name}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{student.roomNo}</p>
                <p className="text-sm text-slate-600">
                  Rs. {student.monthlyRent.toLocaleString()}
                </p>
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                    statusStyles[student.rentStatus.status] ??
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {statusLabel(student.rentStatus.status)}
                </span>
                <p
                  className={`text-sm ${
                    student.rentStatus.remaining > 0
                      ? "font-medium text-red-600"
                      : "text-slate-400"
                  }`}
                >
                  {student.rentStatus.remaining > 0
                    ? `Rs. ${student.rentStatus.remaining.toLocaleString()}`
                    : "—"}
                </p>
              </div>

              <div className="flex flex-col gap-3 p-4 md:hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <User size={18} className="text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Room {student.roomNo}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      statusStyles[student.rentStatus.status] ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {statusLabel(student.rentStatus.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                  <div>
                    <p className="text-xs text-slate-400">Rent</p>
                    <p className="text-sm text-slate-700">
                      Rs. {student.monthlyRent.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Dues remaining</p>
                    <p
                      className={`text-sm ${
                        student.rentStatus.remaining > 0
                          ? "font-medium text-red-600"
                          : "text-slate-400"
                      }`}
                    >
                      {student.rentStatus.remaining > 0
                        ? `Rs. ${student.rentStatus.remaining.toLocaleString()}`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {studentsWithStatus.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-2.5 text-xs text-slate-400">
              Showing {studentsWithStatus.length} of {totalStudents}{" "}
              {totalStudents === 1 ? "student" : "students"}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
