"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader, DataTable } from "@/components/admin";
import type { Column } from "@/components/admin";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { formatDate } from "@/lib/utils";

interface AuditLog {
  id: string;
  admin_user: string;
  action: string;
  description: string;
  ip_address: string;
  device: string;
  created_at: string;
}

interface AuditLogListResponse {
  data: AuditLog[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

const ACTION_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "other", label: "Other" },
];

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "25", label: "25 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

const ACTION_BADGE: Record<string, "info" | "success" | "gold" | "error"> = {
  login: "info",
  logout: "info",
  create: "success",
  update: "gold",
  delete: "error",
};

async function adminFetch<T>(endpoint: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const res = await fetch(`/api/v1/admin${endpoint}`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);

  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", String(perPage));
      if (actionFilter) params.set("action", actionFilter);
      if (search.trim()) params.set("search", search.trim());
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const res = await adminFetch<AuditLogListResponse>(`/audit-logs?${params.toString()}`);
      setLogs(res.data);
      setLastPage(res.last_page);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, actionFilter, search, fromDate, toDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleActionChange = (value: string) => {
    setActionFilter(value);
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const getActionBadge = (action: string) => {
    const key = action.toLowerCase();
    return ACTION_BADGE[key] || "gold";
  };

  const columns: Column<AuditLog>[] = [
    {
      key: "created_at",
      header: "Timestamp",
      sortable: true,
      render: (log) => (
        <span className="text-sm text-[#667085] whitespace-nowrap">{formatDate(log.created_at)}</span>
      ),
    },
    {
      key: "admin_user",
      header: "Admin User",
      render: (log) => <span className="text-sm font-medium text-white">{log.admin_user}</span>,
    },
    {
      key: "action",
      header: "Action",
      render: (log) => (
        <Badge variant={getActionBadge(log.action)}>
          {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
        </Badge>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (log) => <span className="text-sm text-[#667085]">{log.description}</span>,
    },
    {
      key: "ip_address",
      header: "IP Address",
      hideOnMobile: true,
      render: (log) => <span className="text-sm text-[#667085] font-mono">{log.ip_address}</span>,
    },
    {
      key: "device",
      header: "Device",
      hideOnMobile: true,
      render: (log) => <span className="text-sm text-[#667085]">{log.device}</span>,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Audit Logs"
        description="Track all administrative actions and changes."
      />

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-48">
          <Select
            value={actionFilter}
            onChange={(e) => handleActionChange(e.target.value)}
            options={ACTION_OPTIONS}
          />
        </div>
        <div className="w-40">
          <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} label="" />
        </div>
        <div className="w-40">
          <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} label="" />
        </div>
        <div className="w-48">
          <Select
            value={String(perPage)}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            options={PAGE_SIZE_OPTIONS}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchable
        searchPlaceholder="Search logs..."
        onSearch={handleSearch}
        keyExtractor={(l) => l.id}
        pagination={{
          currentPage: page,
          lastPage,
          total,
          perPage,
          onPageChange: (p) => setPage(p),
        }}
        emptyState={
          <EmptyState
            icon="📋"
            title={search || actionFilter ? "No matching logs" : "No audit logs yet"}
            description={search || actionFilter ? "Try adjusting your filters." : "Audit logs will appear here as actions are taken."}
          />
        }
      />

      {error && !loading && (
        <div className="mt-4">
          <ErrorMessage title="Failed to load audit logs" message={error} onRetry={fetchLogs} />
        </div>
      )}
    </div>
  );
}
