"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

interface AdminConv {
  id: string;
  order_number: string;
  project_name: string;
  client_name: string;
  service: string;
  project_status: string;
  last_message: string;
  unread_count: number;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<AdminConv[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/admin/conversations", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setConversations(data.data || []);
      } else {
        setError(data.error || "Failed to load");
      }
    } catch {
      setError("Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-sm text-[#98A2B3] mt-1">Reply to client messages across all projects.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-48" />
                  <div className="h-3 bg-gray-100 rounded w-64" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button onClick={load} className="px-6 py-2 rounded-lg portal-primary-bg text-[#101828] font-semibold text-sm hover:shadow-gold transition-all">
            Retry
          </button>
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-bold text-[#101828] mb-2">No Conversations</h3>
          <p className="text-[#98A2B3] text-sm">Client messages will appear here once projects start.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/admin/messages/${conv.id}`}
              className="block bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-all duration-200 border border-transparent hover:border-[#5B4CF0]/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#5B4CF0]/20 flex items-center justify-center text-[#5B4CF0] font-bold shrink-0">
                  {conv.client_name?.charAt(0)?.toUpperCase() || "C"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-[#101828] text-sm truncate">{conv.project_name}</span>
                      {conv.unread_count > 0 && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#5B4CF0] text-[10px] font-bold text-white">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-[11px] text-[#98A2B3]">{timeAgo(conv.created_at)}</span>
                  </div>
                  <p className="text-xs text-[#98A2B3] mt-0.5">{conv.client_name} &middot; {conv.service}</p>
                  {conv.last_message && (
                    <p className="text-sm text-[#667085] mt-1.5 line-clamp-1">{conv.last_message}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
