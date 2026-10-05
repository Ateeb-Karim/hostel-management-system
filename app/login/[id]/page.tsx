"use client";

import {
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import { JSX, use, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";

export default function Login({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const role = use(params).id;

  const [loginId, setLoginId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const router = useRouter();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const response = await signIn("credentials", {
      loginId,
      password,
      role,
      redirect: false,
    });

    if (response?.error) {
      setLoading(false);
      setError("Invalid login ID or password");
      return;
    }

    const session = await getSession();
    setLoading(false);

    if (session?.user?.role === "WARDEN") {
      router.push("/warden");
    } else {
      router.push("/student");
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <header className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
            <Building2 size={24} className="text-blue-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            River Boys Hostel
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {role === "warden" ? "Warden sign in" : "Student sign in"}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Login ID
            </label>
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black outline-none transition-all focus:ring-2 focus:ring-slate-900"
              placeholder={
                role === "warden" ? "Enter warden ID" : "Enter student ID"
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm text-black outline-none transition-all focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Sign in
              </>
            )}
          </button>
        </form>

        <div className="flex gap-2 w-full mt-5">
          <Link
            href="/login/warden"
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            <ShieldCheck size={16} />
            Login as Warden
          </Link>

          <Link
            href="/login/student"
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            <GraduationCap size={16} />
            Login as Student
          </Link>
        </div>

        <p className="mt-6 pt-6 border-t border-slate-100 text-xs text-center text-slate-400">
          Don't have a login? Contact the warden.
        </p>
      </div>
    </main>
  );
}
