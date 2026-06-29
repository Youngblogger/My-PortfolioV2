"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { api, type DiscoveryCallData } from "@/lib/api";

const statusVariant = (status: string): "gold" | "success" | "info" => {
  if (status === "approved" || status === "confirmed") return "success";
  if (status === "pending") return "gold";
  return "info";
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function DiscoveryCallsPage() {
  const [calls, setCalls] = useState<DiscoveryCallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await api.getMyDiscoveryCalls();
        if (!mounted) return;
        setCalls(
          (res.data || []).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        );
      } catch {
        if (mounted) setError("Failed to load discovery calls. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const isUpcoming = (call: DiscoveryCallData): boolean => {
    if (call.status === "cancelled" || call.status === "completed") return false;
    const callDate = new Date(`${call.preferred_date}T${call.preferred_time}`);
    return callDate > new Date();
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Discovery Calls</h1>
            <p className="text-muted mt-1">View and manage your scheduled discovery calls.</p>
          </div>
          <Link
            href="/hire/discovery-call"
            className="px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
          >
            Schedule a Call
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-4">
              <svg className="animate-spin h-8 w-8 text-gold mx-auto" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-muted text-sm">Loading discovery calls...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
            <h3 className="text-lg font-bold text-white mb-2">Oops</h3>
            <p className="text-muted text-sm mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        ) : calls.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4" aria-hidden="true">📞</div>
            <h3 className="text-lg font-bold text-white mb-2">No Discovery Calls Yet</h3>
            <p className="text-muted text-sm mb-6">
              Schedule a discovery call to discuss your project with us.
            </p>
            <Link
              href="/hire/discovery-call"
              className="inline-block px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Schedule a Call
            </Link>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-4">
            {calls.map((call) => {
              const upcoming = isUpcoming(call);
              return (
                <motion.div
                  key={call.id}
                  variants={fadeUp}
                  className={`glass rounded-2xl p-6 transition-all duration-300 hover:border-gold/20 ${
                    upcoming ? "border-l-2 border-l-gold" : "opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant={statusVariant(call.status)}>
                      {call.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                    <span className="text-xs text-muted">
                      {new Date(call.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted shrink-0">📅</span>
                      <span className="text-white">{formatDate(call.preferred_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted shrink-0">⏰</span>
                      <span className="text-white">{call.preferred_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted shrink-0">🎯</span>
                      <span className="text-white">
                        {call.meeting_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                  </div>

                  {call.meeting_link && (
                    <a
                      href={call.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm text-gold hover:underline"
                    >
                      🔗 Join Meeting
                    </a>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
