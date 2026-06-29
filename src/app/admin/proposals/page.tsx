"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ProposalListItemData } from "@/lib/api";

const statusFilters = ["all", "draft", "sent", "viewed", "approved", "rejected"] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function AdminProposalsPage() {
  const [proposals, setProposals] = useState<ProposalListItemData[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const filterParam = activeFilter === "all" ? undefined : activeFilter;
        const res = await api.getProposals(filterParam);
        if (!mounted) return;
        setProposals(res.data || []);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load proposals");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [activeFilter]);

  async function handleStatusChange(proposalId: string, newStatus: string) {
    setUpdatingId(proposalId);
    try {
      await api.updateProposalStatus(proposalId, newStatus);
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, status: newStatus } : p
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="section-label">PROPOSALS</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">
            Manage Proposals
          </h1>
          <p className="text-muted text-sm mt-1">
            Create, review and manage all project proposals.
          </p>
        </div>
        <Link href="/admin/proposals/create">
          <Button icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }>
            Create Proposal
          </Button>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "text-sm font-medium px-3 py-1.5 rounded-lg transition-all",
              activeFilter === filter
                ? "text-gold bg-gold/10"
                : "text-muted hover:text-white"
            )}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-white mb-2">Failed to Load Proposals</h3>
          <p className="text-muted text-sm mb-6">{error}</p>
          <Button onClick={() => setActiveFilter(activeFilter)}>Retry</Button>
        </div>
      ) : proposals.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-xl font-bold text-white mb-2">No proposals found</h3>
          <p className="text-muted text-sm mb-6 max-w-md mx-auto">
            {activeFilter === "all"
              ? "Proposals will appear here once they are created from service orders."
              : `No proposals with status "${activeFilter}". Try a different filter.`}
          </p>
          {activeFilter === "all" && (
            <Link href="/admin/proposals/create">
              <Button>Create Proposal</Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Table - Desktop */}
          <div className="hidden md:block glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Proposal #</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Service</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Project</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Total</th>
                    <th className="text-center text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Version</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Date</th>
                    <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {proposals.map((proposal) => (
                    <motion.tr
                      key={proposal.id}
                      variants={rowVariants}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/proposals/${proposal.id}`}
                          className="text-sm font-medium text-gold hover:text-gold-secondary transition-colors"
                        >
                          {proposal.proposal_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/80">{proposal.service}</td>
                      <td className="px-6 py-4 text-sm text-white/80">{proposal.project}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={proposal.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-white">
                        {formatCurrency(proposal.total_ngn)}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-muted">v{proposal.version}</td>
                      <td className="px-6 py-4 text-sm text-muted whitespace-nowrap">
                        {formatDate(proposal.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/proposals/${proposal.id}`}
                            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-muted hover:text-white hover:border-gold/30 transition-all"
                          >
                            View
                          </Link>
                          <select
                            value={proposal.status}
                            disabled={updatingId === proposal.id}
                            onChange={(e) => handleStatusChange(proposal.id, e.target.value)}
                            className="text-xs px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                          >
                            {statusFilters.filter((s) => s !== "all").map((s) => (
                              <option key={s} value={s} className="bg-surface text-white">
                                {s.charAt(0).toUpperCase() + s.slice(1)}
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
            {proposals.map((proposal) => (
              <motion.div
                key={proposal.id}
                variants={rowVariants}
                className="glass rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <Link
                    href={`/proposals/${proposal.id}`}
                    className="text-sm font-bold text-gold hover:text-gold-secondary transition-colors"
                  >
                    {proposal.proposal_number}
                  </Link>
                  <StatusBadge status={proposal.status} />
                </div>
                <div>
                  <p className="text-sm text-white/80">
                    {proposal.service} &mdash; {proposal.project}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <p className="text-lg font-bold text-gold">
                      {formatCurrency(proposal.total_ngn)}
                    </p>
                    <p className="text-xs text-muted">
                      v{proposal.version} &middot; {formatDate(proposal.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/proposals/${proposal.id}`}
                      className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-muted hover:text-white hover:border-gold/30 transition-all"
                    >
                      View
                    </Link>
                    <select
                      value={proposal.status}
                      disabled={updatingId === proposal.id}
                      onChange={(e) => handleStatusChange(proposal.id, e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                    >
                      {statusFilters.filter((s) => s !== "all").map((s) => (
                        <option key={s} value={s} className="bg-surface text-white">
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}
