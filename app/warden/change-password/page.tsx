import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ChangePasswordForm from "@/app/components/changePasswordForm";

export default async function ChangePasswordPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "WARDEN") {
    redirect("/login");
  }

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-md">
        <Link
          href="/warden"
          className="mb-5 flex w-fit items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-lg font-semibold text-slate-900">
            Change password
          </h1>
          <p className="mb-5 mt-1 text-sm text-slate-500">
            Update the password you use to sign in as warden.
          </p>
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  );
}
