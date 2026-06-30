"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { DataTable, AdminPageHeader, AdminModal } from "@/components/admin";
import type { Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ReceiptData {
  id: string;
  receipt_number: string;
  transaction_reference: string;
  user_id: string;
  client_name: string;
  client_email: string;
  amount: number;
  amount_ngn: number;
  gateway: string;
  status: string;
  created_at: string;
  notes: string | null;
}

const statusVariant: Record<string, "gold" | "success" | "error" | "info"> = {
  completed: "success",
  success: "success",
  pending: "gold",
  failed: "error",
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

export default function AdminReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);

  const fetchReceipts = useCallback(async () => {
    setPageLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search.trim()) params.set("search", search.trim());
      const res = await adminFetch<{ success: boolean; data: { data: ReceiptData[]; current_page: number; last_page: number; total: number } }>(
        `/receipts?${params.toString()}`
      );
      setReceipts(res.data.data);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load receipts");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchReceipts(); }, [fetchReceipts]);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  const columns: Column<ReceiptData>[] = [
    {
      key: "receipt_number",
      header: "Receipt Number",
      render: (r) => (
        <div>
          <p className="text-sm font-mono font-medium text-white">{r.receipt_number}</p>
          <p className="text-xs text-muted font-mono">{r.transaction_reference}</p>
        </div>
      ),
    },
    {
      key: "client_name",
      header: "Client",
      render: (r) => (
        <div>
          <p className="text-sm text-white">{r.client_name || "—"}</p>
          <p className="text-xs text-muted">{r.client_email}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (r) => <span className="text-sm font-semibold text-white whitespace-nowrap">{formatCurrency(r.amount_ngn || r.amount)}</span>,
    },
    {
      key: "gateway",
      header: "Gateway",
      render: (r) => <span className="text-sm capitalize text-muted">{r.gateway || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={statusVariant[r.status] || "info"}>
          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (r) => <span className="text-sm text-muted whitespace-nowrap">{formatDate(r.created_at)}</span>,
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={() => setSelectedReceipt(r)}>
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
        title="Receipts"
        description="View and manage all receipts"
      />

      {error ? (
        <ErrorMessage title="Failed to load receipts" message={error} onRetry={fetchReceipts} />
      ) : (
        <DataTable
          columns={columns}
          data={receipts}
          loading={pageLoading}
          searchable
          searchPlaceholder="Search by receipt number or client..."
          onSearch={handleSearch}
          keyExtractor={(r) => r.id}
          pagination={{
            currentPage: page,
            lastPage,
            total,
            perPage: 20,
            onPageChange: setPage,
          }}
          emptyState={
            <EmptyState
              icon="🧾"
              title={search ? "No matching receipts" : "No receipts yet"}
              description={search ? "Try a different search term." : "Receipts will appear when payments are completed."}
            />
          }
        />
      )}

      <AdminModal
        open={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Receipt Details"
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setSelectedReceipt(null)}>Close</Button>
        }
      >
        {selectedReceipt && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted mb-1">Receipt Number</p>
                <p className="text-sm font-mono font-medium text-white">{selectedReceipt.receipt_number}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Transaction Reference</p>
                <p className="text-sm font-mono text-white">{selectedReceipt.transaction_reference}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Gateway</p>
                <p className="text-sm capitalize text-white">{selectedReceipt.gateway || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Amount</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(selectedReceipt.amount_ngn || selectedReceipt.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Status</p>
                <Badge variant={statusVariant[selectedReceipt.status] || "info"}>
                  {selectedReceipt.status.charAt(0).toUpperCase() + selectedReceipt.status.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Date</p>
                <p className="text-sm text-white">{formatDate(selectedReceipt.created_at)}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-muted mb-1">Client</p>
              <p className="text-sm text-white">{selectedReceipt.client_name || "—"}</p>
              <p className="text-sm text-muted">{selectedReceipt.client_email}</p>
            </div>
            {selectedReceipt.notes && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-muted mb-1">Notes</p>
                <p className="text-sm text-white/80">{selectedReceipt.notes}</p>
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </motion.div>
  );
}
