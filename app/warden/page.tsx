import { Plus, Search, User } from "lucide-react";

export default function WardenPage() {
  const students = [
    {
      name: "Ali Raza",
      roomNo: "12",
      rent: 8000,
      status: "partial",
      duesRemaining: 3000,
    },
    {
      name: "Hassan Khan",
      roomNo: "7",
      rent: 7500,
      status: "paid",
      duesRemaining: 0,
    },
    {
      name: "Bilal Ahmed",
      roomNo: "3",
      rent: 8000,
      status: "unpaid",
      duesRemaining: 8000,
    },
  ];

  const statusStyles = {
    paid: "bg-green-50 text-green-700",
    partial: "bg-amber-50 text-amber-700",
    unpaid: "bg-red-50 text-red-700",
  };

  return (
    <main className="w-full min-h-screen bg-slate-50 flex flex-col gap-6 px-10 py-8">
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-xl font-semibold text-slate-900">
            River Boys Hostel
          </p>
          <p className="text-sm text-slate-500 mt-0.5">Warden dashboard</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition">
          <Plus size={16} />
          Add student
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1 bg-slate-100 rounded-xl p-4">
          <p className="text-xs text-slate-500">Total students</p>
          <p className="text-2xl font-semibold text-slate-900">60</p>
        </div>
        <div className="flex flex-col gap-1 bg-slate-100 rounded-xl p-4">
          <p className="text-xs text-slate-500">Fully paid</p>
          <p className="text-2xl font-semibold text-green-700">42</p>
        </div>
        <div className="flex flex-col gap-1 bg-slate-100 rounded-xl p-4">
          <p className="text-xs text-slate-500">Pending dues</p>
          <p className="text-2xl font-semibold text-red-700">18</p>
        </div>
      </div>
      <div className="flex gap-3 w-full max-w-xl">
        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 w-full">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or room"
            className="w-full py-2.5 outline-none text-sm bg-transparent"
          />
        </div>
        <select className="bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none">
          <option value="all">All students</option>
          <option value="paid">Fully paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-5 text-xs text-slate-500 px-5 py-3 bg-slate-50 border-b border-slate-200">
          <p>Name</p>
          <p>Room no.</p>
          <p>Rent</p>
          <p>Status</p>
          <p>Dues remaining</p>
        </div>
        {students.map((student) => (
          <div
            key={student.name}
            className="grid grid-cols-5 items-center px-5 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <User size={16} className="text-slate-400" />
              </div>
              <span className="text-sm text-slate-800">{student.name}</span>
            </div>
            <p className="text-sm text-slate-600">{student.roomNo}</p>
            <p className="text-sm text-slate-600">
              Rs. {student.rent.toLocaleString()}
            </p>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full w-fit capitalize ${statusStyles[student.status as keyof typeof statusStyles]}`}
            >
              {student.status}
            </span>
            <p className="text-sm text-slate-600">
              {student.duesRemaining > 0
                ? `Rs. ${student.duesRemaining.toLocaleString()}`
                : "—"}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
