import { Building2, ShieldCheck, GraduationCap, UserPlus } from "lucide-react";

export default function Home() {
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
          <p className="text-sm text-slate-500 mt-1">Rent records portal</p>
        </header>

        <div className="mb-8 space-y-1">
          <p className="text-base text-center font-medium text-slate-800">
            Rent records, without the paper register
          </p>
          <p className="text-slate-500 text-sm text-center leading-relaxed">
            The warden updates payments in seconds, and students can check their
            rent status anytime.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
            <ShieldCheck size={16} />
            Login as Warden
          </button>
          <button className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 text-sm font-medium px-4 py-2.5 rounded-lg border border-slate-300 transition">
            <GraduationCap size={16} />
            Login as Student
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-2">
          <p className="text-sm text-slate-500">New student?</p>
          <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition">
            <UserPlus size={14} />
            Register
          </button>
        </div>
      </div>
    </main>
  );
}
