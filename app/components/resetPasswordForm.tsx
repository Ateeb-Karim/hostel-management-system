"use client";

import { useState } from "react";
import { Eye, EyeOff, RefreshCw, Copy, Check, Loader2 } from "lucide-react";

const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generatePassword(length = 10) {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => ALPHABET[v % ALPHABET.length]).join("");
}

export default function ResetPasswordForm({
  studentId,
}: {
  studentId: string;
}) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedPassword, setSavedPassword] = useState("");
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    setPassword(generatePassword());
    setShow(true);
    setSavedPassword("");
    setError("");
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    setSavedPassword("");
    setCopied(false);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/students/${studentId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Failed to reset password");
        setLoading(false);
        return;
      }

      setSavedPassword(password);
      setPassword("");
      setShow(false);
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(savedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy. Please copy it manually.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setSavedPassword("");
            }}
            placeholder="New password (min. 8 characters)"
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-10 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-200"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:text-slate-700"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:flex-none"
          >
            <RefreshCw size={14} />
            Generate
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Saving..." : "Reset password"}
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {savedPassword && (
        <div className="flex flex-col gap-2 rounded-lg border border-green-200 bg-green-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-green-800">
              Password updated
            </p>
            <p className="mt-0.5 break-all text-sm text-green-700">
              New password:{" "}
              <span className="font-mono font-semibold">{savedPassword}</span>
            </p>
            <p className="mt-0.5 text-xs text-green-700/80">
              Share it with the student now. It can&apos;t be shown again after
              you leave this page.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-green-300 bg-white px-3 py-1.5 text-sm font-medium text-green-700 transition hover:bg-green-100"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
