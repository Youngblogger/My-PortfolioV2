"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AdminModal, ConfirmDialog } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CourseDetailData {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
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
  modules: ModuleData[];
}

interface ModuleData {
  id: string;
  course_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  lessons: LessonData[];
  created_at: string;
}

interface LessonData {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  module_id: string;
  sort_order: number;
  status: string;
  created_at: string;
}

const statusVariant: Record<string, "gold" | "success" | "error" | "info"> = {
  published: "success",
  draft: "gold",
  archived: "error",
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

export default function AdminCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("modules");

  const fetchCourse = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ success: boolean; data: CourseDetailData }>(`/courses/${id}`);
      setCourse(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorMessage title="Failed to load course" message={error} onRetry={fetchCourse} />;
  if (!course) return null;

  return (
    <div>
      <button
        onClick={() => router.push("/admin/academy/courses")}
        className="text-xs text-[#667085] hover:text-white transition-colors mb-2 flex items-center gap-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" />
        </svg>
        Back to Courses
      </button>

      <div className="portal-card rounded-2xl p-6 md:p-8 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{course.title}</h1>
              <Badge variant={course.is_published ? "success" : "error"}>
                {course.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-[#667085] text-sm">/{course.slug}</p>
            {course.short_description && (
              <p className="text-[#667085] text-sm mt-2 max-w-2xl">{course.short_description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[#5B4CF0]">{formatCurrency(course.price_ngn)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[#ECEFF5]">
          <div className="text-sm"><span className="text-[#667085]">Category:</span> <span className="text-[#667085]">{course.category?.name || "—"}</span></div>
          <div className="text-sm"><span className="text-[#667085]">Duration:</span> <span className="text-[#667085]">{course.duration_weeks ? `${course.duration_weeks} weeks` : "—"}</span></div>
          <div className="text-sm"><span className="text-[#667085]">Level:</span> <span className="text-[#667085] capitalize">{course.skill_level || "—"}</span></div>
          <div className="text-sm"><span className="text-[#667085]">Enrollments:</span> <span className="text-[#667085]">{course.enrollments_count}</span></div>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: "modules", label: "Modules", count: course.modules.length },
          {
            id: "lessons",
            label: "Lessons",
            count: course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
          },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "modules" && (
          <ModulesTab courseId={course.id} modules={course.modules} onRefresh={fetchCourse} />
        )}
        {activeTab === "lessons" && (
          <LessonsTab courseId={course.id} modules={course.modules} onRefresh={fetchCourse} />
        )}
      </motion.div>
    </div>
  );
}

// ─── Modules Tab ──────────────────────────────────────────────────

function ModulesTab({ courseId, modules, onRefresh }: { courseId: string; modules: ModuleData[]; onRefresh: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", sort_order: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setForm({ name: "", description: "", sort_order: modules.length + 1 });
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(mod: ModuleData) {
    setForm({ name: mod.name, description: mod.description || "", sort_order: mod.sort_order });
    setEditingId(mod.id);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await adminFetch(`/courses/${courseId}/modules/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await adminFetch(`/courses/${courseId}/modules`, {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      setShowModal(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to save module:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await adminFetch(`/courses/${courseId}/modules/${deleteConfirm}`, { method: "DELETE" });
      setDeleteConfirm(null);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete module:", err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider">Course Modules</h3>
        <Button size="sm" onClick={openCreate} icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        }>
          Add Module
        </Button>
      </div>

      {modules.length === 0 ? (
        <EmptyState icon="📦" title="No modules yet" description="Create your first module for this course." />
      ) : (
        <div className="space-y-3">
          {modules
            .slice().sort((a, b) => a.sort_order - b.sort_order)
            .map((mod, idx) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="portal-card rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#5B4CF0]/10 text-[#5B4CF0] text-xs font-bold flex items-center justify-center shrink-0">
                        {mod.sort_order}
                      </span>
                      <h4 className="text-sm font-semibold text-white">{mod.name}</h4>
                    </div>
                    {mod.description && (
                      <p className="text-xs text-[#667085] mt-2 ml-10">{mod.description}</p>
                    )}
                    <p className="text-xs text-[#667085] mt-1 ml-10">{mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(mod)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(mod.id)} className="!text-red-400 hover:!bg-red-500/10">Delete</Button>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      <AdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Module" : "Add Module"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm text-[#667085] font-medium mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-[#ECEFF5] text-[#101828] placeholder:text-[#667085]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
            />
          </div>
          <Input
            label="Sort Order"
            type="number"
            value={form.sort_order || ""}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editingId ? "Update" : "Create"}</Button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Module"
        message="Are you sure you want to delete this module? This will also remove all lessons within it."
        confirmText="Delete"
        destructive
        loading={deleting}
      />
    </div>
  );
}

// ─── Lessons Tab ──────────────────────────────────────────────────

function LessonsTab({ courseId, modules, onRefresh }: { courseId: string; modules: ModuleData[]; onRefresh: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    video_url: "",
    duration_minutes: 0,
    module_id: "",
    sort_order: 0,
    status: "draft",
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const allLessons = modules.flatMap((m) => m.lessons);

  function openCreate() {
    setForm({
      title: "",
      slug: "",
      content: "",
      video_url: "",
      duration_minutes: 0,
      module_id: modules[0]?.id || "",
      sort_order: allLessons.length + 1,
      status: "draft",
    });
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(lesson: LessonData) {
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
      if (editingId) {
        await adminFetch(`/courses/${courseId}/lessons/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await adminFetch(`/courses/${courseId}/lessons`, {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      setShowModal(false);
      onRefresh();
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
      await adminFetch(`/courses/${courseId}/lessons/${deleteConfirm}`, { method: "DELETE" });
      setDeleteConfirm(null);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete lesson:", err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider">All Lessons</h3>
        <Button size="sm" onClick={openCreate} icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        }>
          Add Lesson
        </Button>
      </div>

      {modules.length === 0 ? (
        <EmptyState icon="📖" title="No modules yet" description="Create a module first before adding lessons." />
      ) : allLessons.length === 0 ? (
        <EmptyState icon="📖" title="No lessons yet" description="Add your first lesson to this course." />
      ) : (
        <div className="space-y-6">
          {modules
            .slice().sort((a, b) => a.sort_order - b.sort_order)
            .filter((m) => m.lessons.length > 0)
            .map((mod) => (
              <div key={mod.id}>
                <h4 className="text-sm font-semibold text-[#667085] mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#5B4CF0]/10 text-[#5B4CF0] text-[10px] font-bold flex items-center justify-center">
                    {mod.sort_order}
                  </span>
                  {mod.name}
                </h4>
                <div className="space-y-2">
                  {mod.lessons
                    .slice().sort((a, b) => a.sort_order - b.sort_order)
                    .map((lesson, idx) => (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="portal-card rounded-xl p-4 flex items-start justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#667085] w-5">#{lesson.sort_order}</span>
                            <h5 className="text-sm font-medium text-white">{lesson.title}</h5>
                            <Badge variant={statusVariant[lesson.status] || "info"}>{lesson.status}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 ml-7">
                            {lesson.duration_minutes && (
                              <span className="text-xs text-[#667085]">{lesson.duration_minutes} min</span>
                            )}
                            <span className="text-xs text-[#667085]">/{lesson.slug}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(lesson)}>Edit</Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(lesson.id)} className="!text-red-400 hover:!bg-red-500/10">Delete</Button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}

      <AdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Lesson" : "Add Lesson"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Input
              label="Video URL"
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
            />
            <Input
              label="Duration (minutes)"
              type="number"
              value={form.duration_minutes || ""}
              onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Module"
              value={form.module_id}
              onChange={(e) => setForm({ ...form, module_id: e.target.value })}
              options={modules.map((m) => ({ value: m.id, label: m.name }))}
              placeholder="Select module"
              required
            />
            <Input
              label="Sort Order"
              type="number"
              value={form.sort_order || ""}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
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
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editingId ? "Update" : "Create"}</Button>
          </div>
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
    </div>
  );
}
