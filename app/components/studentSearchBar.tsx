"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function StudentSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      router.push(`/warden?${params.toString()}`);
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    router.push(`/warden?${params.toString()}`);
  };

  return (
    <div className="flex gap-3 w-full max-w-xl">
      <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 w-full">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or room"
          className="w-full text-black py-2.5 outline-none text-sm bg-transparent"
        />
      </div>
      <select
        defaultValue={searchParams.get("status") || "all"}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none"
      >
        <option value="all">All students</option>
        <option value="paid">Fully paid</option>
        <option value="partial">Partial</option>
        <option value="pending">Unpaid</option>
      </select>
    </div>
  );
}
