"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api, type NotificationData } from "@/lib/api";

const ICONS: Record<string, string> = {
  proposal_created: "\uD83D\uDCC4",
  status_changed: "\uD83D\uDD04",
  team_assigned: "\uD83D\uDC64",
  payment_received: "\uD83D\uDCB0",
  message_received: "\uD83D\uDCAC",
  order_created: "\uD83D\uDCCB",
  meeting_scheduled: "\uD83D\uDCC5",
  file_uploaded: "\uD83D\uDCC1",
  new_discussion_message: "\uD83D\uDCAC",
  milestone_review_requested: "\uD83D\uDCDD",
  milestone_changes_requested: "\uD83D\uDD04",
  milestone_review_approved: "\u2705",
  delivery_available: "\uD83D\uDCE6",
  project_completed: "\uD83C\uDF89",
  review_submitted: "\u2B50",
  milestone_completed: "\u2705",
  milestone_delayed: "\u23F0",
  milestone_blocked: "\u26D4",
};

function getIcon(type: string): string {
  return ICONS[type] || "\uD83D\uDD14";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await api.getUnreadNotificationCount();
        setUnreadCount(res.data.count);
      } catch {
        // silent
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.data.slice(0, 10));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleNotificationClick = async (notif: NotificationData) => {
    if (!notif.is_read) {
      try {
        await api.markNotificationRead(notif.id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      } catch {
        // silent
      }
    }
    setOpen(false);
    if (notif.action_url) {
      router.push(notif.action_url);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-all duration-300"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center bg-gold text-background text-[10px] font-bold rounded-full min-w-[18px] min-h-[18px] leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass rounded-2xl border border-white/10 shadow-glass overflow-hidden z-50"
          >
            <div className="p-3 border-b border-white/5">
              <p className="text-sm font-semibold text-white">Notifications</p>
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <svg className="animate-spin h-5 w-5 text-gold" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
                    >
                      <span className="text-base shrink-0 mt-0.5" aria-hidden="true">
                        {getIcon(notif.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs ${!notif.is_read ? "font-bold text-white" : "text-white/70"}`}
                        >
                          {notif.title}
                        </p>
                        {notif.body && (
                          <p className="text-[11px] text-muted mt-0.5 line-clamp-1">{notif.body}</p>
                        )}
                        <span className="text-[10px] text-muted/50 mt-1 block">
                          {timeAgo(notif.created_at)}
                        </span>
                      </div>
                      {!notif.is_read && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-gold mt-1.5" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-sm text-gold font-medium py-3 border-t border-white/5 hover:bg-white/[0.03] transition-colors"
            >
              View All Notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
