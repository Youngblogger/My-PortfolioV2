"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ListPageSkeleton } from "@/components/ui/PageSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ProposalListItemData } from "@/lib/api";

const statusFilters = ["all", "draft", "sent", "viewed", "approved", "rejected"] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<ProposalListItemData[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <span className="section-label">PROPOSALS</span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#101828] mt-2">
            Project Proposals
          </h1>
          <p className="text-[#98A2B3] mt-2">Review and manage all project proposals.</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#ECEFF5] pb-4">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === filter
                  ? "text-[#5B4CF0] bg-[#5B4CF0]/10"
                  : "text-[#98A2B3] hover:text-[#101828]"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <ListPageSkeleton />
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] p-12 text-center">
            <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
            <h3 className="text-lg font-bold text-[#101828] mb-2">Failed to Load Proposals</h3>
            <p className="text-[#98A2B3] text-sm mb-6">{error}</p>
            <button
              onClick={() => setActiveFilter(activeFilter)}
              className="px-6 py-3 rounded-xl bg-[#5B4CF0] text-white font-semibold hover:shadow-[0_4px_14px_0_rgba(91,76,240,0.4)] transition-all"
            >
              Retry
            </button>
          </div>
        ) : proposals.length === 0 ? (
          <EmptyState
            icon="📄"
            title="No proposals yet"
            description="Proposals will appear here once they are created from service orders."
            action={{ label: "Start a Project", href: "/hire" }}
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {proposals.map((proposal) => (
              <motion.div key={proposal.id} variants={cardVariants}>
                <Link
                  href={`/proposals/${proposal.id}`}
                  className="block bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] hover:shadow-[0_15px_45px_rgba(16,24,40,0.1)] hover:border-[#5B4CF0]/20 transition-all p-6 h-full"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[#101828] font-bold text-sm">
                      {proposal.proposal_number}
                    </span>
                    <StatusBadge status={proposal.status} />
                  </div>

                  <div className="mb-4">
                    <p className="text-[#98A2B3] text-xs">
                      {proposal.service} &mdash; {proposal.project}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#ECEFF5] space-y-1">
                    <p className="text-xl font-bold text-[#5B4CF0]">
                      {formatCurrency(proposal.total_ngn)}
                    </p>
                    {proposal.valid_until && (
                      <p className="text-xs text-[#98A2B3]">
                        Valid until {formatDate(proposal.valid_until)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-[#98A2B3]">
                      <span>v{proposal.version}</span>
                      <span>&middot;</span>
                      <span>{formatDate(proposal.created_at)}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
