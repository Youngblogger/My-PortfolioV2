"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { DataTable, AdminPageHeader } from "@/components/admin";
import type { Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatDate } from "@/lib/utils";

interface ReviewData {
  id: string;
  rating: number;
  review: string | null;
  is_visible: boolean;
  is_featured: boolean;
  client_name: string;
  client_email: string;
  project_name: string | null;
  project_id: string | null;
  service: string | null;
  created_at: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

async function adminFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  const res = await fetch(`/api/v1/admin${endpoint}`, { ...options, headers, credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClass} ${star <= rating ? "text-gold" : "text-white/20"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const fetchReviews = useCallback(async () => {
    setPageLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      const res = await adminFetch<{ success: boolean; data: { data: ReviewData[]; current_page: number; last_page: number; total: number } }>(
        `/reviews?${params.toString()}`
      );
      setReviews(res.data.data);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  async function handleToggleVisibility(review: ReviewData) {
    setActionLoading(review.id);
    try {
      await adminFetch(`/reviews/${review.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_visible: !review.is_visible }),
      });
      fetchReviews();
    } catch (err) {
      console.error("Failed to update review:", err);
    } finally {
      setActionLoading(null);
    }
  }

  const getStatusInfo = (review: ReviewData): { label: string; variant: "gold" | "success" | "error" | "info" } => {
    if (review.is_visible) return { label: "Approved", variant: "success" };
    return { label: "Hidden", variant: "error" };
  };

  const toggleExpand = (id: string) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const columns: Column<ReviewData>[] = [
    {
      key: "client_name",
      header: "Client",
      render: (review) => (
        <div>
          <p className="text-sm font-medium text-white">{review.client_name || "—"}</p>
          <p className="text-xs text-muted">{review.client_email}</p>
        </div>
      ),
    },
    {
      key: "project_name",
      header: "Project",
      render: (review) => <span className="text-sm text-muted">{review.project_name || review.service || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "rating",
      header: "Rating",
      render: (review) => <StarRating rating={review.rating} />,
    },
    {
      key: "review",
      header: "Review",
      render: (review) => {
        if (!review.review) return <span className="text-sm text-muted italic">No text</span>;
        const isExpanded = expandedReviews.has(review.id);
        const truncated = review.review.length > 80;
        return (
          <div>
            <p className="text-sm text-white/80">
              {isExpanded || !truncated ? review.review : `${review.review.slice(0, 80)}...`}
            </p>
            {truncated && (
              <button
                onClick={() => toggleExpand(review.id)}
                className="text-xs text-gold hover:text-gold-secondary mt-1 transition-colors"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (review) => {
        const info = getStatusInfo(review);
        return <Badge variant={info.variant}>{info.label}</Badge>;
      },
    },
    {
      key: "created_at",
      header: "Date",
      render: (review) => <span className="text-sm text-muted whitespace-nowrap">{formatDate(review.created_at)}</span>,
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (review) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant={review.is_visible ? "outline" : "primary"}
            size="sm"
            loading={actionLoading === review.id}
            onClick={() => handleToggleVisibility(review)}
            className="text-[10px] px-2 py-1"
          >
            {review.is_visible ? "Hide" : "Approve"}
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <AdminPageHeader
        title="Project Reviews"
        description="Moderate client reviews and testimonials"
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by client name or review..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            options={[
              { value: "", label: "All Status" },
              { value: "visible", label: "Approved" },
              { value: "hidden", label: "Hidden" },
            ]}
          />
        </div>
      </div>

      {error ? (
        <ErrorMessage title="Failed to load reviews" message={error} onRetry={fetchReviews} />
      ) : (
        <DataTable
          columns={columns}
          data={reviews}
          loading={pageLoading}
          searchable={false}
          keyExtractor={(r) => r.id}
          pagination={{
            currentPage: page,
            lastPage,
            total,
            perPage: 20,
            onPageChange: setPage,
          }}
          emptyState={
            <EmptyState
              icon="⭐"
              title={search || statusFilter ? "No matching reviews" : "No reviews yet"}
              description={search || statusFilter ? "Try different search or filter." : "Reviews will appear when clients submit them."}
            />
          }
        />
      )}
    </motion.div>
  );
}
