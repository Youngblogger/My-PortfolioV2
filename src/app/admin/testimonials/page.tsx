"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader, DataTable } from "@/components/admin";
import type { Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { formatDate, truncate } from "@/lib/utils";

interface ReviewItem {
  id: string;
  client: string;
  project: string;
  rating: number;
  review: string | null;
  status: string;
  is_visible: boolean;
  created_at: string;
}

interface ReviewListResponse {
  data: ReviewItem[];
  current_page: number;
  last_page: number;
  total: number;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "approved", label: "Approved" },
  { value: "hidden", label: "Hidden" },
  { value: "pending", label: "Pending" },
];

const STATUS_BADGE: Record<string, "success" | "error" | "gold"> = {
  approved: "success",
  hidden: "error",
  pending: "gold",
};

async function adminFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`/api/v1/admin${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
}

export default function TestimonialsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (statusFilter) params.set("status", statusFilter);
      const res = await adminFetch<ReviewListResponse>(`/reviews?${params.toString()}`);
      setReviews(res.data);
      setLastPage(res.last_page);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleStatusToggle = async (review: ReviewItem, makeVisible: boolean) => {
    try {
      const res = await fetch(`/api/v1/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_visible: makeVisible }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update review");
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, is_visible: makeVisible, status: makeVisible ? "approved" : "hidden" } : r))
      );
    } catch (err) {
      console.error("Failed to update review status:", err);
    }
  };

  const testimonials = reviews.filter((r) => r.rating >= 4);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={cn("w-4 h-4", i < rating ? "text-[#5B4CF0]" : "text-[#101828]/10")}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const columns: Column<ReviewItem>[] = [
    {
      key: "client",
      header: "Client",
      render: (r) => <span className="text-sm font-medium text-white">{r.client || "Anonymous"}</span>,
    },
    {
      key: "project",
      header: "Project",
      hideOnMobile: true,
      render: (r) => <span className="text-sm text-[#667085]">{r.project || "—"}</span>,
    },
    {
      key: "rating",
      header: "Rating",
      render: (r) => renderStars(r.rating),
    },
    {
      key: "review",
      header: "Review",
      render: (r) => (
        <span className="text-sm text-[#667085] max-w-xs block truncate">
          {r.review ? truncate(r.review, 80) : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={STATUS_BADGE[r.status] || "gold"}>
          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      hideOnMobile: true,
      render: (r) => <span className="text-sm text-[#667085] whitespace-nowrap">{formatDate(r.created_at)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.is_visible ? (
            <Button variant="outline" size="sm" onClick={() => handleStatusToggle(r, false)}>
              Hide
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => handleStatusToggle(r, true)}>
              Approve
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Testimonials"
        description="Manage client reviews with rating >= 4. Approve or hide testimonials."
      />

      <div className="mb-6 w-48">
        <Select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          options={STATUS_OPTIONS}
        />
      </div>

      <DataTable
        columns={columns}
        data={testimonials}
        loading={loading}
        keyExtractor={(r) => r.id}
        pagination={{
          currentPage: page,
          lastPage,
          total,
          perPage: testimonials.length || 10,
          onPageChange: (p) => setPage(p),
        }}
        emptyState={
          <EmptyState
            icon="⭐"
            title={statusFilter ? "No matching testimonials" : "No testimonials yet"}
            description={statusFilter ? "Try adjusting your filters." : "Testimonials from reviews with 4+ stars will appear here."}
          />
        }
      />

      {error && !loading && (
        <div className="mt-4">
          <ErrorMessage title="Failed to load testimonials" message={error} onRetry={fetchReviews} />
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
