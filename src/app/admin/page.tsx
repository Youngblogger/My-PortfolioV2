"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, type AdminDashboardData } from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-400" },
  in_progress: { label: "In Progress", color: "bg-blue-500/10 text-blue-400" },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-400" },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-400" },
  on_hold: { label: "On Hold", color: "bg-orange-500/10 text-orange-400" },
};

const statCards = [
  { key: "total_orders", label: "Total Orders", color: "from-blue-500/20 to-transparent" },
  { key: "active_projects", label: "Active Projects", color: "from-green-500/20 to-transparent" },
  { key: "pending_proposals", label: "Pending Proposals", color: "from-yellow-500/20 to-transparent" },
  { key: "pending_calls", label: "Pending Calls", color: "from-purple-500/20 to-transparent" },
  { key: "revenue_ngn", label: "Revenue (NGN)", color: "from-gold/20 to-transparent", isCurrency: true },
  { key: "leads", label: "Leads", color: "from-pink-500/20 to-transparent" },
];

function formatNgn(amount: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
}

function orderStatusBadge(status: string) {
  const cfg = statusConfig[status] || { label: status, color: "bg-white/5 text-white" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  on_hold: "On Hold",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res = await api.getAdminDashboard();
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="space-y-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="glass rounded-2xl p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Dashboard</h3>
          <p className="text-sm text-muted mb-6">{error}</p>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxStatusValue = Math.max(...Object.values(data.orders_by_status), 1);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="section-heading text-gradient">Dashboard</h1>
        <p className="section-subtitle">Overview of your business performance and recent activity.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const value = data.stats[stat.key as keyof typeof data.stats];
          const display = stat.isCurrency ? formatNgn(value as number) : String(value);
          return (
            <div
              key={stat.key}
              className={`glass rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br ${stat.color}`}
            >
              <p className="text-sm text-muted mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{display}</p>
              <div className="absolute bottom-0 right-0 w-32 h-32 -mr-8 -mb-8 rounded-full bg-white/[0.02]" />
            </div>
          );
        })}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {Object.entries(data.orders_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="text-sm text-muted w-28 shrink-0">
                  {statusLabels[status] || status}
                </span>
                <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxStatusValue) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gold-gradient rounded-full"
                  />
                </div>
                <span className="text-sm font-semibold text-white w-10 text-right">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
          {data.recent_orders.length === 0 ? (
            <p className="text-sm text-muted">No recent orders.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 pr-4 text-muted font-medium">Order</th>
                    <th className="text-left py-3 pr-4 text-muted font-medium">Client</th>
                    <th className="text-left py-3 pr-4 text-muted font-medium">Service</th>
                    <th className="text-left py-3 pr-4 text-muted font-medium">Status</th>
                    <th className="text-right py-3 text-muted font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_orders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <span className="text-white font-medium">{order.order_number}</span>
                      </td>
                      <td className="py-3 pr-4 text-muted">{order.client}</td>
                      <td className="py-3 pr-4 text-muted">{order.service}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 text-right text-white font-medium">
                        {formatNgn(order.total_ngn)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
