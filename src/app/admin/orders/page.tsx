"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import type { PaginatedOrdersData } from "@/lib/api";

type OrderItem = PaginatedOrdersData["data"][number];

const statusTabs = [
  "all",
  "lead",
  "discovery",
  "proposal",
  "approved",
  "development",
  "testing",
  "deployment",
  "completed",
] as const;

const paymentVariant: Record<string, "gold" | "success" | "error" | "info"> = {
  pending: "gold",
  paid: "success",
  failed: "error",
  partial: "info",
  refunded: "error",
};

const statusOptions = [
  { value: "lead", label: "Lead" },
  { value: "discovery", label: "Discovery" },
  { value: "proposal", label: "Proposal" },
  { value: "approved", label: "Approved" },
  { value: "development", label: "Development" },
  { value: "testing", label: "Testing" },
  { value: "deployment", label: "Deployment" },
  { value: "completed", label: "Completed" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export default function AdminOrdersPage() {
  const [ordersData, setOrdersData] = useState<PaginatedOrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = activeTab === "all" ? undefined : activeTab;
      const searchParam = search.trim() || undefined;
      const res = await api.getAdminOrders(statusParam, searchParam);
      setOrdersData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrdersData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          ),
        };
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  }

  const orders = ordersData?.data || [];
  const currentPage = ordersData?.current_page || 1;
  const lastPage = ordersData?.last_page || 1;

  return (
    <div>
      <div className="mb-8">
        <span className="section-label">ORDERS</span>
        <h1 className="text-2xl md:text-3xl font-bold text-[#101828] mt-1">
          Orders Management
        </h1>
        <p className="text-[#667085] text-sm mt-1">
          View, search, and update all service orders.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[#ECEFF5] pb-4 overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={cn(
              "text-sm font-medium px-3 py-1.5 rounded-lg transition-all whitespace-nowrap",
              activeTab === tab
                ? "text-[#5B4CF0] bg-[#5B4CF0]/10"
                : "text-[#667085] hover:text-white"
            )}
          >
            {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search orders by number, client, or project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="portal-card rounded-2xl overflow-hidden">
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ) : error ? (
        <ErrorMessage
          title="Failed to Load Orders"
          message={error}
          onRetry={fetchOrders}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No orders found"
          description={
            search
              ? "No orders match your search criteria."
              : activeTab === "all"
              ? "Orders will appear here once clients place them."
              : `No orders with status "${activeTab}".`
          }
        />
      ) : (
        <>
          {/* Table - Desktop */}
          <div className="hidden md:block portal-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#ECEFF5]">
                    <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-6 py-4">Order #</th>
                    <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-6 py-4">Client</th>
                    <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-6 py-4">Service / Project</th>
                    <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-6 py-4">Package</th>
                    <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-6 py-4">Payment</th>
                    <th className="text-right text-xs font-semibold text-[#667085] uppercase tracking-wider px-6 py-4">Total</th>
                    <th className="text-left text-xs font-semibold text-[#667085] uppercase tracking-wider px-6 py-4">Date</th>
                    <th className="text-right text-xs font-semibold text-[#667085] uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {orders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      variants={rowVariants}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-[#ECEFF5] hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-medium text-[#5B4CF0] hover:text-[#5B4CF0]-secondary transition-colors"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#667085]">
                        {order.user?.profile?.full_name || "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#667085]">{order.service?.title}</p>
                        <p className="text-xs text-[#667085]">{order.project_name || order.projectType?.title}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#667085]">
                        {order.package?.name || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={paymentVariant[order.payment_status] || "info"}>
                          {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-white">
                        {formatCurrency(order.total_ngn)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#667085] whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                          href={`/admin/orders/${order.id}`}
                            className="text-xs px-3 py-1.5 rounded-lg border border-[#ECEFF5] text-[#667085] hover:text-white hover:border-[#5B4CF0]/30 transition-all"
                          >
                            View
                          </Link>
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="text-xs px-2 py-1.5 rounded-lg bg-gray-50 border border-[#ECEFF5] text-[#101828] focus:outline-none focus:border-[#5B4CF0]/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                          >
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value} className="bg-surface text-white">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </div>

          {/* Cards - Mobile */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:hidden"
          >
            {orders.map((order) => (
              <motion.div
                key={order.id}
                variants={rowVariants}
                className="portal-card rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-sm font-bold text-[#5B4CF0] hover:text-[#5B4CF0]-secondary transition-colors"
                  >
                    {order.order_number}
                  </Link>
                  <StatusBadge status={order.status} />
                </div>
                <div>
                  <p className="text-sm text-[#667085] font-medium">
                    {order.user?.profile?.full_name || "Unknown client"}
                  </p>
                  <p className="text-xs text-[#667085] mt-0.5">
                    {order.service?.title} &mdash; {order.project_name || order.projectType?.title}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#667085]">{order.package?.name || "—"}</span>
                  <Badge variant={paymentVariant[order.payment_status] || "info"} className="text-[10px]">
                    {order.payment_status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#ECEFF5]">
                  <div>
                    <p className="text-lg font-bold text-[#5B4CF0]">
                      {formatCurrency(order.total_ngn)}
                    </p>
                    <p className="text-xs text-[#667085]">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[#ECEFF5] text-[#667085] hover:text-white hover:border-[#5B4CF0]/30 transition-all"
                    >
                      View
                    </Link>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg bg-gray-50 border border-[#ECEFF5] text-[#101828] focus:outline-none focus:border-[#5B4CF0]/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-surface text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#ECEFF5]">
            <p className="text-sm text-[#667085]">
              Page {currentPage} of {lastPage}
              {ordersData && (
                <span className="ml-2">({ordersData.total} total orders)</span>
              )}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={currentPage >= lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
