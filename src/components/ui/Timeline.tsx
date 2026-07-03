"use client";

import { motion } from "framer-motion";

export interface TimelineItem {
  id: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  description?: string;
  timestamp: string;
  badge?: { label: string; bg: string; text: string };
  avatar?: { src: string; alt: string };
}

interface TimelineProps {
  items: TimelineItem[];
  maxItems?: number;
}

export function Timeline({ items, maxItems }: TimelineProps) {
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  if (displayItems.length === 0) return null;

  return (
    <div className="space-y-0">
      {displayItems.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-start gap-3"
        >
          <div className="relative flex flex-col items-center">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: item.iconBg }}
            >
              <span style={{ color: item.iconColor }}>{item.icon}</span>
            </div>
            {i < displayItems.length - 1 && (
              <div className="w-px flex-1 my-1" style={{ backgroundColor: "#ECEFF5" }} />
            )}
          </div>
          <div className="min-w-0 flex-1 pb-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium truncate" style={{ color: "#101828" }}>
                {item.title}
              </p>
              {item.badge && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize whitespace-nowrap shrink-0"
                  style={{ backgroundColor: item.badge.bg, color: item.badge.text }}
                >
                  {item.badge.label}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-xs mt-0.5" style={{ color: "#667085" }}>
                {item.description}
              </p>
            )}
            <p className="text-[11px] mt-1" style={{ color: "#98A2B3" }}>
              {item.timestamp}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
