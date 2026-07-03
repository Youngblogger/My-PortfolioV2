"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader, DataTable, AdminModal, ConfirmDialog } from "@/components/admin";
import type { Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  posts_count: number;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
}

const emptyForm: CategoryFormData = { name: "", slug: "", description: "" };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

async function adminFetch<T>(endpoint: string, options?: RequestInit): Promise<{ success: boolean; data: T; message?: string }> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(endpoint, { ...options, headers, credentials: "include" });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || err.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<BlogCategory | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<BlogCategory[]>("/api/v1/admin/blog/categories");
      setCategories(res.data);
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
    setShowForm(true);
  }

  function openEdit(cat: BlogCategory) {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "" });
    setEditingId(cat.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await adminFetch(`/api/v1/admin/blog/categories/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await adminFetch("/api/v1/admin/blog/categories", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      console.error("Failed to save category:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      await adminFetch(`/api/v1/admin/blog/categories/${deleteConfirm.id}`, { method: "DELETE" });
      setDeleteConfirm(null);
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  }

  const columns: Column<BlogCategory>[] = [
    {
      key: "name",
      header: "Name",
      render: (cat) => <span className="text-sm font-medium text-white">{cat.name}</span>,
    },
    {
      key: "slug",
      header: "Slug",
      render: (cat) => <span className="text-sm text-[#667085]">{cat.slug}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (cat) => <span className="text-sm text-[#667085]">{cat.description || "—"}</span>,
    },
    {
      key: "posts_count",
      header: "Posts",
      render: (cat) => <Badge>{cat.posts_count}</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (cat) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(cat); }}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(cat); }}>
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <AdminPageHeader
        title="Blog Categories"
        description="Organize your blog posts with categories."
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

      {loading ? (
        <div className="portal-card rounded-2xl p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage title="Failed to load categories" message={error} onRetry={fetchCategories} />
      ) : categories.length === 0 ? (
        <EmptyState
          icon="📂"
          title="No categories yet"
          description="Create your first blog category to organize posts."
          action={{ label: "Add Category", href: "#" }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={categories}
          keyExtractor={(cat: BlogCategory) => cat.id}
        />
      )}

      <AdminModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? "Edit Category" : "Add Category"}
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting}>{editingId ? "Update" : "Create"}</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-[#667085] font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-[#ECEFF5] text-[#101828] placeholder:text-[#667085]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
            />
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? Posts in this category will not be deleted.`}
        confirmText="Delete"
        destructive
      />
    </motion.div>
  );
}
