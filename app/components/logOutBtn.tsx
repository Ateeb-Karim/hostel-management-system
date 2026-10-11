"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton({ role }: { role: "warden" | "student" }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: `/login/${role}` })}
      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 sm:flex-none"
    >
      <LogOut size={16} />
      Log out
    </button>
  );
}
