"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api, type NotificationData } from "@/lib/api";

const NOTIFICATION_ICONS: Record<string, string> = {
  proposal_created: "\uD83D\uDCC4",
  status_changed: "\uD83D\uDD04",
  team_assigned: "\uD83D\uDC64",
  payment_received: "\uD83D\uDCB0",
  message_received: "\uD83D\uDCAC",
  order_created: "\uD83D\uDCCB",
  meeting_scheduled: "\uD83D\uDCC5",
};

function getIcon(type: string): string {
  return NOTIFICATION_ICONS[type] || "\uD83D\uDD14";
}

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

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [notifRes, countRes] = await Promise.all([
        api.getNotifications(),
        api.getUnreadNotificationCount(),
      ]);
      setNotifications(notifRes.data);
      setUnreadCount(countRes.data.count);
    } catch {
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // silent
    } finally {
      setMarkingAll(false);
    }
  };

  const handleClick = async (notif: NotificationData) => {
    if (!notif.is_read) {
      try {
        await api.markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // silent
      }
    }
    if (notif.action_url) {
      router.push(notif.action_url);
    }
  };

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Notifications
            </h1>
            <p className="text-muted mt-1">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="px-4 py-2 rounded-xl bg-gold-gradient text-background font-semibold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
            >
              {markingAll ? "Marking..." : "Mark All as Read"}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-4">
              <svg className="animate-spin h-8 w-8 text-gold mx-auto" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-muted text-sm">Loading notifications...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
            <h3 className="text-lg font-bold text-white mb-2">Oops</h3>
            <p className="text-muted text-sm mb-6">{error}</p>
            <button
              onClick={load}
              className="px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4" aria-hidden="true">🔔</div>
            <h3 className="text-lg font-bold text-white mb-2">No Notifications Yet</h3>
            <p className="text-muted text-sm">We'll notify you when something happens.</p>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
            {notifications.map((notif) => (
              <motion.button
                key={notif.id}
                variants={fadeUp}
                onClick={() => handleClick(notif)}
                className={`w-full text-left glass rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 hover:border-gold/20 ${
                  !notif.is_read ? "border-l-2 border-l-gold" : ""
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">
                  {getIcon(notif.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${!notif.is_read ? "font-bold text-white" : "text-white/80"}`}
                  >
                    {notif.title}
                  </p>
                  {notif.body && (
                    <p className="text-xs text-muted mt-0.5 line-clamp-2">{notif.body}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] text-muted/60">{timeAgo(notif.created_at)}</span>
                    {notif.action_text && notif.action_url && (
                      <span className="text-[11px] text-gold">{notif.action_text}</span>
                    )}
                  </div>
                </div>
                {!notif.is_read && (
                  <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-gold mt-2" aria-label="Unread" />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
