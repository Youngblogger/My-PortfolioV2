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

interface EnrollmentData {
  id: string;
  enrollment_number: string;
  user_id: string;
  course_id: string;
  student_name: string;
  student_email: string;
  course_title: string;
  status: string;
  progress: number;
  started_at: string;
  completed_at: string | null;
  certificate_url: string | null;
  created_at: string;
}

const statusVariant: Record<string, "gold" | "success" | "error" | "info"> = {
  active: "success",
  completed: "info",
  cancelled: "error",
};

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

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    setPageLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      const res = await adminFetch<{ success: boolean; data: { data: EnrollmentData[]; current_page: number; last_page: number; total: number } }>(
        `/enrollments?${params.toString()}`
      );
      setEnrollments(res.data.data);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load enrollments");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  async function handleGenerateCertificate(enrollmentId: string) {
    setGeneratingId(enrollmentId);
    try {
      await adminFetch(`/certificates/generate/${enrollmentId}`, { method: "POST" });
      fetchEnrollments();
    } catch (err) {
      console.error("Failed to generate certificate:", err);
    } finally {
      setGeneratingId(null);
    }
  }

  const columns: Column<EnrollmentData>[] = [
    {
      key: "student_name",
      header: "Student Name",
      render: (enr) => (
        <div>
          <p className="text-sm font-medium text-white">{enr.student_name || "—"}</p>
          <p className="text-xs text-muted">{enr.student_email}</p>
        </div>
      ),
    },
    {
      key: "course_title",
      header: "Course",
      render: (enr) => <span className="text-sm text-muted">{enr.course_title}</span>,
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      render: (enr) => (
        <Badge variant={statusVariant[enr.status] || "gold"}>
          {enr.status.charAt(0).toUpperCase() + enr.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (enr) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full" style={{ width: `${enr.progress}%` }} />
          </div>
          <span className="text-xs text-muted">{enr.progress}%</span>
        </div>
      ),
      hideOnMobile: true,
    },
    {
      key: "started_at",
      header: "Enrolled Date",
      render: (enr) => <span className="text-sm text-muted whitespace-nowrap">{formatDate(enr.started_at)}</span>,
      hideOnMobile: true,
    },
    {
      key: "completed_at",
      header: "Completed Date",
      render: (enr) => (
        <span className="text-sm text-muted whitespace-nowrap">
          {enr.completed_at ? formatDate(enr.completed_at) : "—"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "certificate_url",
      header: "Certificate",
      render: (enr) => {
        if (enr.certificate_url) {
          return (
            <a
              href={enr.certificate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gold hover:text-gold-secondary transition-colors"
            >
              View
            </a>
          );
        }
        if (enr.status === "completed") {
          return (
            <Button
              size="sm"
              variant="outline"
              loading={generatingId === enr.id}
              onClick={() => handleGenerateCertificate(enr.id)}
              className="text-[10px] px-2 py-1"
            >
              Generate
            </Button>
          );
        }
        return <span className="text-xs text-muted">—</span>;
      },
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (enr) => (
        <div className="flex items-center justify-end gap-2">
          {enr.status === "completed" && !enr.certificate_url && (
            <Button
              size="sm"
              variant="outline"
              loading={generatingId === enr.id}
              onClick={() => handleGenerateCertificate(enr.id)}
              className="text-[10px]"
            >
              Generate Certificate
            </Button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <AdminPageHeader
        title="Enrollments"
        description="View and manage course enrollments"
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by student name or course..."
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
              { value: "active", label: "Active" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
        </div>
      </div>

      {error ? (
        <ErrorMessage title="Failed to load enrollments" message={error} onRetry={fetchEnrollments} />
      ) : (
        <DataTable
          columns={columns}
          data={enrollments}
          loading={pageLoading}
          searchable={false}
          keyExtractor={(e) => e.id}
          pagination={{
            currentPage: page,
            lastPage,
            total,
            perPage: 20,
            onPageChange: setPage,
          }}
          emptyState={
            <EmptyState
              icon="🎓"
              title={search || statusFilter ? "No matching enrollments" : "No enrollments yet"}
              description={search || statusFilter ? "Try different search or filter." : "Enrollments will appear when students sign up for courses."}
            />
          }
        />
      )}
    </motion.div>
  );
}
