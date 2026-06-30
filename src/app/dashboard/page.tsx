"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, type ServiceOrderListItem } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const ACTIVE_STATUSES = ["active", "in_progress"];
const COMPLETED_STATUSES = ["completed"];

const paymentVariant = (status: string): "gold" | "success" | "error" | "info" => {
  const map: Record<string, "gold" | "success" | "error" | "info"> = {
    paid: "success",
    partially_paid: "gold",
    pending: "info",
    pending_payment: "info",
    failed: "error",
    refunded: "info",
    cancelled: "error",
  };
  return map[status] || "info";
};

const paymentLabel = (status: string): string => {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const statCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ServiceOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getServiceOrders();
      setOrders(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter((o) => COMPLETED_STATUSES.includes(o.status));
  const totalSpent = orders.reduce((sum, o) => sum + o.total_ngn, 0);

  const tabs = [
    { id: "overview", label: "Overview", count: orders.length },
    { id: "active", label: "Active Projects", count: activeOrders.length },
    { id: "completed", label: "Completed Projects", count: completedOrders.length },
    { id: "payments", label: "Payments" },
  ];

  const statCards = [
    { label: "Total Projects", value: orders.length.toString(), icon: "📋" },
    { label: "Active Projects", value: activeOrders.length.toString(), icon: "🚀" },
    { label: "Completed Projects", value: completedOrders.length.toString(), icon: "✅" },
    { label: "Total Spent", value: formatCurrency(totalSpent), icon: "💰" },
  ];

  const quickActions = [
    { label: "Schedule Discovery Call", href: "/hire/discovery-call", icon: "📞", desc: "Let's discuss your next project idea" },
    { label: "View Proposals", href: "/proposals", icon: "📄", desc: "Review your pending proposals" },
    { label: "Browse Services", href: "/hire", icon: "🛠", desc: "Explore what we can build for you" },
    { label: "Notifications", href: "/notifications", icon: "🔔", desc: "Check your updates and alerts" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-5 space-y-3">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
          <Skeleton className="h-12 w-full mb-8 rounded-xl" />
          <div className="grid md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-56" />
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-20 px-6">
        <div className="max-w-xl mx-auto">
          <ErrorMessage title="Failed to Load Dashboard" message={error} onRetry={load} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <span className="section-label">DASHBOARD</span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Client <span className="text-gradient">Workspace</span>
          </h1>
          <p className="text-muted mt-2">Manage your projects, payments, and service orders in one place.</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={statCardVariants}
              className="glass rounded-xl p-5"
            >
              <div className="text-2xl mb-2" aria-hidden="true">{stat.icon}</div>
              <div className="text-2xl font-bold text-gold">{stat.value}</div>
              <div className="text-xs text-muted mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="glass rounded-xl p-4 hover:border-gold/20 transition-all duration-300 group"
            >
              <div className="text-xl mb-2" aria-hidden="true">{action.icon}</div>
              <h4 className="text-sm font-semibold text-white group-hover:text-gold transition-colors">
                {action.label}
              </h4>
              <p className="text-[11px] text-muted mt-0.5 leading-snug">{action.desc}</p>
            </Link>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-8" />

        {/* Tab Content */}
        {activeTab === "overview" && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {orders.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No Projects Yet"
                description="You haven't started any projects yet. Let's build something amazing together."
                action={{ label: "Start a Project", href: "/hire" }}
              />
            ) : (
              <>
                <h2 className="text-lg font-bold text-white mb-4">Recent Projects</h2>
                <div className="grid md:grid-cols-2 gap-5">
                  {orders.slice(0, 4).map((order) => (
                    <ProjectCard key={order.id} order={order} />
                  ))}
                </div>
                {orders.length > 4 && (
                  <div className="text-center mt-6">
                    <Button variant="outline" onClick={() => setActiveTab("active")}>
                      View All Projects
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {activeTab === "active" && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {activeOrders.length === 0 ? (
              <EmptyState
                icon="🚀"
                title="No Active Projects"
                description="You don't have any active projects right now. Start a new one or check your completed projects."
                action={{ label: "Start a Project", href: "/hire" }}
              />
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {activeOrders.map((order) => (
                  <ProjectCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "completed" && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {completedOrders.length === 0 ? (
              <EmptyState
                icon="✅"
                title="No Completed Projects"
                description="Your completed projects will show up here once they're finished."
                action={{ label: "View Active Projects", href: "#" }}
              />
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {completedOrders.map((order) => (
                  <ProjectCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "payments" && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {orders.length === 0 ? (
              <EmptyState
                icon="💰"
                title="No Payment History"
                description="Payment records will appear here once you place a service order."
                action={{ label: "Start a Project", href: "/hire" }}
              />
            ) : (
              <>
                <div className="glass rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">Payment Summary</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-xs text-muted">Total Spent</span>
                      <p className="text-xl font-bold text-gold">{formatCurrency(totalSpent)}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted">Paid Orders</span>
                      <p className="text-xl font-bold text-white">
                        {orders.filter((o) => o.payment_status === "paid").length}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted">Pending Payments</span>
                      <p className="text-xl font-bold text-white">
                        {orders.filter((o) => o.payment_status === "pending" || o.payment_status === "pending_payment" || o.payment_status === "partially_paid").length}
                      </p>
                    </div>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-white mb-4">Payment History</h2>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <Link key={order.id} href={`/hire/project/${order.id}`}>
                      <motion.div
                        variants={fadeUp}
                        className="glass rounded-xl p-5 flex items-center justify-between hover:border-gold/20 transition-all duration-300"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">
                            {order.project_name || order.project}
                          </p>
                          <p className="text-xs text-muted mt-0.5 font-mono">#{order.order_number}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-sm font-bold text-gold">{formatCurrency(order.total_ngn)}</p>
                          <Badge variant={paymentVariant(order.payment_status)} className="mt-1">
                            {paymentLabel(order.payment_status)}
                          </Badge>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ order }: { order: ServiceOrderListItem }) {
  return (
    <motion.div variants={fadeUp}>
      <Link
        href={`/hire/project/${order.id}`}
        className="block glass rounded-2xl p-6 hover:border-gold/20 transition-all duration-300 h-full"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1 mr-3">
            <h3 className="text-white font-semibold truncate">
              {order.project_name || order.project}
            </h3>
            <p className="text-xs text-muted mt-0.5 font-mono">
              {order.project_number ? `${order.project_number} / ` : ""}#{order.order_number}
            </p>
          </div>
          <StatusBadge status={order.project_status || order.status} />
        </div>

        <p className="text-xs text-muted mb-4">
          {order.service} &mdash; {order.project}
          {order.package ? <span className="text-white/40"> ({order.package})</span> : null}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gold">{formatCurrency(order.total_ngn)}</span>
              <Badge variant={paymentVariant(order.payment_status)}>
                {paymentLabel(order.payment_status)}
              </Badge>
            </div>
            <p className="text-[11px] text-muted">Created {formatDate(order.created_at)}</p>
          </div>
          <span className="text-gold text-lg" aria-hidden="true">&rarr;</span>
        </div>
      </Link>
    </motion.div>
  );
}
