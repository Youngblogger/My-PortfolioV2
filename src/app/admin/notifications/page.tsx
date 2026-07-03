"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AdminPageHeader, AdminModal } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { api, type NotificationData } from "@/lib/api";

interface ExistingUser {
  id: string;
  full_name: string | null;
  email: string;
}

const NOTIFICATION_ICONS: Record<string, string> = {
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

async function adminFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`/api/v1/admin${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
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
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const [showSend, setShowSend] = useState(false);
  const [sendType, setSendType] = useState<"individual" | "broadcast">("broadcast");
  const [individualUser, setIndividualUser] = useState("");
  const [sendTitle, setSendTitle] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [channels, setChannels] = useState({ in_app: true, email: false });
  const [existingUsers, setExistingUsers] = useState<ExistingUser[]>([]);
  const [sending, setSending] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [notifRes, countRes] = await Promise.all([
        api.getNotifications(),
        api.getUnreadNotificationCount(),
      ]);
      setNotifications(notifRes.data);
      setUnreadCount(countRes.data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

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

  function toAdminUrl(url: string): string {
    if (url.startsWith("/hire/project/")) return url.replace("/hire/project/", "/admin/projects/");
    if (url.startsWith("/hire/order/")) return url.replace("/hire/order/", "/admin/orders/");
    if (url.startsWith("/messages/")) return url.replace("/messages/", "/admin/messages/");
    if (url.startsWith("/dashboard")) return url.replace("/dashboard", "/admin");
    if (url.startsWith("/payments")) return url.replace("/payments", "/admin/payments");
    return url;
  }

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
      router.push(toAdminUrl(notif.action_url));
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/v1/admin/users", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) setExistingUsers(data.data || []);
    } catch { /* ignore */ }
  };

  const openSend = async () => {
    setSendType("broadcast");
    setIndividualUser("");
    setSendTitle("");
    setSendMessage("");
    setChannels({ in_app: true, email: false });
    await fetchUsers();
    setShowSend(true);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const channel = channels.in_app && channels.email ? "both" : channels.in_app ? "in_app" : "email";
      const payload: Record<string, unknown> = {
        title: sendTitle,
        message: sendMessage,
        channel,
        type: "general",
      };
      if (sendType === "individual") {
        payload.user_id = individualUser;
      } else {
        payload.type = "broadcast";
      }
      await adminFetch("/notifications/send", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setShowSend(false);
    } catch (err) {
      console.error("Failed to send notification:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Notifications"
        description="View your personal notifications."
        actions={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="secondary"
                onClick={handleMarkAllRead}
                loading={markingAll}
              >
                Mark All as Read
              </Button>
            )}
            <Button onClick={openSend} icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }>
              Send Notification
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center space-y-4">
            <svg className="animate-spin h-8 w-8 text-[#5B4CF0] mx-auto" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-[#667085] text-sm">Loading notifications...</p>
          </div>
        </div>
      ) : error ? (
        <div className="portal-card rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
          <h3 className="text-lg font-bold text-[#101828] mb-2">Oops</h3>
          <p className="text-[#667085] text-sm mb-6">{error}</p>
          <button
            onClick={fetchNotifications}
            className="px-6 py-3 rounded-xl portal-primary-bg text-[#101828] font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No Notifications Yet"
          description="We'll notify you when something happens."
        />
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
          {notifications.map((notif) => (
            <motion.button
              key={notif.id}
              variants={fadeUp}
              onClick={() => handleClick(notif)}
              className={`w-full text-left portal-card rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 hover:border-[#5B4CF0]/20 ${
                !notif.is_read ? "border-l-2 border-l-gold" : ""
              }`}
            >
              <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">
                {getIcon(notif.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${!notif.is_read ? "font-bold text-white" : "text-[#667085]"}`}
                >
                  {notif.title}
                </p>
                {notif.body && (
                  <p className="text-xs text-[#667085] mt-0.5 line-clamp-2">{notif.body}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-[#667085]/60">{timeAgo(notif.created_at)}</span>
                  {notif.action_text && notif.action_url && (
                    <span className="text-[11px] text-[#5B4CF0]">{notif.action_text}</span>
                  )}
                </div>
              </div>
              {!notif.is_read && (
                <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-[#5B4CF0] mt-2" aria-label="Unread" />
              )}
            </motion.button>
          ))}
        </motion.div>
      )}

      <AdminModal
        open={showSend}
        onClose={() => setShowSend(false)}
        title="Send Notification"
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowSend(false)}>Cancel</Button>
            <Button onClick={handleSend} loading={sending}>
              Send
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSend} className="space-y-5">
          <div>
            <label className="block text-sm text-[#667085] font-medium mb-2">Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sendType"
                  value="broadcast"
                  checked={sendType === "broadcast"}
                  onChange={() => setSendType("broadcast")}
                  className="text-[#5B4CF0] focus:ring-gold/20"
                />
                <span className="text-sm text-white">Broadcast</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sendType"
                  value="individual"
                  checked={sendType === "individual"}
                  onChange={() => setSendType("individual")}
                  className="text-[#5B4CF0] focus:ring-gold/20"
                />
                <span className="text-sm text-white">Individual</span>
              </label>
            </div>
          </div>

          {sendType === "individual" && (
            <div>
              <label className="block text-sm text-[#667085] font-medium mb-1.5">Select User</label>
              <select
                value={individualUser}
                onChange={(e) => setIndividualUser(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-[#ECEFF5] text-[#101828] focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-gold/20 transition-all"
                required={sendType === "individual"}
              >
                <option value="" disabled>Choose a user...</option>
                {existingUsers.map((u) => (
                  <option key={u.id} value={u.id} className="bg-surface text-white">
                    {u.full_name || u.email} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Title"
            value={sendTitle}
            onChange={(e) => setSendTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm text-[#667085] font-medium mb-1.5">Message</label>
            <textarea
              value={sendMessage}
              onChange={(e) => setSendMessage(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-[#ECEFF5] text-[#101828] placeholder:text-[#667085]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-[#667085] font-medium mb-2">Channels</label>
            <div className="space-y-2">
              <Checkbox
                label="In-App"
                checked={channels.in_app}
                onChange={(checked) => setChannels((prev) => ({ ...prev, in_app: checked }))}
              />
              <Checkbox
                label="Email"
                checked={channels.email}
                onChange={(checked) => setChannels((prev) => ({ ...prev, email: checked }))}
              />
            </div>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
