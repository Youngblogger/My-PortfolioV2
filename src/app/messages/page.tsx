"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, type ConversationData } from "@/lib/api";
import { formatDate } from "@/lib/utils";

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-600",
  in_progress: "bg-blue-500/10 text-blue-600",
  completed: "bg-[#ECEFF5]/50 text-[#667085]",
  on_hold: "bg-yellow-500/10 text-yellow-600",
  cancelled: "bg-red-500/10 text-red-600",
};

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getConversations();
      setConversations(res.data || []);
    } catch {
      setError("Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count || 0), 0);

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#101828]">Messages</h1>
          <p className="text-[#98A2B3] mt-1">
            {totalUnread > 0
              ? `${totalUnread} unread conversation${totalUnread !== 1 ? "s" : ""}`
              : "No unread messages"}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-xl p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#ECEFF5]/50 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#ECEFF5]/50 rounded w-48" />
                    <div className="h-3 bg-[#ECEFF5]/50 rounded w-64" />
                  </div>
                  <div className="h-3 bg-[#ECEFF5]/50 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
            <h3 className="text-lg font-bold text-[#101828] mb-2">Oops</h3>
            <p className="text-[#98A2B3] text-sm mb-6">{error}</p>
            <button
              onClick={load}
              className="px-6 py-3 rounded-xl bg-[#5B4CF0] text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(91,76,240,0.3)] hover:scale-[1.02] transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4" aria-hidden="true">💬</div>
            <h3 className="text-lg font-bold text-[#101828] mb-2">No Conversations Yet</h3>
            <p className="text-[#98A2B3] text-sm">Start a project and we&apos;ll connect you with your team.</p>
            <Link
              href="/hire"
              className="inline-block mt-6 px-6 py-3 rounded-xl bg-[#5B4CF0] text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(91,76,240,0.3)] hover:scale-[1.02] transition-all duration-300"
            >
              Start a Project
            </Link>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
            {conversations.map((conv) => (
              <motion.div key={conv.id} variants={fadeUp}>
                <Link
                  href={`/messages/${conv.id}`}
                  className="block bg-white shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-xl p-5 hover:border-[#5B4CF0]/20 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-lg ${
                      conv.project_status === "completed" ? "bg-green-500/10" : "bg-[#5B4CF0]/10"
                    }`}>
                      {conv.project_status === "completed" ? "✅" : "💬"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="font-semibold text-[#101828] truncate">{conv.project_name}</p>
                          {conv.unread_count > 0 && (
                            <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#5B4CF0] text-[10px] font-bold text-white">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                        {conv.last_message && (
                          <span className="shrink-0 text-[11px] text-[#98A2B3]/60">
                            {timeAgo(conv.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#98A2B3] mt-0.5">{conv.service} &mdash; {conv.project_type}</p>
                      {conv.last_message ? (
                        <p className="text-sm text-[#667085] mt-2 line-clamp-1">
                          {conv.last_message.has_attachments ? "📎 " : ""}
                          {conv.last_message.message || (conv.last_message.has_attachments ? "Sent an attachment" : "")}
                        </p>
                      ) : (
                        <p className="text-sm text-[#98A2B3] mt-2 italic">No messages yet</p>
                      )}
                    </div>
                    <span className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-medium ${
                      statusColors[conv.project_status || conv.status] || "bg-[#ECEFF5]/50 text-[#667085]"
                    }`}>
                      {(conv.project_status || conv.status || "").replace(/_/g, " ")}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
