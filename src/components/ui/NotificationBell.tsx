"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function fetchCount() {
      try {
        const res = await api.getUnreadNotificationCount();
        if (mounted && res.data) {
          setCount(res.data.count);
        }
      } catch {
        if (mounted) setCount(0);
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <button
      onClick={() => router.push("/notifications")}
      className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
      aria-label="Notifications"
    >
      <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
