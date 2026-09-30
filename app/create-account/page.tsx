"use client";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CreateAccount() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/creating-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        throw new Error("Failed to create account");
      }

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("");

      setError("Account created successfully");
    } catch (error) {
      setError("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md w-full">
        <header className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
            <UserPlus size={24} className="text-blue-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            Create New Account
          </h1>
          <p className="text-sm text-slate-500 mt-1">Join the network</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="[EMAIL_ADDRESS]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Create Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="">Choose your role...</option>
              <option value="student">Student</option>
              <option value="warden">Warden</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition disabled:opacity-60"
          >
            <UserPlus size={16} />
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 pt-6 border-t border-slate-100 text-xs text-center text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
