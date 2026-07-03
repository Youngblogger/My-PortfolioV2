"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { StatsCard, AdminPageHeader } from "@/components/admin";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface DashboardStats {
  total_clients?: number;
  total_students?: number;
  active_projects?: number;
  pending_proposals?: number;
  completed_projects?: number;
  pending_payments?: number;
  monthly_revenue?: number;
  academy_enrollments?: number;
  total_orders?: number;
  pending_calls?: number;
  revenue_ngn?: number;
  leads?: number;
  [key: string]: number | undefined;
}

interface RecentProposal {
  id: string;
  proposal_number: string;
  client: string;
  service: string;
  status: string;
  total_ngn: number;
  created_at: string;
}

interface RecentPayment {
  id: string;
  reference: string;
  client: string;
  amount_ngn: number;
  status: string;
  created_at: string;
}

interface RecentRegistration {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

interface RecentOrder {
  id: string;
  order_number: string;
  client: string;
  service: string;
  status: string;
  payment_status: string;
  total_ngn: number;
  created_at: string;
}

interface DashboardData {
  stats: DashboardStats;
  orders_by_status: Record<string, number>;
  recent_orders: RecentOrder[];
  recent_proposals?: RecentProposal[];
  recent_payments?: RecentPayment[];
  recent_registrations?: RecentRegistration[];
}

interface MonthlyDataPoint {
  month: string;
  amount?: number;
  count?: number;
}

interface AnalyticsData {
  monthly_revenue?: MonthlyDataPoint[];
  enrollment_trends?: MonthlyDataPoint[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-600" },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700" },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", color: "bg-orange-100 text-orange-700" },
  paid: { label: "Paid", color: "bg-green-100 text-green-700" },
  unpaid: { label: "Unpaid", color: "bg-red-100 text-red-700" },
  partial: { label: "Partial", color: "bg-yellow-100 text-yellow-700" },
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  development: "Development",
  testing: "Testing",
  completed: "Completed",
  cancelled: "Cancelled",
  on_hold: "On Hold",
};

function formatNgn(amount: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
}

function statusBadge(status: string) {
  const cfg = statusConfig[status] || { label: status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), color: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Icons = {
  clients: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  students: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
    </svg>
  ),
  projects: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  ),
  proposals: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  completed: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  payments: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  revenue: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  enrollments: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
    </svg>
  ),
  currency: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 1 0 0 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
};

const statCardsConfig = [
  { key: "total_clients", label: "Total Clients", icon: Icons.clients },
  { key: "total_students", label: "Total Students", icon: Icons.students },
  { key: "active_projects", label: "Active Projects", icon: Icons.projects },
  { key: "pending_proposals", label: "Pending Proposals", icon: Icons.proposals },
  { key: "completed_projects", label: "Completed Projects", icon: Icons.completed },
  { key: "pending_payments", label: "Pending Payments", icon: Icons.payments },
  { key: "monthly_revenue", label: "Monthly Revenue", icon: Icons.revenue, isCurrency: true },
  { key: "academy_enrollments", label: "Academy Enrollments", icon: Icons.enrollments },
];

