"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AdminPageHeader, DataTable, AdminModal, ConfirmDialog } from "@/components/admin";
import type { Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  client_name: string | null;
  status: string;
  is_featured: boolean;
  sort_order: number;
  description?: string;
  technologies?: string[];
  project_url?: string;
  is_case_study?: boolean;
}

interface PaginatedPortfolio {
  data: PortfolioItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface PortfolioFormData {
  title: string;
  slug: string;
  description: string;
  category: string;
  technologies: string;
  client_name: string;
  project_url: string;
  is_featured: boolean;
  is_case_study: boolean;
  status: string;
}

const emptyForm: PortfolioFormData = {
  title: "",
  slug: "",
  description: "",
  category: "",
  technologies: "",
  client_name: "",
  project_url: "",
  is_featured: false,
  is_case_study: false,
  status: "draft",
};

const categories = [
  "Web Development",
  "Mobile App",
  "UI/UX Design",
  "Branding",
  "E-commerce",
  "CMS",
  "API",
  "Other",
];

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

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PortfolioFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<PortfolioItem | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      const res = await adminFetch<PaginatedPortfolio>(`/api/v1/admin/portfolio?${params.toString()}`);
      setItems(res.data.data);
      setTotalPages(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio items");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setPage(1); }, [search]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(item: PortfolioItem) {
    setForm({
      title: item.title,
      slug: item.slug,
      description: item.description || "",
      category: item.category,
      technologies: (item.technologies || []).join(", "),
      client_name: item.client_name || "",
      project_url: item.project_url || "",
      is_featured: item.is_featured,
      is_case_study: item.is_case_study || false,
      status: item.status,
    });
    setEditingId(item.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        ...form,
        technologies: form.technologies ? form.technologies.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      if (editingId) {
        await adminFetch(`/api/v1/admin/portfolio/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await adminFetch("/api/v1/admin/portfolio", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setShowForm(false);
      fetchItems();
    } catch (err) {
      console.error("Failed to save portfolio item:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      await adminFetch(`/api/v1/admin/portfolio/${deleteConfirm.id}`, { method: "DELETE" });
      setDeleteConfirm(null);
      fetchItems();
    } catch (err) {
      console.error("Failed to delete portfolio item:", err);
    }
  }

  async function handleToggleFeatured(item: PortfolioItem) {
    try {
      await adminFetch(`/api/v1/admin/portfolio/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_featured: !item.is_featured }),
      });
      fetchItems();
    } catch (err) {
      console.error("Failed to toggle featured:", err);
    }
  }

  const columns: Column<PortfolioItem>[] = [
    {
      key: "title",
      header: "Title",
      render: (item) => (
        <Link href={`/admin/portfolio/${item.id}`} className="text-sm font-medium text-[#101828] hover:text-[#5B4CF0] transition-colors">
          {item.title}
        </Link>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item) => <Badge>{item.category}</Badge>,
      hideOnMobile: true,
    },
    {
      key: "client_name",
      header: "Client",
      render: (item) => <span className="text-sm text-[#667085]">{item.client_name || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge variant={item.status === "published" ? "success" : item.status === "draft" ? "gold" : "info"}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: "is_featured",
      header: "Featured",
      render: (item) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleFeatured(item); }}
          className="transition-colors"
        >
          {item.is_featured ? (
            <svg className="w-5 h-5 text-[#5B4CF0]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-[#667085] hover:text-[#5B4CF0]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          )}
        </button>
      ),
    },
    {
      key: "sort_order",
      header: "Sort Order",
      render: (item) => <span className="text-sm text-[#667085]">{item.sort_order}</span>,
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(item); }}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(item); }}>
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
        title="Portfolio Items"
        description="Manage your portfolio showcase."
        actions={
          <Button onClick={openCreate} icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          }>
            Add Portfolio Item
          </Button>
        }
      />

      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search portfolio items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="portal-card rounded-2xl p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage title="Failed to load portfolio" message={error} onRetry={fetchItems} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="🖼️"
          title={search ? "No matching items" : "No portfolio items yet"}
          description={search ? "Try a different search term." : "Add your first portfolio item to showcase your work."}
          action={!search ? { label: "Add Portfolio Item", href: "#" } : undefined}
        />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          keyExtractor={(item: PortfolioItem) => item.id}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#ECEFF5]">
          <p className="text-sm text-[#667085]">Page {page} of {totalPages} ({total} total)</p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <AdminModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? "Edit Portfolio Item" : "Add Portfolio Item"}
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting}>{editingId ? "Update" : "Create"}</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
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
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={categories.map((c) => ({ value: c, label: c }))}
              required
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ]}
              required
            />
          </div>
          <Input
            label="Technologies (comma-separated)"
            value={form.technologies}
            onChange={(e) => setForm({ ...form, technologies: e.target.value })}
            placeholder="React, Node.js, TypeScript"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Client Name" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
            <Input label="Project URL" value={form.project_url} onChange={(e) => setForm({ ...form, project_url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-[#667085] cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-4 h-4 rounded border-[#ECEFF5] bg-gray-50 accent-gold"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-[#667085] cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_case_study}
                onChange={(e) => setForm({ ...form, is_case_study: e.target.checked })}
                className="w-4 h-4 rounded border-[#ECEFF5] bg-gray-50 accent-gold"
              />
              Case Study
            </label>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Portfolio Item"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
      />
    </motion.div>
  );
}
