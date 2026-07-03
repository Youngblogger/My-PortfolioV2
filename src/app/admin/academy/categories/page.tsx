"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { DataTable, AdminPageHeader, AdminModal, ConfirmDialog } from "@/components/admin";
import type { Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";

interface CourseCategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  courses_count: number;
  created_at: string;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  icon: string;
}

const emptyForm: CategoryFormData = { name: "", slug: "", description: "", icon: "" };

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

export default function AdminCourseCategoriesPage() {
  const [categories, setCategories] = useState<CourseCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ success: boolean; data: CourseCategoryData[] }>("/course-categories");
      setCategories(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
    setShowModal(true);
  }

  function openEdit(cat: CourseCategoryData) {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      icon: cat.icon || "",
    });
    setEditingId(cat.id);
    setFormError(null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        await adminFetch(`/course-categories/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await adminFetch("/course-categories", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await adminFetch(`/course-categories/${deleteConfirm}`, { method: "DELETE" });
      setDeleteConfirm(null);
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<CourseCategoryData>[] = [
    {
      key: "name",
      header: "Name",
      render: (cat) => (
        <div className="flex items-center gap-3">
          {cat.icon && <span className="text-lg">{cat.icon}</span>}
          <span className="text-sm font-medium text-white">{cat.name}</span>
        </div>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      render: (cat) => <span className="text-sm text-[#667085]">/{cat.slug}</span>,
      hideOnMobile: true,
    },
    {
      key: "description",
      header: "Description",
      render: (cat) => (
        <span className="text-sm text-[#667085] truncate max-w-[200px] block">
          {cat.description || "—"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "icon",
      header: "Icon",
      render: (cat) => <span className="text-lg">{cat.icon || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "courses_count",
      header: "Courses",
      render: (cat) => <span className="text-sm text-[#667085]">{cat.courses_count}</span>,
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (cat) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(cat.id)} className="!text-red-400 hover:!bg-red-500/10">Delete</Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <AdminPageHeader
        title="Course Categories"
        description="Organize courses into categories"
        actions={
          <Button onClick={openCreate} icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          }>
            Add Category
          </Button>
        }
      />

      {error ? (
        <ErrorMessage title="Failed to load categories" message={error} onRetry={fetchCategories} />
      ) : (
        <DataTable
          columns={columns}
          data={categories}
          keyExtractor={(c) => c.id}
          emptyState={
            <EmptyState
              icon="🏷️"
              title="No categories yet"
              description="Create your first course category to get started."
              action={{ label: "Add Category", href: "#" }}
            />
          }
        />
      )}

      <AdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Category" : "Add Category"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting}>{editingId ? "Update" : "Create"}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{formError}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          </div>
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Icon (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
        </form>
      </AdminModal>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? Courses in this category will be uncategorized."
        confirmText="Delete"
        destructive
        loading={deleting}
      />
    </motion.div>
  );
}
