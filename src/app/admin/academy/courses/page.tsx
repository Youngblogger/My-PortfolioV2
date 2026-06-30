"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DataTable, AdminPageHeader, AdminModal, ConfirmDialog } from "@/components/admin";
import type { Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "@/lib/utils";

interface CourseCategory {
  id: string;
  name: string;
  slug: string;
}

interface CourseData {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  category: { id: string; name: string } | null;
  price_ngn: number;
  price_usd: number;
  duration_weeks: number | null;
  skill_level: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  features: string[] | null;
  enrollments_count: number;
  created_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface CourseFormData {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  price_ngn: number;
  price_usd: number;
  category_id: string;
  duration_weeks: number;
  skill_level: string;
  thumbnail_url: string;
  is_published: boolean;
  features: string;
}

const emptyForm: CourseFormData = {
  title: "",
  slug: "",
  short_description: "",
  description: "",
  price_ngn: 0,
  price_usd: 0,
  category_id: "",
  duration_weeks: 4,
  skill_level: "beginner",
  thumbnail_url: "",
  is_published: false,
  features: "",
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
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`/api/v1/admin${endpoint}`, { ...options, headers, credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCourses = useCallback(async () => {
    setPageLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search.trim()) params.set("search", search.trim());
      const res = await adminFetch<{ success: boolean; data: PaginatedResponse<CourseData> }>(
        `/courses?${params.toString()}`
      );
      setCourses(res.data.data);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [page, search]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await adminFetch<{ success: boolean; data: CourseCategory[] }>("/course-categories");
      setCategories(res.data || []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
    setShowModal(true);
  }

  function openEdit(course: CourseData) {
    setForm({
      title: course.title,
      slug: course.slug,
      short_description: course.short_description || "",
      description: course.description || "",
      price_ngn: course.price_ngn,
      price_usd: course.price_usd,
      category_id: course.category_id || "",
      duration_weeks: course.duration_weeks || 4,
      skill_level: course.skill_level || "beginner",
      thumbnail_url: course.thumbnail_url || "",
      is_published: course.is_published,
      features: (course.features || []).join("\n"),
    });
    setEditingId(course.id);
    setFormError(null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        ...form,
        price_ngn: Number(form.price_ngn),
        price_usd: Number(form.price_usd),
        duration_weeks: Number(form.duration_weeks),
        features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
      };

      if (editingId) {
        await adminFetch(`/courses/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch("/courses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save course");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await adminFetch(`/courses/${deleteConfirm}`, { method: "DELETE" });
      setDeleteConfirm(null);
      fetchCourses();
    } catch (err) {
      console.error("Failed to delete course:", err);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<CourseData>[] = [
    {
      key: "title",
      header: "Title",
      render: (course) => (
        <Link
          href={`/admin/academy/courses/${course.id}`}
          className="text-sm font-medium text-gold hover:text-gold-secondary transition-colors"
        >
          {course.title}
        </Link>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (course) => (
        <span className="text-sm text-muted">{course.category?.name || "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "price_ngn",
      header: "Price",
      render: (course) => (
        <span className="text-sm font-semibold text-white">
          {formatCurrency(course.price_ngn)}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "duration_weeks",
      header: "Duration",
      render: (course) => (
        <span className="text-sm text-muted">
          {course.duration_weeks ? `${course.duration_weeks}w` : "—"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "is_published",
      header: "Status",
      render: (course) => (
        <Badge variant={course.is_published ? "success" : "error"}>
          {course.is_published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "enrollments_count",
      header: "Enrollments",
      render: (course) => (
        <span className="text-sm text-muted">{course.enrollments_count}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (course) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(course)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteConfirm(course.id)}
            className="!text-red-400 hover:!bg-red-500/10"
          >
            Delete
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
        title="Courses"
        description="Manage your academy courses"
        actions={
          <Button onClick={openCreate} icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          }>
            New Course
          </Button>
        }
      />

      {error ? (
        <ErrorMessage title="Failed to load courses" message={error} onRetry={fetchCourses} />
      ) : (
        <DataTable
          columns={columns}
          data={courses}
          loading={pageLoading}
          searchable
          searchPlaceholder="Search courses by title..."
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
              icon="📚"
              title={search ? "No matching courses" : "No courses yet"}
              description={search ? "Try a different search term." : "Create your first course to get started."}
              action={!search ? { label: "New Course", href: "#" } : undefined}
            />
          }
        />
      )}

      <AdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Course" : "New Course"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              {editingId ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
          </div>
          <Input
            label="Short Description"
            value={form.short_description}
            onChange={(e) => setForm({ ...form, short_description: e.target.value })}
          />
          <div>
            <label className="block text-sm text-white/80 font-medium mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (NGN)"
              type="number"
              value={form.price_ngn || ""}
              onChange={(e) => setForm({ ...form, price_ngn: Number(e.target.value) })}
              required
            />
            <Input
              label="Price (USD)"
              type="number"
              value={form.price_usd || ""}
              onChange={(e) => setForm({ ...form, price_usd: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Select category"
            />
            <Input
              label="Duration (weeks)"
              type="number"
              value={form.duration_weeks || ""}
              onChange={(e) => setForm({ ...form, duration_weeks: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Skill Level"
              value={form.skill_level}
              onChange={(e) => setForm({ ...form, skill_level: e.target.value })}
              options={[
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
                { value: "all", label: "All Levels" },
              ]}
            />
            <Input
              label="Thumbnail URL"
              value={form.thumbnail_url}
              onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_published"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-gold focus:ring-gold/20"
            />
            <label htmlFor="is_published" className="text-sm text-white/80">
              Published
            </label>
          </div>
          <div>
            <label className="block text-sm text-white/80 font-medium mb-1.5">Features (one per line)</label>
            <textarea
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              rows={4}
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
            />
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        confirmText="Delete"
        destructive
        loading={deleting}
      />
    </motion.div>
  );
}
