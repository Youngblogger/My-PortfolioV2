"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader, DataTable, AdminModal } from "@/components/admin";
import type { Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { formatDate, truncate } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  channel: string;
  users: string;
  status: string;
  created_at: string;
}

interface NotificationListResponse {
  data: Notification[];
  current_page: number;
  last_page: number;
  total: number;
}

interface ExistingUser {
  id: string;
  full_name: string | null;
  email: string;
}

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "general", label: "General" },
  { value: "project", label: "Project" },
  { value: "payment", label: "Payment" },
  { value: "course", label: "Course" },
  { value: "system", label: "System" },
];

const CHANNEL_BADGE: Record<string, "info" | "success" | "gold"> = {
  in_app: "info",
  email: "success",
  both: "gold",
};

const STATUS_BADGE: Record<string, "success" | "gold" | "error" | "info"> = {
  sent: "success",
  pending: "gold",
  failed: "error",
  delivered: "info",
};

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

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
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search.trim()) params.set("search", search.trim());
      if (typeFilter) params.set("type", typeFilter);
      const res = await adminFetch<NotificationListResponse>(`/notifications?${params.toString()}`);
      setNotifications(res.data);
      setLastPage(res.last_page);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

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
      fetchNotifications();
    } catch (err) {
      console.error("Failed to send notification:", err);
    } finally {
      setSending(false);
    }
  };

  const columns: Column<Notification>[] = [
    {
      key: "title",
      header: "Title",
      render: (n) => <span className="text-sm font-medium text-white">{n.title}</span>,
    },
    {
      key: "message",
      header: "Message",
      render: (n) => <span className="text-sm text-muted">{truncate(n.message, 60)}</span>,
    },
    {
      key: "type",
      header: "Type",
      render: (n) => (
        <Badge variant="info">
          {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "channel",
      header: "Channel",
      render: (n) => (
        <Badge variant={CHANNEL_BADGE[n.channel] || "info"}>
          {n.channel === "both" ? "In-App & Email" : n.channel === "in_app" ? "In-App" : "Email"}
        </Badge>
      ),
    },
    {
      key: "users",
      header: "User(s)",
      hideOnMobile: true,
      render: (n) => <span className="text-sm text-muted">{n.users}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (n) => (
        <Badge variant={STATUS_BADGE[n.status] || "info"}>
          {n.status.charAt(0).toUpperCase() + n.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Sent Date",
      hideOnMobile: true,
      render: (n) => <span className="text-sm text-muted whitespace-nowrap">{formatDate(n.created_at)}</span>,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Notifications"
        description="View and send notifications to users."
        actions={
          <Button onClick={openSend} icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          }>
            Send Notification
          </Button>
        }
      />

      <div className="mb-6 w-48">
        <Select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          options={TYPE_OPTIONS}
        />
      </div>

      <DataTable
        columns={columns}
        data={notifications}
        loading={loading}
        searchable
        searchPlaceholder="Search notifications..."
        onSearch={(val) => { setSearch(val); setPage(1); }}
        keyExtractor={(n) => n.id}
        pagination={{
          currentPage: page,
          lastPage,
          total,
          perPage: notifications.length || 10,
          onPageChange: (p) => setPage(p),
        }}
        emptyState={
          <EmptyState
            icon="🔔"
            title={search || typeFilter ? "No matching notifications" : "No notifications yet"}
            description={search || typeFilter ? "Try adjusting your filters." : "Send your first notification to get started."}
          />
        }
      />

      {error && !loading && (
        <div className="mt-4">
          <ErrorMessage title="Failed to load notifications" message={error} onRetry={fetchNotifications} />
        </div>
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
            <label className="block text-sm text-white/80 font-medium mb-2">Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sendType"
                  value="broadcast"
                  checked={sendType === "broadcast"}
                  onChange={() => setSendType("broadcast")}
                  className="text-gold focus:ring-gold/20"
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
                  className="text-gold focus:ring-gold/20"
                />
                <span className="text-sm text-white">Individual</span>
              </label>
            </div>
          </div>

          {sendType === "individual" && (
            <div>
              <label className="block text-sm text-white/80 font-medium mb-1.5">Select User</label>
              <select
                value={individualUser}
                onChange={(e) => setIndividualUser(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
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
            <label className="block text-sm text-white/80 font-medium mb-1.5">Message</label>
            <textarea
              value={sendMessage}
              onChange={(e) => setSendMessage(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 font-medium mb-2">Channels</label>
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
