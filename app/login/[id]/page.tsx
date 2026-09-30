"use client";

import { Building2, LogIn } from "lucide-react";
import { JSX, use, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

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
  const router = useRouter();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const response = await signIn("Credentials", {
      loginId,
      password,
      role,
      redirect: false,
    });

    setLoading(false);

    if (response?.error) {
      setError(response?.error || "Invalid credentials");
    } else {
      if (role === "warden") router.push(`/dashboard/${role}`);
      if (role === "student") router.push(`/dashboard/${role}`);
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
          <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-black"
              placeholder={
                role === "warden" ? "Enter warden ID" : "Enter student ID"
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-black"
              placeholder="••••••••"
            />
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
            <LogIn size={16} />
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 pt-6 border-t border-slate-100 text-xs text-center text-slate-400">
          Don't have a login? Contact the warden.
        </p>
      </div>
    </main>
  );
}