const fallbackStatKeys: Record<string, string> = {
  total_clients: "total_orders",
  total_students: "enrollments",
  active_projects: "active_projects",
  pending_proposals: "pending_proposals",
  completed_projects: "completed_projects",
  pending_payments: "pending_payments",
  monthly_revenue: "revenue_ngn",
  academy_enrollments: "academy_enrollments",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const [dashboardRes, analyticsRes] = await Promise.all([
        fetch("/api/v1/admin/dashboard", { headers, credentials: "include" }),
        fetch("/api/v1/admin/analytics", { headers, credentials: "include" }).catch(() => null),
      ]);

      if (!dashboardRes.ok) {
        const err = await dashboardRes.json().catch(() => ({}));
        throw new Error(err.error || err.message || `Request failed (${dashboardRes.status})`);
      }

      const dashboardJson = await dashboardRes.json();
      const analyticsJson = analyticsRes?.ok ? await analyticsRes.json() : null;

      setData(dashboardJson.data || dashboardJson);
      setAnalytics(analyticsJson?.data || analyticsJson);
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
          <div className="animate-pulse bg-gray-200 rounded-lg h-8 w-64" />
          <div className="animate-pulse bg-gray-200 rounded-lg h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <StatsCard key={i} label="" value="" loading />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="portal-card p-6 space-y-4">
              <div className="animate-pulse bg-gray-200 rounded-lg h-6 w-48" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="animate-pulse bg-gray-200 rounded-lg h-8 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="portal-card p-6 space-y-4">
              <div className="animate-pulse bg-gray-200 rounded-lg h-6 w-48" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="animate-pulse bg-gray-200 rounded-lg h-10 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="animate-pulse bg-gray-200 rounded-2xl h-20 w-full" />
      </motion.div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Dashboard"
        message={error}
        onRetry={fetchData}
      />
    );
  }

  if (!data) return null;

  const stats = data.stats || {};
  const ordersByStatus = data.orders_by_status || {};
  const maxStatusValue = Math.max(...Object.values(ordersByStatus), 1);

  const revenueData = analytics?.monthly_revenue || [];
  const enrollmentTrends = analytics?.enrollment_trends || [];
  const maxRevenue = Math.max(...revenueData.map((d) => d.amount || 0), 1);
  const maxEnrollments = Math.max(...enrollmentTrends.map((d) => d.count || 0), 1);

  const recentProposals = data.recent_proposals || [];
  const recentPayments = data.recent_payments || [];
  const recentRegistrations = data.recent_registrations || [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <AdminPageHeader
        title="Dashboard"
        description="Overview of your business performance and recent activity."
      />

      {/* Row 1 — Stat Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCardsConfig.map((stat) => {
          let value = stats[stat.key];
          if (value === undefined && fallbackStatKeys[stat.key]) {
            value = stats[fallbackStatKeys[stat.key]];
          }
          const display = stat.isCurrency ? formatNgn(value ?? 0) : String(value ?? 0);
          return (
            <StatsCard
              key={stat.key}
              icon={stat.icon}
              label={stat.label}
              value={display}
            />
          );
        })}
      </motion.div>

      {/* Row 2 — Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Overview */}
        <motion.div variants={itemVariants} className="portal-card p-6">
          <h2 className="text-lg font-semibold text-[#101828] mb-4">Revenue Overview</h2>
          {revenueData.length === 0 ? (
            <p className="text-sm text-[#667085]">No revenue data available.</p>
          ) : (
            <div className="flex items-end justify-between gap-2 h-48">
              {revenueData.map((item, i) => {
                const height = ((item.amount || 0) / maxRevenue) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] text-[#5B4CF0] font-medium">
                      {item.amount ? formatNgn(item.amount) : ""}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                      className="w-full max-w-[40px] portal-primary-bg rounded-t-md"
                      style={{ minHeight: height > 0 ? undefined : 0 }}
                    />
                    <span className="text-[10px] text-[#667085] truncate w-full text-center">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Orders by Status */}
        <motion.div variants={itemVariants} className="portal-card p-6">
          <h2 className="text-lg font-semibold text-[#101828] mb-4">Orders by Status</h2>
          {Object.keys(ordersByStatus).length === 0 ? (
            <p className="text-sm text-[#667085]">No order data available.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-sm text-[#667085] w-24 shrink-0">
                    {statusLabels[status] || status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                  <div className="flex-1 h-6 bg-[#ECEFF5] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxStatusValue) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full portal-primary-bg rounded-full"
                    />
                  </div>
                  <span className="text-sm font-semibold text-[#101828] w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Enrollment Trends */}
        <motion.div variants={itemVariants} className="portal-card p-6">
          <h2 className="text-lg font-semibold text-[#101828] mb-4">Enrollment Trends</h2>
          {enrollmentTrends.length === 0 ? (
            <p className="text-sm text-[#667085]">No enrollment data available.</p>
          ) : (
            <div className="flex items-end justify-between gap-2 h-48">
              {enrollmentTrends.map((item, i) => {
                const height = ((item.count || 0) / maxEnrollments) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] text-[#5B4CF0] font-medium">{item.count || 0}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                      className="w-full max-w-[40px] portal-primary-bg rounded-t-md"
                      style={{ minHeight: height > 0 ? undefined : 0 }}
                    />
                    <span className="text-[10px] text-[#667085] truncate w-full text-center">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Row 3 — Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Latest Proposals */}
        <motion.div variants={itemVariants} className="portal-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#101828]">Latest Proposals</h2>
            <Link href="/admin/proposals" className="text-xs text-[#5B4CF0] hover:text-[#5B4CF0]/80 transition-colors">
              View all
            </Link>
          </div>
          {recentProposals.length === 0 ? (
            <p className="text-sm text-[#667085]">No proposals yet.</p>
          ) : (
            <div className="space-y-3">
              {recentProposals.slice(0, 5).map((proposal, i) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-2 border-b border-[#ECEFF5] last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#101828] font-medium truncate">{proposal.client}</p>
                    <p className="text-xs text-[#667085] truncate">{proposal.service}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    {statusBadge(proposal.status)}
                    <span className="text-xs text-[#667085]">{formatDate(proposal.created_at)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Latest Payments */}
        <motion.div variants={itemVariants} className="portal-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#101828]">Latest Payments</h2>
            <Link href="/admin/payments" className="text-xs text-[#5B4CF0] hover:text-[#5B4CF0]/80 transition-colors">
              View all
            </Link>
          </div>
          {recentPayments.length === 0 ? (
            <p className="text-sm text-[#667085]">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {recentPayments.slice(0, 5).map((payment, i) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-2 border-b border-[#ECEFF5] last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#101828] font-medium truncate">{payment.reference}</p>
                    <p className="text-xs text-[#667085] truncate">{payment.client}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-sm font-semibold text-[#101828]">{formatNgn(payment.amount_ngn)}</span>
                    {statusBadge(payment.status)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Latest Registrations */}
        <motion.div variants={itemVariants} className="portal-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#101828]">Latest Registrations</h2>
            <Link href="/admin/clients" className="text-xs text-[#5B4CF0] hover:text-[#5B4CF0]/80 transition-colors">
              View all
            </Link>
          </div>
          {recentRegistrations.length === 0 ? (
            <p className="text-sm text-[#667085]">No recent registrations.</p>
          ) : (
            <div className="space-y-3">
              {recentRegistrations.slice(0, 5).map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-2 border-b border-[#ECEFF5] last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#101828] font-medium truncate">{user.full_name || "Unknown"}</p>
                    <p className="text-xs text-[#667085] truncate">{user.email}</p>
                  </div>
                  <span className="text-xs text-[#667085] shrink-0 ml-3">{formatDate(user.created_at)}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Row 4 — Quick Actions */}
      <motion.div variants={itemVariants} className="portal-card p-6">
        <h2 className="text-lg font-semibold text-[#101828] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/proposals/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B4CF0]/10 text-[#5B4CF0] border border-[#5B4CF0]/20 hover:bg-[#5B4CF0]/20 transition-all duration-300 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Proposal
          </Link>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all duration-300 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
            </svg>
            New Project
          </Link>
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 transition-all duration-300 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            View Analytics
          </Link>
          <Link
            href="/admin/clients"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-all duration-300 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            View All Clients
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-[#667085] border border-[#ECEFF5] hover:bg-gray-200 hover:text-[#101828] transition-all duration-300 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
