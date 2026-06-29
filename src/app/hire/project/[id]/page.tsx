"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, type ServiceOrderDetailData } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatDate, formatCurrency } from "@/lib/utils";

const TABS = ["Overview", "Timeline", "Team", "Files", "Messages", "Payments", "Activity"] as const;

const STATUS_STAGES = [
  "Lead",
  "Discovery",
  "Proposal",
  "Approved",
  "Development",
  "Testing",
  "Deployment",
  "Completed",
] as const;

function getStatusIndex(status: string): number {
  const idx = STATUS_STAGES.findIndex((s) => s.toLowerCase() === status.toLowerCase());
  return idx >= 0 ? idx : -1;
}

function getPaymentBadgeVariant(status: string): "gold" | "success" | "error" | "info" {
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
}

function getStatusBadgeVariant(status: string): "gold" | "success" | "error" | "info" {
  const map: Record<string, "gold" | "success" | "error" | "info"> = {
    draft: "info",
    active: "gold",
    in_progress: "gold",
    completed: "success",
    cancelled: "error",
    Lead: "info",
    Discovery: "gold",
    Proposal: "gold",
    Approved: "success",
    Development: "gold",
    Testing: "gold",
    Deployment: "gold",
  };
  return map[status] || "info";
}

export default function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<ServiceOrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Overview");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api
      .getServiceOrder(id)
      .then((res) => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Failed to load project");
        setLoading(false);
      });
  }, [id]);

  const scrollTo = useCallback((tab: (typeof TABS)[number]) => {
    setActiveTab(tab);
    const el = sectionRefs.current[tab];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const handles = TABS.map((tab) => {
      const el = sectionRefs.current[tab];
      if (!el) return null;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveTab(tab);
            }
          });
        },
        { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
      return observer;
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [order]);

  const projectName: string =
    String((order?.metadata as Record<string, unknown>)?.project_name || "") || order?.order_number || "Project";

  const statusIdx = order ? getStatusIndex(order.status) : -1;

  const teamAssignments = (order?.teamAssignments || []) as {
    id: string;
    role: string;
    teamMember: {
      id: string;
      title: string;
      avatar_url: string | null;
      user: {
        profile: { full_name: string | null; avatar_url: string | null } | null;
      };
    };
  }[];

  const invoices = (order?.invoices || []) as {
    id?: string;
    invoice_number?: string;
    amount_ngn?: number;
    status?: string;
    created_at?: string;
  }[];

  const payments = (order?.payments || []) as {
    id?: string;
    reference?: string;
    amount_ngn?: number;
    payment_gateway?: string;
    status?: string;
    created_at?: string;
  }[];

  const amountPaid = payments
    .filter((p) => p.status === "success" || p.status === "completed")
    .reduce((sum, p) => sum + (p.amount_ngn || 0), 0);
  const balance = order ? order.total_ngn - amountPaid : 0;

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-12 text-center max-w-md mx-auto">
          <div className="text-4xl mb-4" aria-hidden="true">&#9888;</div>
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load Project</h2>
          <p className="text-muted text-sm mb-6">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-12 text-center max-w-md mx-auto">
          <div className="text-4xl mb-4" aria-hidden="true">&#128270;</div>
          <h2 className="text-xl font-bold text-white mb-2">Project Not Found</h2>
          <p className="text-muted text-sm mb-6">This project doesn&apos;t exist or you don&apos;t have access.</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold transition-all duration-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-24 pb-20 min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors mb-4"
          >
            &larr; Back to Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{projectName}</h1>
            <Badge variant={getStatusBadgeVariant(order.status === "pending_payment" ? "pending" : order.status)}>
              {order.status === "pending_payment" ? "Pending Payment" : order.status.replace(/_/g, " ")}
            </Badge>
            <Badge variant={getPaymentBadgeVariant(order.payment_status)}>
              {order.payment_status === "partially_paid" ? "Deposit Paid" : order.payment_status.replace(/_/g, " ")}
            </Badge>
            <span className="text-xs text-muted font-mono">#{order.order_number}</span>
          </div>
        </motion.div>

        {/* Mobile tabs */}
        <div className="md:hidden overflow-x-auto mb-6 -mx-6 px-6">
          <div className="flex gap-2 min-w-max pb-2 border-b border-white/10">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => scrollTo(tab)}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "text-muted hover:text-white border border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <nav className="hidden md:flex flex-col gap-1 w-56 shrink-0">
            <div className="sticky top-28 space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => scrollTo(tab)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-gold/10 text-gold border-l-2 border-gold"
                      : "text-muted hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-12">
            {TABS.map((tab) => (
              <div
                key={tab}
                ref={(el) => { sectionRefs.current[tab] = el; }}
                id={`section-${tab.toLowerCase().replace(/\s+/g, "-")}`}
                className="scroll-mt-28"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl font-bold text-white mb-6 hidden md:block">{tab}</h2>
                  {renderTabContent(tab)}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  function renderTabContent(tab: (typeof TABS)[number]) {
    switch (tab) {
      case "Overview": return <OverviewSection />;
      case "Timeline": return <TimelineSection />;
      case "Team": return <TeamSection />;
      case "Files": return <FilesSection />;
      case "Messages": return <MessagesSection />;
      case "Payments": return <PaymentsSection />;
      case "Activity": return <ActivitySection />;
    }
  }

  function OverviewSection() {
    const data = order!;
    return (
      <div className="space-y-6">
        {/* Service & Package info */}
        <div className="glass rounded-2xl p-6 md:p-8">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Service &amp; Package</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted">Service</span>
              <p className="text-white font-medium mt-0.5">{data.service.title}</p>
            </div>
            <div>
              <span className="text-muted">Project Type</span>
              <p className="text-white font-medium mt-0.5">{data.projectType.title}</p>
            </div>
            <div>
              <span className="text-muted">Package</span>
              <p className="text-white font-medium mt-0.5">{data.package.name}</p>
            </div>
            <div>
              <span className="text-muted">Total Amount</span>
              <p className="text-gold font-bold mt-0.5 text-lg">{formatCurrency(data.total_ngn)}</p>
            </div>
          </div>
        </div>

        {/* Add-ons */}
        {data.addOns && data.addOns.length > 0 && (
          <div className="glass rounded-2xl p-6 md:p-8">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Add-Ons</h3>
            <div className="space-y-2">
              {data.addOns.map((addon) => (
                <div key={addon.id} className="flex justify-between text-sm py-1">
                  <span className="text-white">{addon.name}</span>
                  <span className="text-gold">{formatCurrency(addon.price_ngn)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing info */}
        {data.billing_details && Object.keys(data.billing_details).length > 0 && (
          <div className="glass rounded-2xl p-6 md:p-8">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Billing Information</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {Object.entries(data.billing_details as Record<string, unknown>).filter(([, val]) => val).map(([key, val]) => (
                <div key={key}>
                  <span className="text-muted capitalize">{key.replace(/_/g, " ")}</span>
                  <p className="text-white mt-0.5">{String(val)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="glass rounded-2xl p-6 md:p-8">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <Link
              href={`/hire/discovery-call`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm text-white font-medium"
            >
              <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-base">&#128222;</span>
              Schedule Discovery Call
            </Link>
            <Link
              href={`/proposals`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm text-white font-medium"
            >
              <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-base">&#128196;</span>
              View Proposals
            </Link>
            <Link
              href={`/hire/${data.service.slug}/${data.projectType.slug}/requirements`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm text-white font-medium"
            >
              <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-base">&#128221;</span>
              View Requirements
            </Link>
          </div>
        </div>

        {/* Status pipeline */}
        <div className="glass rounded-2xl p-6 md:p-8">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-6">Project Pipeline</h3>
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {STATUS_STAGES.map((stage, idx) => {
              const isCompleted = statusIdx >= idx;
              const isCurrent = statusIdx === idx;
              return (
                <div key={stage} className="flex items-center shrink-0">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                      isCurrent
                        ? "bg-gold/15 text-gold border border-gold/30 shadow-gold/20"
                        : isCompleted
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-white/5 text-muted border border-white/5"
                    }`}
                  >
                    {isCompleted && !isCurrent && <span className="text-green-400">&#10003;</span>}
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />}
                    {stage}
                  </div>
                  {idx < STATUS_STAGES.length - 1 && (
                    <div
                      className={`w-6 h-px mx-1 ${
                        isCompleted && idx < statusIdx ? "bg-green-500/40" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function TimelineSection() {
    const data = order!;
    const statusHistory = STATUS_STAGES.map((stage, idx) => ({
      stage,
      date: idx === 0 ? data.created_at : null,
      isReached: statusIdx >= idx,
      isCurrent: statusIdx === idx,
    }));

    return (
      <div className="space-y-6">
        <div className="glass rounded-2xl p-6 md:p-8">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Created</h3>
          <p className="text-white font-medium">{formatDate(data.created_at)}</p>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-6">Status History</h3>
          <div className="relative pl-8 space-y-0">
            {statusHistory.map((entry, idx) => (
              <div key={entry.stage} className="relative pb-8 last:pb-0">
                {/* Connecting line */}
                {idx < statusHistory.length - 1 && (
                  <div
                    className={`absolute left-[11px] top-4 bottom-0 w-0.5 ${
                      entry.isReached && statusHistory[idx + 1]?.isReached
                        ? "bg-green-500/40"
                        : "bg-white/10"
                    }`}
                  />
                )}
                {/* Dot */}
                <div
                  className={`absolute left-0 top-1 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${
                    entry.isCurrent
                      ? "border-gold bg-gold/20"
                      : entry.isReached
                        ? "border-green-500 bg-green-500/20"
                        : "border-white/10 bg-white/5"
                  }`}
                >
                  {entry.isReached && !entry.isCurrent && (
                    <span className="text-green-400 text-xs">&#10003;</span>
                  )}
                  {entry.isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  )}
                </div>
                {/* Content */}
                <div className="ml-4">
                  <p
                    className={`text-sm font-medium ${
                      entry.isReached ? "text-white" : "text-muted/50"
                    }`}
                  >
                    {entry.stage}
                  </p>
                  {entry.date && (
                    <p className="text-xs text-muted mt-0.5">{formatDate(entry.date)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function TeamSection() {
    if (teamAssignments.length === 0) {
      return (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4" aria-hidden="true">&#128101;</div>
          <h3 className="text-lg font-bold text-white mb-2">Team Being Assigned</h3>
          <p className="text-muted text-sm">
            We&apos;re currently putting together the best team for your project. You&apos;ll be notified once they&apos;re assigned.
          </p>
        </div>
      );
    }

    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamAssignments.map((a) => {
          const name = a.teamMember.user.profile?.full_name || "Team Member";
          const role = a.role || a.teamMember.title || "Team Member";
          const avatar = a.teamMember.avatar_url || a.teamMember.user.profile?.avatar_url;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-xl p-5 flex items-center gap-4 hover:border-gold/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-sm shrink-0 overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-white font-medium text-sm truncate">{name}</p>
                <p className="text-xs text-muted truncate">{role}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  function FilesSection() {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="text-4xl mb-4" aria-hidden="true">&#128193;</div>
        <h3 className="text-lg font-bold text-white mb-2">Project Files</h3>
        <p className="text-muted text-sm">
          Files and documents shared for this project will appear here once available.
        </p>
      </div>
    );
  }

  function MessagesSection() {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="text-4xl mb-4" aria-hidden="true">&#128172;</div>
        <h3 className="text-lg font-bold text-white mb-2">Messages</h3>
        <p className="text-muted text-sm">
          Direct messages and project communication will be available here soon.
        </p>
      </div>
    );
  }

  function PaymentsSection() {
    const data = order!;
    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="glass rounded-2xl p-6 md:p-8">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Payment Summary</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-xs text-muted mb-1">Total</div>
              <div className="text-xl font-bold text-white">{formatCurrency(data.total_ngn)}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-xs text-muted mb-1">Paid</div>
              <div className="text-xl font-bold text-green-400">{formatCurrency(amountPaid)}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-xs text-muted mb-1">Outstanding</div>
              <div className="text-xl font-bold text-gold">{formatCurrency(balance)}</div>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="glass rounded-2xl p-6 md:p-8">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Invoices</h3>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted">No invoices available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted border-b border-white/10">
                    <th className="text-left pb-3 font-medium">Invoice #</th>
                    <th className="text-left pb-3 font-medium">Amount</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => (
                    <tr key={inv.id || i} className="border-b border-white/5">
                      <td className="py-3 text-white font-mono">{inv.invoice_number || "&mdash;"}</td>
                      <td className="py-3 text-white">{formatCurrency(inv.amount_ngn || 0)}</td>
                      <td className="py-3">
                        <Badge variant={getPaymentBadgeVariant(inv.status || "")}>
                          {inv.status || "&mdash;"}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted">{inv.created_at ? formatDate(inv.created_at) : "&mdash;"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment history */}
        <div className="glass rounded-2xl p-6 md:p-8">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Payment History</h3>
          {payments.length === 0 ? (
            <p className="text-sm text-muted">No payments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted border-b border-white/10">
                    <th className="text-left pb-3 font-medium">Reference</th>
                    <th className="text-left pb-3 font-medium">Amount</th>
                    <th className="text-left pb-3 font-medium">Gateway</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={p.id || i} className="border-b border-white/5">
                      <td className="py-3 text-white font-mono text-xs">{p.reference || "&mdash;"}</td>
                      <td className="py-3 text-white">{formatCurrency(p.amount_ngn || 0)}</td>
                      <td className="py-3 text-muted capitalize">{p.payment_gateway || "&mdash;"}</td>
                      <td className="py-3">
                        <Badge variant={getPaymentBadgeVariant(p.status || "")}>
                          {p.status || "&mdash;"}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted">{p.created_at ? formatDate(p.created_at) : "&mdash;"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  function ActivitySection() {
    const data = order!;
    const activityEntries = [
      { action: "Order created", timestamp: data.created_at, type: "created" },
      { action: `Status changed to ${data.status}`, timestamp: data.created_at, type: "status" },
    ];

    return (
      <div className="glass rounded-2xl p-6 md:p-8">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Activity Log</h3>
        {activityEntries.length === 0 ? (
          <p className="text-sm text-muted">No activity recorded yet.</p>
        ) : (
          <div className="space-y-0">
            {activityEntries.map((entry, idx) => (
              <div key={idx} className="flex gap-4 pb-6 last:pb-0 relative">
                {idx < activityEntries.length - 1 && (
                  <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-white/10" />
                )}
                <div className="w-[14px] h-[14px] rounded-full border-2 border-gold/30 bg-gold/10 shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-white">{entry.action}</p>
                  <p className="text-xs text-muted mt-0.5">{formatDate(entry.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
