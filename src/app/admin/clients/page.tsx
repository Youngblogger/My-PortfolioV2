"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminPageHeader, DataTable, AdminModal, ConfirmDialog } from "@/components/admin";
import type { Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { formatDate } from "@/lib/utils";

type ClientStatus = "active" | "suspended";

interface ClientData {
  id: string;
  full_name: string | null;
  email: string;
  company: string | null;
  phone: string | null;
  projects_count: number;
  status: ClientStatus;
  joined_at: string;
  projects?: {
    id: string;
    title: string;
    status: string;
    created_at: string;
  }[];
  payments?: {
    id: string;
    amount: number;
    status: string;
    created_at: string;
  }[];
}

interface PaginatedClients {
  data: ClientData[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

async function adminFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(`${endpoint}`, { ...options, headers, credentials: "include" });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || err.message || `HTTP ${response.status}`);
  }
  return response.json();
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  const [notificationModal, setNotificationModal] = useState(false);
  const [notifyClient, setNotifyClient] = useState<ClientData | null>(null);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [sendingNotify, setSendingNotify] = useState(false);

  const [confirmAction, setConfirmAction] = useState<{ client: ClientData; action: "suspend" | "reactivate" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("sort", "joined_at");
      const res = await adminFetch<PaginatedClients>(`/api/v1/admin/clients?${params.toString()}`);
      setClients(res.data);
      setTotalPages(res.last_page);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  async function handleSuspendReactivate() {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      const action = confirmAction.action === "suspend" ? "suspend" : "reactivate";
      await adminFetch(`/api/v1/admin/clients/${confirmAction.client.id}/${action}`, { method: "POST" });
      setConfirmAction(null);
      fetchClients();
    } catch (err) {
      console.error("Failed to update client status:", err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSendNotification() {
    if (!notifyClient || !notifyTitle || !notifyMessage) return;
    setSendingNotify(true);
    try {
      await adminFetch(`/api/v1/admin/clients/${notifyClient.id}/notify`, {
        method: "POST",
        body: JSON.stringify({ title: notifyTitle, message: notifyMessage }),
      });
      setNotificationModal(false);
      setNotifyTitle("");
      setNotifyMessage("");
      setNotifyClient(null);
    } catch (err) {
      console.error("Failed to send notification:", err);
    } finally {
      setSendingNotify(false);
    }
  }

  function toggleExpand(id: string) {
    setExpandedClient(prev => prev === id ? null : id);
  }

  const columns: Column<ClientData>[] = [
    {
      key: "full_name",
      header: "Name",
      render: (client) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
            <span className="text-xs font-bold text-gold">
              {(client.full_name || client.email).charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{client.full_name || "Unnamed"}</p>
            <p className="text-xs text-muted">{client.email}</p>
          </div>
        </div>
      ),
      hideOnMobile: false,
    },
    {
      key: "company",
      header: "Company",
      render: (client) => <span className="text-sm text-muted">{client.company || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "phone",
      header: "Phone",
      render: (client) => <span className="text-sm text-muted">{client.phone || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "projects_count",
      header: "Projects",
      render: (client) => (
        <span className="text-sm font-semibold text-white">{client.projects_count}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      render: (client) => (
        <Badge variant={client.status === "active" ? "success" : "error"}>
          {client.status === "active" ? "Active" : "Suspended"}
        </Badge>
      ),
    },
    {
      key: "joined_at",
      header: "Joined",
      render: (client) => <span className="text-sm text-muted whitespace-nowrap">{formatDate(client.joined_at)}</span>,
      hideOnMobile: true,
    },
  ];

  function renderActions(client: ClientData) {
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {client.status === "active" ? (
          <Button size="sm" variant="outline" onClick={() => setConfirmAction({ client, action: "suspend" })}>
            Suspend
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setConfirmAction({ client, action: "reactivate" })}>
            Reactivate
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => { setNotifyClient(client); setNotificationModal(true); }}
        >
          Notify
        </Button>
      </div>
    );
  }

  function renderExpanded(client: ClientData) {
    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="overflow-hidden"
      >
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Project History</h4>
              {client.projects && client.projects.length > 0 ? (
                <div className="space-y-2">
                  {client.projects.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted">{p.title}</span>
                      <Badge variant={p.status === "completed" ? "success" : "info"}>
                        {p.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No projects yet.</p>
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Payment History</h4>
              {client.payments && client.payments.length > 0 ? (
                <div className="space-y-2">
                  {client.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted">{formatDate(p.created_at)}</span>
                      <Badge variant={p.status === "paid" ? "success" : "error"}>
                        {p.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No payments yet.</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  function handleExportCsv() {
    const headers = ["Name", "Email", "Company", "Phone", "Projects Count", "Status", "Joined Date"];
    const rows = clients.map((c) => [
      c.full_name || "",
      c.email,
      c.company || "",
      c.phone || "",
      String(c.projects_count),
      c.status,
      c.joined_at,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <AdminPageHeader
        title="Clients"
        description="Manage all registered clients."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={handleExportCsv}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage title="Failed to load clients" message={error} onRetry={fetchClients} />
      ) : clients.length === 0 ? (
        <EmptyState
          icon="👥"
          title={search || statusFilter !== "all" ? "No matching clients" : "No clients yet"}
          description="Clients will appear here once they register or place orders."
        />
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4 ${col.hideOnMobile ? "hidden md:table-cell" : ""}`}
                    >
                      {col.header}
                    </th>
                  ))}
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                {clients.map((client) => (
                  <motion.tbody
                    key={client.id}
                    className="border-b border-white/5 last:border-b-0"
                  >
                    <motion.tr
                      onClick={() => toggleExpand(client.id)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`py-4 px-6 text-sm ${col.hideOnMobile ? "hidden md:table-cell" : ""}`}
                        >
                          {col.render ? col.render(client) : String((client as any)[col.key] ?? "")}
                        </td>
                      ))}
                      <td className="py-4 px-6 text-right">
                        {renderActions(client)}
                      </td>
                    </motion.tr>
                    {expandedClient === client.id && (
                      <tr>
                        <td colSpan={columns.length + 1} className="p-0">
                          {renderExpanded(client)}
                        </td>
                      </tr>
                    )}
                  </motion.tbody>
                ))}
              </motion.tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
          <p className="text-sm text-muted">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <AdminModal
        open={notificationModal}
        onClose={() => { setNotificationModal(false); setNotifyClient(null); setNotifyTitle(""); setNotifyMessage(""); }}
        title={`Send Notification to ${notifyClient?.full_name || notifyClient?.email || "Client"}`}
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => { setNotificationModal(false); setNotifyClient(null); setNotifyTitle(""); setNotifyMessage(""); }}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification} loading={sendingNotify} disabled={!notifyTitle || !notifyMessage}>
              Send
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Title" value={notifyTitle} onChange={(e) => setNotifyTitle(e.target.value)} placeholder="Notification title..." />
          <div className="space-y-1.5">
            <label className="block text-sm text-white/80 font-medium">Message</label>
            <textarea
              value={notifyMessage}
              onChange={(e) => setNotifyMessage(e.target.value)}
              rows={4}
              placeholder="Write your notification message..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
            />
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleSuspendReactivate}
        title={confirmAction?.action === "suspend" ? "Suspend Client" : "Reactivate Client"}
        message={confirmAction?.action === "suspend"
          ? `Are you sure you want to suspend ${confirmAction?.client.full_name || confirmAction?.client.email}? They will lose access to their account.`
          : `Are you sure you want to reactivate ${confirmAction?.client.full_name || confirmAction?.client.email}?`}
        confirmText={confirmAction?.action === "suspend" ? "Suspend" : "Reactivate"}
        destructive={confirmAction?.action === "suspend"}
        loading={actionLoading}
      />
    </motion.div>
  );
}
