import { Plus } from "lucide-react";

export default function WardenPage() {
  return (
    <main className="w-full min-h-screen flex flex-col gap-6 px-10 py-5">
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-sm text-slate-600">River boys hostel</p>
          <p className="text-xl font-medium">warden dashboard</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-slate-50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
          <Plus />
          <p className="text-sm">add new student</p>
        </button>
      </div>
    </main>
  );
}
