import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EditStudentForm from "@/app/components/editStudentForm";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "WARDEN") {
    redirect("/login");
  }

  const { id } = await params;

  const student = await prisma.student.findUnique({ where: { id } });

  if (!student) {
    notFound();
  }

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-xl">
        <Link
          href={`/warden/student/${student.id}`}
          className="mb-5 flex w-fit items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Back to student
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h1 className="mb-5 text-lg font-semibold text-slate-900">
            Edit student
          </h1>
          <EditStudentForm
            student={{
              id: student.id,
              name: student.name,
              roomNo: student.roomNo,
              phone: student.phone,
              monthlyRent: student.monthlyRent,
            }}
          />
        </div>
      </div>
    </main>
  );
}
