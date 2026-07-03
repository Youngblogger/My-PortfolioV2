"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { cn, formatCurrency, formatDateShort } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PaginatedOrdersData } from "@/lib/api";

type OrderItem = PaginatedOrdersData["data"][number];

const COLUMNS = [
  { key: "lead", label: "Lead" },
  { key: "discovery", label: "Discovery" },
  { key: "proposal", label: "Proposal" },
  { key: "approved", label: "Approved" },
  { key: "development", label: "Development" },
  { key: "testing", label: "Testing" },
  { key: "deployment", label: "Deployment" },
  { key: "completed", label: "Completed" },
] as const;

const columnVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

function KanbanCard({
  order,
  onDragStart,
}: {
  order: OrderItem;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, orderId: string) => void;
}) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    onDragStart(e, order.id);
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
    >
      <div
        draggable
        onDragStart={handleDragStart}
        className="portal-card rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-[#5B4CF0]/20 transition-all space-y-2.5 select-none"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-bold text-[#5B4CF0] whitespace-nowrap">
            {order.order_number}
          </span>
          <Badge variant="info" className="text-[10px] px-1.5 py-0">
            {order.payment_status}
          </Badge>
        </div>
        <p className="text-sm font-semibold text-[#101828] leading-snug">
          {order.project_name || order.projectType?.title || "Untitled Project"}
        </p>
        <p className="text-xs text-[#667085]">
          {order.user?.profile?.full_name || "Unknown client"}
        </p>
        <div className="flex items-center justify-between pt-1 border-t border-[#ECEFF5]">
          <p className="text-xs text-[#667085]">
            {order.package?.name || order.service?.title || "—"}
          </p>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#5B4CF0]">
            {formatCurrency(order.total_ngn)}
          </span>
          <span className="text-[#667085]">
            {formatDateShort(order.created_at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

const statusMap: Record<string, string> = {
  lead: "lead",
  discovery: "discovery",
  proposal_sent: "proposal",
  proposal: "proposal",
  approved: "approved",
  development: "development",
  in_progress: "development",
  testing: "testing",
  deployment: "deployment",
  completed: "completed",
};

function mapStatusToColumn(status: string): string {
  return statusMap[status] || status;
}

const columnStatuses: Record<string, string[]> = {
  lead: ["lead"],
  discovery: ["discovery"],
  proposal: ["proposal", "proposal_sent"],
  approved: ["approved"],
  development: ["development", "in_progress"],
  testing: ["testing"],
  deployment: ["deployment"],
  completed: ["completed"],
};

export default function KanbanPage() {
  const [allOrders, setAllOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragNode = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getAdminOrders();
        if (!mounted) return;
        setAllOrders(res.data.data || []);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, orderId: string) => {
    dragNode.current = e.target as HTMLElement;
    setDraggingId(orderId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", orderId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, columnKey: string) => {
      e.preventDefault();
      const orderId = e.dataTransfer.getData("text/plain");
      if (!orderId) return;

      const targetStatuses = columnStatuses[columnKey];
      if (!targetStatuses) return;

      const newStatus = targetStatuses[0];
      const order = allOrders.find((o) => o.id === orderId);
      if (!order || order.status === newStatus) {
        setDraggingId(null);
        return;
      }

      setAllOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      setDraggingId(null);

      try {
        await api.updateOrderStatus(orderId, newStatus);
      } catch (err) {
        setAllOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: order.status } : o))
        );
        console.error("Failed to update order status:", err);
      }
    },
    [allOrders]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    dragNode.current = null;
  }, []);

  function getColumnOrders(columnKey: string): OrderItem[] {
    const statuses = columnStatuses[columnKey];
    return allOrders.filter((o) => statuses.includes(o.status));
  }

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <span className="section-label">KANBAN</span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#101828] mt-1">
            Project Board
          </h1>
          <p className="text-[#667085] text-sm mt-1">
            Drag and drop orders to update their status.
          </p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[280px] w-[280px] shrink-0 portal-card rounded-2xl p-4 space-y-4">
              <Skeleton className="h-6 w-24" />
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-32 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portal-card rounded-2xl p-12 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-bold text-[#101828] mb-2">Failed to Load Orders</h3>
        <p className="text-[#667085] text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <span className="section-label">KANBAN</span>
        <h1 className="text-2xl md:text-3xl font-bold text-[#101828] mt-1">
          Project Board
        </h1>
        <p className="text-[#667085] text-sm mt-1">
          Drag and drop orders to update their status.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8">
        {COLUMNS.map((column, i) => {
          const columnOrders = getColumnOrders(column.key);
          return (
            <motion.div
              key={column.key}
              custom={i}
              variants={columnVariants}
              initial="hidden"
              animate="visible"
              className={cn(
                "min-w-[280px] w-[280px] shrink-0 portal-card rounded-2xl flex flex-col",
                draggingId && "min-h-[400px]"
              )}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.key)}
            >
              <div className="flex items-center justify-between p-4 border-b border-[#ECEFF5]">
                <h3 className="text-sm font-semibold text-white">{column.label}</h3>
                <Badge variant="gold" className="text-[11px] px-2 py-0.5">
                  {columnOrders.length}
                </Badge>
              </div>
              <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px]">
                <AnimatePresence mode="popLayout">
                  {columnOrders.map((order) => (
                    <KanbanCard
                      key={order.id}
                      order={order}
                      onDragStart={handleDragStart}
                    />
                  ))}
                </AnimatePresence>
                {columnOrders.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-xs text-[#667085]/50 text-center">
                    Drop orders here
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
