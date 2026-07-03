"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { DataTable, AdminPageHeader, AdminModal, ConfirmDialog } from "@/components/admin";
import type { Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";

interface LessonListData {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  module_id: string;
  module_name: string;
  course_id: string;
  course_title: string;
  sort_order: number;
  status: string;
  created_at: string;
}

interface ModuleOption {
  id: string;
  name: string;
  course_id: string;
  course_title: string;
}

interface LessonFormData {
  title: string;
  slug: string;
  content: string;
  video_url: string;
  duration_minutes: number;
  module_id: string;
  sort_order: number;
  status: string;
}

const emptyForm: LessonFormData = {
  title: "",
  slug: "",
  content: "",
  video_url: "",
  duration_minutes: 0,
  module_id: "",
  sort_order: 0,
  status: "draft",
};

const statusVariant: Record<string, "gold" | "success" | "error" | "info"> = {
  published: "success",
  draft: "gold",
  archived: "error",
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

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<LessonListData[]>([]);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LessonFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLessons = useCallback(async () => {
    setPageLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search.trim()) params.set("search", search.trim());
      if (moduleFilter) params.set("module_id", moduleFilter);
      const res = await adminFetch<{ success: boolean; data: { data: LessonListData[]; current_page: number; last_page: number; total: number } }>(
        `/lessons?${params.toString()}`
      );
      setLessons(res.data.data);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lessons");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [page, search, moduleFilter]);

  const fetchModules = useCallback(async () => {
    try {
      const res = await adminFetch<{ success: boolean; data: ModuleOption[] }>("/course-modules");
      setModules(res.data || []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);
  useEffect(() => { fetchModules(); }, [fetchModules]);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(lesson: LessonListData) {
    setForm({
      title: lesson.title,
      slug: lesson.slug,
      content: lesson.content || "",
      video_url: lesson.video_url || "",
      duration_minutes: lesson.duration_minutes || 0,
      module_id: lesson.module_id,
      sort_order: lesson.sort_order,
      status: lesson.status,
    });
    setEditingId(lesson.id);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, duration_minutes: Number(form.duration_minutes), sort_order: Number(form.sort_order) };
      if (editingId) {
        await adminFetch(`/lessons/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await adminFetch("/lessons", { method: "POST", body: JSON.stringify(payload) });
      }
      setShowModal(false);
      fetchLessons();
    } catch (err) {
      console.error("Failed to save lesson:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await adminFetch(`/lessons/${deleteConfirm}`, { method: "DELETE" });
      setDeleteConfirm(null);
      fetchLessons();
    } catch (err) {
      console.error("Failed to delete lesson:", err);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<LessonListData>[] = [
    {
      key: "title",
      header: "Title",
      render: (lesson) => <span className="text-sm font-medium text-white">{lesson.title}</span>,
    },
    {
      key: "module_name",
      header: "Module",
      render: (lesson) => <span className="text-sm text-[#667085]">{lesson.module_name}</span>,
      hideOnMobile: true,
    },
    {
      key: "course_title",
      header: "Course",
      render: (lesson) => <span className="text-sm text-[#667085]">{lesson.course_title}</span>,
      hideOnMobile: true,
    },
    {
      key: "duration_minutes",
      header: "Duration",
      render: (lesson) => (
        <span className="text-sm text-[#667085]">{lesson.duration_minutes ? `${lesson.duration_minutes}m` : "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      render: (lesson) => (
        <Badge variant={statusVariant[lesson.status] || "info"}>
          {lesson.status.charAt(0).toUpperCase() + lesson.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "sort_order",
      header: "Sort Order",
      render: (lesson) => <span className="text-sm text-[#667085]">{lesson.sort_order}</span>,
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (lesson) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(lesson)}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(lesson.id)} className="!text-red-400 hover:!bg-red-500/10">Delete</Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <AdminPageHeader
        title="Lessons"
        description="Manage all academy lessons"
        actions={
          <Button onClick={openCreate} icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          }>
            Add Lesson
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search lessons by title..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <Select
            value={moduleFilter}
            onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
            options={[
              { value: "", label: "All Modules" },
              ...modules.map((m) => ({ value: m.id, label: `${m.name} (${m.course_title})` })),
            ]}
          />
        </div>
      </div>

      {error ? (
        <ErrorMessage title="Failed to load lessons" message={error} onRetry={fetchLessons} />
      ) : (
        <DataTable
          columns={columns}
          data={lessons}
          loading={pageLoading}
          keyExtractor={(l) => l.id}
          pagination={{
            currentPage: page,
            lastPage,
            total,
            perPage: 20,
            onPageChange: setPage,
          }}
          emptyState={
            <EmptyState
              icon="📖"
              title={search || moduleFilter ? "No matching lessons" : "No lessons yet"}
              description={search || moduleFilter ? "Try different search or filter." : "Add your first lesson."}
            />
          }
        />
      )}

      <AdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Lesson" : "Add Lesson"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting}>{editingId ? "Update" : "Create"}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm text-[#667085] font-medium mb-1.5">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-[#ECEFF5] text-[#101828] placeholder:text-[#667085]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Video URL" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
            <Input label="Duration (minutes)" type="number" value={form.duration_minutes || ""} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Module"
              value={form.module_id}
              onChange={(e) => setForm({ ...form, module_id: e.target.value })}
              options={modules.map((m) => ({ value: m.id, label: `${m.name} (${m.course_title})` }))}
              placeholder="Select module"
              required
            />
            <Input label="Sort Order" type="number" value={form.sort_order || ""} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </div>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
              { value: "archived", label: "Archived" },
            ]}
          />
        </form>
      </AdminModal>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Lesson"
        message="Are you sure you want to delete this lesson? This action cannot be undone."
        confirmText="Delete"
        destructive
        loading={deleting}
      />
    </motion.div>
  );
}
