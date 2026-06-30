"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { DataTable, AdminPageHeader } from "@/components/admin";
import type { Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatDate } from "@/lib/utils";

interface CertificateData {
  id: string;
  certificate_number: string;
  enrollment_id: string;
  student_name: string;
  student_email: string;
  course_title: string;
  issued_date: string;
  certificate_url: string | null;
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

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    setPageLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search.trim()) params.set("search", search.trim());
      const res = await adminFetch<{ success: boolean; data: { data: CertificateData[]; current_page: number; last_page: number; total: number } }>(
        `/certificates?${params.toString()}`
      );
      setCertificates(res.data.data);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load certificates");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCertificates(); }, [fetchCertificates]);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  async function handleDownload(cert: CertificateData) {
    if (cert.certificate_url) {
      window.open(cert.certificate_url, "_blank");
    }
  }

  async function handleRegenerate(certId: string, enrollmentId: string) {
    setRegeneratingId(certId);
    try {
      await adminFetch(`/certificates/generate/${enrollmentId}`, { method: "POST" });
      fetchCertificates();
    } catch (err) {
      console.error("Failed to regenerate certificate:", err);
    } finally {
      setRegeneratingId(null);
    }
  }

  const columns: Column<CertificateData>[] = [
    {
      key: "certificate_number",
      header: "Certificate Number",
      render: (cert) => <span className="text-sm font-mono font-medium text-white">{cert.certificate_number}</span>,
    },
    {
      key: "student_name",
      header: "Student",
      render: (cert) => (
        <div>
          <p className="text-sm font-medium text-white">{cert.student_name || "—"}</p>
          <p className="text-xs text-muted">{cert.student_email}</p>
        </div>
      ),
    },
    {
      key: "course_title",
      header: "Course",
      render: (cert) => <span className="text-sm text-muted">{cert.course_title}</span>,
      hideOnMobile: true,
    },
    {
      key: "issued_date",
      header: "Issued Date",
      render: (cert) => <span className="text-sm text-muted whitespace-nowrap">{formatDate(cert.issued_date)}</span>,
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (cert) => (
        <div className="flex items-center justify-end gap-2">
          {cert.certificate_url && (
            <Button variant="outline" size="sm" onClick={() => handleDownload(cert)}>
              Download
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            loading={regeneratingId === cert.id}
            onClick={() => handleRegenerate(cert.id, cert.enrollment_id)}
          >
            Regenerate
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
        title="Certificates"
        description="View and manage course certificates"
      />

      {error ? (
        <ErrorMessage title="Failed to load certificates" message={error} onRetry={fetchCertificates} />
      ) : (
        <DataTable
          columns={columns}
          data={certificates}
          loading={pageLoading}
          searchable
          searchPlaceholder="Search by certificate number or student name..."
          onSearch={handleSearch}
          keyExtractor={(c) => c.id}
          pagination={{
            currentPage: page,
            lastPage,
            total,
            perPage: 20,
            onPageChange: setPage,
          }}
          emptyState={
            <EmptyState
              icon="🏆"
              title={search ? "No matching certificates" : "No certificates yet"}
              description={search ? "Try a different search term." : "Certificates will appear when students complete courses."}
            />
          }
        />
      )}
    </motion.div>
  );
}
