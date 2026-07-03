"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { DataTable, AdminPageHeader, StatsCard, AdminModal } from "@/components/admin";
import type { Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PaymentData {
  id: string;
  reference: string;
  user_id: string;
  client_name: string;
  client_email: string;
  service: string;
  amount: number;
  amount_ngn: number;
  gateway: string;
  status: string;
  fees: number | null;
  paid_at: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

interface PaymentAnalytics {
  total_revenue: number;
  pending_count: number;
  successful_count: number;
  failed_count: number;
}

const statusVariant: Record<string, "gold" | "success" | "error" | "info"> = {
  pending: "gold",
  success: "success",
  failed: "error",
  completed: "success",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

async function adminFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  const res = await fetch(`/api/v1/admin${endpoint}`, { ...options, headers, credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);

  const fetchPayments = useCallback(async () => {
    setPageLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      const res = await adminFetch<{ success: boolean; data: { data: PaymentData[]; current_page: number; last_page: number; total: number } }>(
        `/payments?${params.toString()}`
      );
      setPayments(res.data.data);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [page, search, statusFilter]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await adminFetch<{ success: boolean; data: PaymentAnalytics }>("/payments/analytics");
      setAnalytics(res.data);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  const columns: Column<PaymentData>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (p) => <span className="text-sm font-mono font-medium text-white">{p.reference}</span>,
    },
    {
      key: "client_name",
      header: "Client",
      render: (p) => (
        <div>
          <p className="text-sm text-white">{p.client_name || "—"}</p>
          <p className="text-xs text-[#667085]">{p.client_email}</p>
        </div>
      ),
    },
    {
      key: "service",
      header: "Service",
      render: (p) => <span className="text-sm text-[#667085]">{p.service || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "amount",
      header: "Amount",
      render: (p) => <span className="text-sm font-semibold text-[#101828] whitespace-nowrap">{formatCurrency(p.amount_ngn || p.amount)}</span>,
    },
    {
      key: "gateway",
      header: "Gateway",
      render: (p) => <span className="text-sm capitalize text-[#667085]">{p.gateway || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <Badge variant={statusVariant[p.status] || "info"}>
          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "paid_at",
      header: "Date",
      render: (p) => <span className="text-sm text-[#667085] whitespace-nowrap">{formatDate(p.paid_at || p.created_at)}</span>,
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(p)}>
            View
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <AdminPageHeader
        title="Payments"
        description="View and manage all payments"
        actions={
          <Button variant="outline" size="sm" onClick={() => {}} icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }>
            Export
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Revenue"
          value={analytics ? formatCurrency(analytics.total_revenue) : "—"}
          loading={!analytics}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          label="Successful Payments"
          value={analytics?.successful_count ?? "—"}
          loading={!analytics}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          label="Pending Payments"
          value={analytics?.pending_count ?? "—"}
          loading={!analytics}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          label="Failed Payments"
          value={analytics?.failed_count ?? "—"}
          loading={!analytics}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by reference or client..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            options={[
              { value: "", label: "All Status" },
              { value: "pending", label: "Pending" },
              { value: "success", label: "Success" },
              { value: "failed", label: "Failed" },
            ]}
          />
        </div>
      </div>

      {error ? (
        <ErrorMessage title="Failed to load payments" message={error} onRetry={fetchPayments} />
      ) : (
        <DataTable
          columns={columns}
          data={payments}
          loading={pageLoading}
          searchable={false}
          keyExtractor={(p) => p.id}
          pagination={{
            currentPage: page,
            lastPage,
            total,
            perPage: 20,
            onPageChange: setPage,
          }}
          emptyState={
            <EmptyState
              icon="💳"
              title={search || statusFilter ? "No matching payments" : "No payments yet"}
              description={search || statusFilter ? "Try different search or filter." : "Payments will appear here."}
            />
          }
        />
      )}

      <AdminModal
        open={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title="Payment Details"
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setSelectedPayment(null)}>Close</Button>
        }
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#667085] mb-1">Reference</p>
                <p className="text-sm font-mono font-medium text-white">{selectedPayment.reference}</p>
              </div>
              <div>
                <p className="text-xs text-[#667085] mb-1">Gateway</p>
                <p className="text-sm capitalize text-white">{selectedPayment.gateway || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-[#667085] mb-1">Amount</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(selectedPayment.amount_ngn || selectedPayment.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-[#667085] mb-1">Fees</p>
                <p className="text-sm text-white">{selectedPayment.fees ? formatCurrency(selectedPayment.fees) : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-[#667085] mb-1">Status</p>
                <Badge variant={statusVariant[selectedPayment.status] || "info"}>
                  {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-[#667085] mb-1">Paid At</p>
                <p className="text-sm text-white">{selectedPayment.paid_at ? formatDate(selectedPayment.paid_at) : "—"}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-[#ECEFF5]">
              <p className="text-xs text-[#667085] mb-1">Client</p>
              <p className="text-sm text-white">{selectedPayment.client_name || "—"}</p>
              <p className="text-sm text-[#667085]">{selectedPayment.client_email}</p>
              {selectedPayment.service && (
                <>
                  <p className="text-xs text-[#667085] mt-3 mb-1">Service</p>
                  <p className="text-sm text-white">{selectedPayment.service}</p>
                </>
              )}
            </div>
            {selectedPayment.metadata && Object.keys(selectedPayment.metadata).length > 0 && (
              <div className="pt-4 border-t border-[#ECEFF5]">
                <p className="text-xs text-[#667085] mb-2">Metadata</p>
                <div className="space-y-1">
                  {Object.entries(selectedPayment.metadata).map(([key, val]) => (
                    <div key={key} className="flex gap-2 text-xs">
                      <span className="text-[#667085] capitalize">{key.replace(/_/g, " ")}:</span>
                      <span className="text-[#667085]">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </motion.div>
  );
}
