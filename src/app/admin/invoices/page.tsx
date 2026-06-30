"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { DataTable, AdminPageHeader, AdminModal } from "@/components/admin";
import type { Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceData {
  id: string;
  invoice_number: string;
  user_id: string;
  client_name: string;
  client_email: string;
  service: string;
  amount: number;
  amount_ngn: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  items: { description: string; amount: number }[] | null;
  notes: string | null;
}

const statusVariant: Record<string, "gold" | "success" | "error" | "info"> = {
  paid: "success",
  unpaid: "gold",
  overdue: "error",
  cancelled: "error",
  partially_paid: "info",
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

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

  const fetchInvoices = useCallback(async () => {
    setPageLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      const res = await adminFetch<{ success: boolean; data: { data: InvoiceData[]; current_page: number; last_page: number; total: number } }>(
        `/invoices?${params.toString()}`
      );
      setInvoices(res.data.data);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  const columns: Column<InvoiceData>[] = [
    {
      key: "invoice_number",
      header: "Invoice Number",
      render: (inv) => <span className="text-sm font-mono font-medium text-white">{inv.invoice_number}</span>,
    },
    {
      key: "client_name",
      header: "Client",
      render: (inv) => (
        <div>
          <p className="text-sm text-white">{inv.client_name || "—"}</p>
          <p className="text-xs text-muted">{inv.client_email}</p>
        </div>
      ),
    },
    {
      key: "service",
      header: "Service",
      render: (inv) => <span className="text-sm text-muted">{inv.service || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "amount",
      header: "Amount",
      render: (inv) => <span className="text-sm font-semibold text-white whitespace-nowrap">{formatCurrency(inv.amount_ngn || inv.amount)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (inv) => (
        <Badge variant={statusVariant[inv.status] || "info"}>
          {inv.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </Badge>
      ),
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (inv) => (
        <span className="text-sm text-muted whitespace-nowrap">
          {inv.due_date ? formatDate(inv.due_date) : "—"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (inv) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(inv)}>
            View
          </Button>
          <Button variant="ghost" size="sm" onClick={() => {}}>
            PDF
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
        title="Invoices"
        description="View and manage all invoices"
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by invoice number or client..."
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
              { value: "paid", label: "Paid" },
              { value: "unpaid", label: "Unpaid" },
              { value: "overdue", label: "Overdue" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
        </div>
      </div>

      {error ? (
        <ErrorMessage title="Failed to load invoices" message={error} onRetry={fetchInvoices} />
      ) : (
        <DataTable
          columns={columns}
          data={invoices}
          loading={pageLoading}
          searchable={false}
          keyExtractor={(inv) => inv.id}
          pagination={{
            currentPage: page,
            lastPage,
            total,
            perPage: 20,
            onPageChange: setPage,
          }}
          emptyState={
            <EmptyState
              icon="📄"
              title={search || statusFilter ? "No matching invoices" : "No invoices yet"}
              description={search || statusFilter ? "Try different search or filter." : "Invoices will appear when generated."}
            />
          }
        />
      )}

      <AdminModal
        open={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={`Invoice ${selectedInvoice?.invoice_number || ""}`}
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => {}} icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }>
              Download PDF
            </Button>
            <Button variant="secondary" onClick={() => setSelectedInvoice(null)}>Close</Button>
          </div>
        }
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted mb-1">Invoice Number</p>
                <p className="text-sm font-mono font-medium text-white">{selectedInvoice.invoice_number}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Status</p>
                <Badge variant={statusVariant[selectedInvoice.status] || "info"}>
                  {selectedInvoice.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Amount</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(selectedInvoice.amount_ngn || selectedInvoice.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Due Date</p>
                <p className="text-sm text-white">{selectedInvoice.due_date ? formatDate(selectedInvoice.due_date) : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Paid At</p>
                <p className="text-sm text-white">{selectedInvoice.paid_at ? formatDate(selectedInvoice.paid_at) : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Created At</p>
                <p className="text-sm text-white">{formatDate(selectedInvoice.created_at)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-muted mb-1">Client</p>
              <p className="text-sm text-white">{selectedInvoice.client_name || "—"}</p>
              <p className="text-sm text-muted">{selectedInvoice.client_email}</p>
              {selectedInvoice.service && (
                <>
                  <p className="text-xs text-muted mt-3 mb-1">Service</p>
                  <p className="text-sm text-white">{selectedInvoice.service}</p>
                </>
              )}
            </div>

            {selectedInvoice.items && selectedInvoice.items.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-muted mb-2">Line Items</p>
                <div className="space-y-2">
                  {selectedInvoice.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-white/80">{item.description}</span>
                      <span className="text-white font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedInvoice.notes && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-muted mb-1">Notes</p>
                <p className="text-sm text-white/80">{selectedInvoice.notes}</p>
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </motion.div>
  );
}
