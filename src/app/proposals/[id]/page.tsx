"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DetailPageSkeleton } from "@/components/ui/PageSkeleton";
import { Button } from "@/components/ui/Button";
import { ProposalStepper } from "@/components/proposals/ProposalStepper";
import type { ProposalDetailData } from "@/lib/api";

export default function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [proposal, setProposal] = useState<ProposalDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getProposal(id);
        if (!mounted) return;
        setProposal(res.data);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load proposal");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [id]);

  async function handleStatusUpdate(newStatus: string) {
    setActionLoading(newStatus);
    try {
      const res = await api.updateProposalStatus(id, newStatus);
      setProposal((prev) => prev ? { ...prev, status: res.data.status } : null);
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <DetailPageSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen py-20 px-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] p-12 text-center max-w-md">
          <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
          <h3 className="text-lg font-bold text-[#101828] mb-2">Failed to Load Proposal</h3>
          <p className="text-[#98A2B3] text-sm mb-6">{error}</p>
          <Button onClick={() => router.refresh()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen py-20 px-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] p-12 text-center max-w-md">
          <div className="text-4xl mb-4" aria-hidden="true">📄</div>
          <h3 className="text-lg font-bold text-[#101828] mb-2">Proposal Not Found</h3>
          <p className="text-[#98A2B3] text-sm mb-6">This proposal does not exist or has been removed.</p>
          <Link href="/proposals">
            <Button>Back to Proposals</Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = proposal.status.toLowerCase();
  const canAct = status === "sent" || status === "viewed";

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back + Header */}
        <div className="mb-8">
          <Link
            href="/proposals"
            className="inline-flex items-center gap-2 text-sm text-[#98A2B3] hover:text-[#101828] transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Proposals
          </Link>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-[#101828]">
                  {proposal.proposal_number}
                </h1>
                <StatusBadge status={proposal.status} />
                <span className="text-xs text-[#98A2B3] border border-[#ECEFF5] rounded-md px-2 py-0.5">
                  v{proposal.version}
                </span>
              </div>
              <p className="text-[#98A2B3] text-sm">
                {proposal.service.title} &mdash; {proposal.projectType.title}
              </p>
            </div>

            {canAct && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-[#5B4CF0]/40 text-[#5B4CF0] hover:bg-[#5B4CF0]/10"
                  onClick={() => handleStatusUpdate("revision_requested")}
                  loading={actionLoading === "revision_requested"}
                >
                  Request Revision
                </Button>
                <Button
                  variant="outline"
                  className="border-red-400/40 text-red-400 hover:bg-red-500/10"
                  onClick={() => handleStatusUpdate("rejected")}
                  loading={actionLoading === "rejected"}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleStatusUpdate("approved")}
                  loading={actionLoading === "approved"}
                >
                  Approve
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] p-6 mb-8">
          <ProposalStepper status={proposal.status} />
        </div>

        <div className="space-y-6">
          {/* Scope of Work */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] p-6"
          >
            <h2 className="text-sm font-semibold text-[#5B4CF0] mb-3 tracking-widest uppercase">Scope of Work</h2>
            <p className="text-[#101828] text-sm leading-relaxed whitespace-pre-wrap">{proposal.scope_of_work}</p>
          </motion.div>

          {/* Deliverables */}
          {proposal.deliverables.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] p-6"
            >
              <h2 className="text-sm font-semibold text-[#5B4CF0] mb-3 tracking-widest uppercase">Deliverables</h2>
              <ul className="space-y-2">
                {proposal.deliverables.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#101828]">
                    <svg className="w-4 h-4 text-[#5B4CF0] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Included Features */}
          {proposal.included_features && proposal.included_features.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] p-6"
            >
              <h2 className="text-sm font-semibold text-green-400 mb-3 tracking-widest uppercase">Included</h2>
              <ul className="space-y-2">
                {proposal.included_features.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#101828]">
                    <svg className="w-4 h-4 text-green-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Excluded Items */}
          {proposal.excluded_items && proposal.excluded_items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] p-6"
            >
              <h2 className="text-sm font-semibold text-red-400 mb-3 tracking-widest uppercase">Not Included</h2>
              <ul className="space-y-2">
                {proposal.excluded_items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#98A2B3]">
                    <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] p-6"
          >
            <h2 className="text-sm font-semibold text-[#5B4CF0] mb-3 tracking-widest uppercase">Timeline</h2>
            <p className="text-[#101828] text-sm leading-relaxed">{proposal.timeline_description}</p>
          </motion.div>

          {/* Milestones */}
          {proposal.milestones && proposal.milestones.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] p-6"
            >
              <h2 className="text-sm font-semibold text-[#5B4CF0] mb-3 tracking-widest uppercase">Milestones</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#ECEFF5] text-left text-[#98A2B3] text-xs uppercase tracking-wider">
                      <th className="pb-3 pr-4 font-medium">Name</th>
                      <th className="pb-3 pr-4 font-medium">Description</th>
                      <th className="pb-3 pr-4 font-medium">Due Date</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposal.milestones.map((ms, i) => (
                      <tr key={i} className="border-b border-[#ECEFF5] last:border-0">
                        <td className="py-3 pr-4 text-[#101828] font-medium">{ms.name}</td>
                        <td className="py-3 pr-4 text-[#98A2B3]">{ms.description}</td>
                        <td className="py-3 pr-4 text-[#98A2B3]">{ms.due_date ? formatDate(ms.due_date) : "—"}</td>
                        <td className="py-3 text-[#5B4CF0] font-semibold text-right">{formatCurrency(ms.amount_ngn)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Payment Schedule */}
          {proposal.payment_schedule && proposal.payment_schedule.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] p-6"
            >
              <h2 className="text-sm font-semibold text-[#5B4CF0] mb-3 tracking-widest uppercase">Payment Schedule</h2>
              <div className="space-y-3">
                {proposal.payment_schedule.map((ps, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#ECEFF5] last:border-0">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-[#101828]">{ps.event}</span>
                      <span className="text-xs text-[#98A2B3]">{ps.percentage}%</span>
                    </div>
                    <span className="text-sm text-[#5B4CF0] font-semibold">{formatCurrency(ps.amount_ngn)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Total */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#5B4CF0]/30 p-8 text-center"
          >
            <p className="text-xs text-[#98A2B3] uppercase tracking-widest mb-1">Total</p>
            <p className="text-3xl md:text-4xl font-bold text-[#5B4CF0]">
              {formatCurrency(proposal.total_ngn)}
            </p>
            {proposal.total_usd > 0 && (
              <p className="text-sm text-[#98A2B3] mt-1">
                ~{formatCurrency(proposal.total_usd, "USD")}
              </p>
            )}
          </motion.div>

          {/* Terms & Conditions */}
          {proposal.terms_and_conditions && proposal.terms_and_conditions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] p-6"
            >
              <h2 className="text-sm font-semibold text-[#5B4CF0] mb-3 tracking-widest uppercase">Terms &amp; Conditions</h2>
              <ul className="space-y-2">
                {proposal.terms_and_conditions.map((term, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#98A2B3]">
                    <span className="text-[#5B4CF0] mt-0.5">{i + 1}.</span>
                    {term}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Valid Until */}
          {proposal.valid_until && (
            <div className="text-center text-sm text-[#98A2B3]">
              Proposal valid until <span className="text-[#101828] font-medium">{formatDate(proposal.valid_until)}</span>
            </div>
          )}

          {/* Version History */}
          {proposal.versions && proposal.versions.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] p-6"
            >
              <h2 className="text-sm font-semibold text-[#5B4CF0] mb-4 tracking-widest uppercase">Version History</h2>
              <div className="space-y-3">
                {[...proposal.versions].reverse().map((v) => (
                  <div
                    key={v.id}
                    className="flex items-start justify-between py-2 border-b border-[#ECEFF5] last:border-0"
                  >
                    <div>
                      <span className="text-sm text-[#101828] font-medium">v{v.version}</span>
                      {v.changes_description && (
                        <p className="text-xs text-[#98A2B3] mt-0.5">{v.changes_description}</p>
                      )}
                    </div>
                    <span className="text-xs text-[#98A2B3] shrink-0 ml-4">{formatDate(v.created_at)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bottom action bar */}
          {canAct && (
            <div className="flex justify-center gap-4 pt-4 pb-12">
              <Button
                variant="outline"
                className="border-[#5B4CF0]/40 text-[#5B4CF0] hover:bg-[#5B4CF0]/10"
                onClick={() => handleStatusUpdate("revision_requested")}
                loading={actionLoading === "revision_requested"}
              >
                Request Revision
              </Button>
              <Button
                variant="outline"
                className="border-red-400/40 text-red-400 hover:bg-red-500/10"
                onClick={() => handleStatusUpdate("rejected")}
                loading={actionLoading === "rejected"}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                onClick={() => handleStatusUpdate("approved")}
                loading={actionLoading === "approved"}
              >
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
