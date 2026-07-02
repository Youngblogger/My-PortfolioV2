"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, type ServiceOrderListItem } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const statCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const statusColors: Record<string, string> = {
  lead: "#F59E0B",
  discovery: "#3B82F6",
  proposal: "#8B5CF6",
  approved: "#22C55E",
  development: "#5B4CF0",
  testing: "#F59E0B",
  deployment: "#3B82F6",
  completed: "#22C55E",
};

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ServiceOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const activeProjects = orders.filter((o) => ["active", "in_progress", "development", "testing", "deployment"].includes(o.status));
  const completedProjects = orders.filter((o) => ["completed", "approved"].includes(o.status));
  const pendingInvoices = orders.filter((o) => o.payment_status === "pending" || o.payment_status === "pending_payment" || o.payment_status === "partially_paid");
  const unreadMessages = 0; // Would come from API

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-8 w-64 rounded-lg bg-[#ECEFF5] animate-pulse mb-2" />
          <div className="h-5 w-96 rounded-lg bg-[#ECEFF5] animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="portal-card p-5 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-[#ECEFF5] animate-pulse" />
              <div className="h-8 w-20 rounded-lg bg-[#ECEFF5] animate-pulse" />
              <div className="h-4 w-28 rounded-lg bg-[#ECEFF5] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portal-card p-8 text-center max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#FEF2F2" }}>
          <svg className="w-7 h-7" style={{ color: "#EF4444" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-1" style={{ color: "#101828" }}>Failed to Load Dashboard</h3>
        <p className="text-sm mb-6" style={{ color: "#667085" }}>{error}</p>
        <button
          onClick={load}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "#5B4CF0" }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "#101828" }}>
          Welcome back, Client
        </h1>
        <p className="text-sm mt-1" style={{ color: "#667085" }}>
          Here&apos;s an overview of your projects and account.
        </p>
      </motion.div>

      {/* Top Statistics */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
      >
        <StatCard
          i={0}
          icon={
            <svg className="w-5 h-5" style={{ color: "#5B4CF0" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          }
          value={activeProjects.length.toString()}
          label="Active Projects"
          action={{ text: "View All", href: "/proposals" }}
        />
        <StatCard
          i={1}
          icon={
            <svg className="w-5 h-5" style={{ color: "#22C55E" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          value={completedProjects.length.toString()}
          label="Completed Milestones"
          action={{ text: "View Details", href: "/proposals" }}
        />
        <StatCard
          i={2}
          icon={
            <svg className="w-5 h-5" style={{ color: "#F59E0B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          }
          value={formatCurrency(pendingInvoices.reduce((s, o) => s + (o.total_ngn || 0), 0))}
          label="Outstanding Invoice"
          action={{ text: "Pay Now", href: "/payments" }}
        />
        <StatCard
          i={3}
          icon={
            <svg className="w-5 h-5" style={{ color: "#3B82F6" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          }
          value={unreadMessages.toString()}
          label="Unread Messages"
          action={{ text: "View Messages", href: "/messages" }}
        />
      </motion.div>

      {/* Active Projects */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: "#101828" }}>Active Projects</h2>
          <Link href="/proposals" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "#5B4CF0" }}>
            View All
          </Link>
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          {activeProjects.length === 0 ? (
            <div className="portal-card p-8 text-center lg:col-span-2">
              <p className="text-sm" style={{ color: "#98A2B3" }}>No active projects at the moment.</p>
            </div>
          ) : (
            activeProjects.slice(0, 4).map((order) => (
              <ProjectCard key={order.id} order={order} />
            ))
          )}
        </div>
      </motion.div>

      {/* Bottom Row: Recent Activity + Outstanding Invoice + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent Activity */}
        <motion.div
          variants={fadeUp}
          className="portal-card p-6"
        >
          <h3 className="text-base font-bold mb-5" style={{ color: "#101828" }}>Recent Activity</h3>
          {orders.length === 0 ? (
            <p className="text-sm" style={{ color: "#98A2B3" }}>No recent activity.</p>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 4).map((order, i) => (
                <div key={order.id} className="flex items-start gap-3">
                  <div className="relative flex flex-col items-center">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${statusColors[order.status] || "#5B4CF0"}15` }}
                    >
                      <svg className="w-4 h-4" style={{ color: statusColors[order.status] || "#5B4CF0" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </div>
                    {i < Math.min(orders.length, 4) - 1 && (
                      <div className="w-px flex-1 my-1" style={{ backgroundColor: "#ECEFF5" }} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-4">
                    <p className="text-sm font-medium truncate" style={{ color: "#101828" }}>
                      {order.project_name || order.project}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#98A2B3" }}>
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Outstanding Invoice */}
        <motion.div
          variants={fadeUp}
          className="portal-card p-6"
        >
          <h3 className="text-base font-bold mb-5" style={{ color: "#101828" }}>Outstanding Invoice</h3>
          {pendingInvoices.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "#F0FDF4" }}>
                <svg className="w-6 h-6" style={{ color: "#22C55E" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: "#101828" }}>All caught up!</p>
              <p className="text-xs mt-1" style={{ color: "#98A2B3" }}>No pending invoices</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInvoices.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-[#ECEFF5] last:border-0">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#101828" }}>#{order.order_number}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#98A2B3" }}>Due: {formatDate(order.created_at)}</p>
                  </div>
                  <p className="text-sm font-bold" style={{ color: "#F59E0B" }}>{formatCurrency(order.total_ngn)}</p>
                </div>
              ))}
              <Link
                href="/payments"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 mt-2"
                style={{ backgroundColor: "#5B4CF0" }}
              >
                Pay Now
              </Link>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={fadeUp}
          className="portal-card p-6"
        >
          <h3 className="text-base font-bold mb-5" style={{ color: "#101828" }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              }
              label="Send Message"
              href="/messages"
            />
            <QuickAction
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              }
              label="View Invoices"
              href="/payments"
            />
            <QuickAction
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              }
              label="Upload File"
              href="/downloads"
            />
            <QuickAction
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              }
              label="Request Support"
              href="mailto:admin@codemafia.ng"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  i,
  icon,
  value,
  label,
  action,
}: {
  i: number;
  icon: React.ReactNode;
  value: string;
  label: string;
  action: { text: string; href: string };
}) {
  return (
    <motion.div
      custom={i}
      variants={statCardVariants}
      className="portal-card p-5 flex flex-col"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: "#F7F9FC" }}
      >
        {icon}
      </div>
      <p className="text-2xl font-extrabold mb-1" style={{ color: "#101828" }}>
        {value}
      </p>
      <p className="text-xs mb-3" style={{ color: "#667085" }}>{label}</p>
      <Link
        href={action.href}
        className="text-xs font-medium mt-auto transition-colors hover:opacity-80"
        style={{ color: "#5B4CF0" }}
      >
        {action.text} &rarr;
      </Link>
    </motion.div>
  );
}

function QuickAction({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  const cls = "flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all duration-200 hover:scale-[1.02]";
  const style = { borderColor: "#ECEFF5" as const, backgroundColor: "#F7F9FC" as const };

  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={cls} style={style}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FFFFFF" }}>
          <span style={{ color: "#5B4CF0" }}>{icon}</span>
        </div>
        <span className="text-xs font-medium" style={{ color: "#101828" }}>{label}</span>
      </a>
    );
  }

  return (
    <Link href={href} className={cls} style={style}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FFFFFF" }}>
        <span style={{ color: "#5B4CF0" }}>{icon}</span>
      </div>
      <span className="text-xs font-medium" style={{ color: "#101828" }}>{label}</span>
    </Link>
  );
}

function ProjectCard({ order }: { order: ServiceOrderListItem }) {
  return (
    <motion.div variants={fadeUp}>
      <Link
        href={`/hire/project/${order.id}`}
        className="block portal-card p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#F7F9FC" }}
            >
              <svg className="w-5 h-5" style={{ color: "#5B4CF0" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate" style={{ color: "#101828" }}>
                {order.project_name || order.project}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "#667085" }}>
                {order.service}
              </p>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium" style={{ color: "#667085" }}>Progress</span>
            <span className="text-xs font-bold" style={{ color: "#5B4CF0" }}>
              {order.status === "completed" ? "100" : order.status === "development" ? "65" : order.status === "testing" ? "85" : order.status === "deployment" ? "95" : "30"}%
            </span>
          </div>
          <div className="h-2 rounded-full w-full" style={{ backgroundColor: "#ECEFF5" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${order.status === "completed" ? "100" : order.status === "development" ? "65" : order.status === "testing" ? "85" : order.status === "deployment" ? "95" : "30"}%`,
                backgroundColor: "#5B4CF0",
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "#ECEFF5" }}>
          <p className="text-xs" style={{ color: "#98A2B3" }}>
            {formatDate(order.created_at)}
          </p>
          <p className="text-sm font-bold" style={{ color: "#5B4CF0" }}>
            {formatCurrency(order.total_ngn)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, { bg: string; text: string; label: string }> = {
    lead: { bg: "#FEF3C7", text: "#92400E", label: "Lead" },
    discovery: { bg: "#DBEAFE", text: "#1E40AF", label: "Discovery" },
    proposal: { bg: "#EDE9FE", text: "#5B21B6", label: "Proposal" },
    approved: { bg: "#DCFCE7", text: "#166534", label: "Approved" },
    active: { bg: "#DCFCE7", text: "#166534", label: "Active" },
    in_progress: { bg: "#DBEAFE", text: "#1E40AF", label: "In Progress" },
    development: { bg: "#EEF2FF", text: "#3730A3", label: "Development" },
    testing: { bg: "#FEF3C7", text: "#92400E", label: "Testing" },
    deployment: { bg: "#DBEAFE", text: "#1E40AF", label: "Deployment" },
    completed: { bg: "#DCFCE7", text: "#166534", label: "Completed" },
  };
  const config = colorMap[status] || { bg: "#F3F4F6", text: "#374151", label: status };

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize whitespace-nowrap shrink-0"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}
