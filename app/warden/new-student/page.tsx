"use client";

import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

function makeLoginId(name: string, roomNo: string) {
  const firstName = name.trim().split(" ")[0]?.toLowerCase() || "";
  const room = roomNo.trim().toLowerCase();
  return firstName && room ? `${firstName}-room${room}` : "";
}

export default function AddStudentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [loginIdManuallyEdited, setLoginIdManuallyEdited] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roomNo, setRoomNo] = useState("");
  const [phone, setPhone] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNameOrRoomChange = (newName: string, newRoom: string) => {
    if (!loginIdManuallyEdited) {
      setLoginId(makeLoginId(newName, newRoom));
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          loginId,
          password,
          roomNo,
          phone,
          monthlyRent: Number(monthlyRent),
          joinDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add student");
      }

      setSuccess("Student added successfully");
      setTimeout(() => router.push("/warden"), 1000);
    } catch (err: any) {
      setError(err.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <header className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
            <UserPlus size={24} className="text-blue-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            Add New Student
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create a login for a new student
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                handleNameOrRoomChange(e.target.value, roomNo);
              }}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="enter name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Room No.
              </label>
              <input
                type="text"
                value={roomNo}
                onChange={(e) => {
                  setRoomNo(e.target.value);
                  handleNameOrRoomChange(name, e.target.value);
                }}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="e.g: 12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="03001234567"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Monthly Rent
              </label>
              <input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="8000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Join Date
              </label>
              <input
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-1 mt-2">
              Login ID
            </label>
            <input
              type="text"
              value={loginId}
              onChange={(e) => {
                setLoginId(e.target.value);
                setLoginIdManuallyEdited(true);
              }}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="auto-generated as you type"
            />
            <p className="text-xs text-slate-400 mt-1">
              Auto-filled from name and room — edit if needed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Temporary Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm text-black outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="••••••••"
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
          {success && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition disabled:opacity-60"
          >
            <UserPlus size={16} />
            {loading ? "Adding student..." : "Add Student"}
          </button>
        </form>
      </div>
    </main>
  );
}
