"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  trend?: { direction: "up" | "down" | "neutral"; value: string };
  loading?: boolean;
  className?: string;
}

export function StatsCard({ icon, label, value, trend, loading, className }: StatsCardProps) {
  if (loading) {
    return (
      <div className={cn("portal-card p-6 space-y-3", className)}>
        <div className="animate-pulse bg-gray-200 rounded-lg h-4 w-24" />
        <div className="animate-pulse bg-gray-200 rounded-lg h-8 w-28" />
        <div className="animate-pulse bg-gray-200 rounded-lg h-3 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "portal-card p-6 relative overflow-hidden group hover:border-[#5B4CF0]/20 transition-all duration-300",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-[#667085] font-medium">{label}</p>
        {icon && (
          <div className="text-[#5B4CF0]/60 group-hover:text-[#5B4CF0] transition-colors duration-300">
            {icon}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-[#101828] mb-1">{value}</p>
      {trend && (
        <div className="flex items-center gap-1.5">
          {trend.direction === "up" && (
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          )}
          {trend.direction === "down" && (
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
          {trend.direction === "neutral" && (
            <svg className="w-4 h-4 text-[#98A2B3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
          )}
          <span className={cn(
            "text-xs font-medium",
            trend.direction === "up" && "text-green-600",
            trend.direction === "down" && "text-red-600",
            trend.direction === "neutral" && "text-[#98A2B3]"
          )}>
            {trend.value}
          </span>
        </div>
      )}
      <div className="absolute bottom-0 right-0 w-32 h-32 -mr-8 -mb-8 rounded-full bg-[#5B4CF0]/5 transition-colors duration-500" />
    </motion.div>
  );
}
