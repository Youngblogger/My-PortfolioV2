"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AdminPageHeader, DataTable, ConfirmDialog } from "@/components/admin";
import type { Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { formatDate } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  author: string | null;
  status: "draft" | "published" | "scheduled";
  published_at: string | null;
  created_at: string;
}

interface PaginatedBlogPosts {
  data: BlogPost[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const statusTabs = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "published", label: "Published" },
  { id: "scheduled", label: "Scheduled" },
];

const statusVariant: Record<string, "gold" | "success" | "info" | "error"> = {
  draft: "gold",
  published: "success",
  scheduled: "info",
};

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

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [deleteConfirm, setDeleteConfirm] = useState<BlogPost | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (activeTab !== "all") params.set("status", activeTab);
      params.set("page", String(page));
      const res = await adminFetch<PaginatedBlogPosts>(`/api/v1/admin/blog?${params.toString()}`);
      setPosts(res.data.data);
      setTotalPages(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }, [search, activeTab, page]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { setPage(1); }, [search, activeTab]);

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      await adminFetch(`/api/v1/admin/blog/${deleteConfirm.id}`, { method: "DELETE" });
      setDeleteConfirm(null);
      fetchPosts();
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  }

  const columns: Column<BlogPost>[] = [
    {
      key: "title",
      header: "Title",
      render: (post) => (
        <Link href={`/admin/blog/${post.id}`} className="text-sm font-medium text-white hover:text-gold transition-colors">
          {post.title}
        </Link>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (post) => <span className="text-sm text-muted">{post.category || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "author",
      header: "Author",
      render: (post) => <span className="text-sm text-muted">{post.author || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      render: (post) => (
        <Badge variant={statusVariant[post.status] || "gold"}>
          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "published_at",
      header: "Published Date",
      render: (post) => (
        <span className="text-sm text-muted whitespace-nowrap">
          {post.published_at ? formatDate(post.published_at) : "—"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (post) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/blog/${post.id}`}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-muted hover:text-white hover:border-gold/30 transition-all"
          >
            Edit
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(post); }}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-red-400 hover:text-red-300 hover:border-red-400/30 transition-all"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <AdminPageHeader
        title="Blog Posts"
        description="Manage your blog content."
        actions={
          <Link href="/admin/blog/new">
            <Button icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }>
              New Post
            </Button>
          </Link>
        }
      />

      <Tabs
        tabs={statusTabs}
        activeTab={activeTab}
        onChange={(tab) => { setActiveTab(tab); setPage(1); }}
        className="mb-6"
      />

      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search blog posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage title="Failed to load blog posts" message={error} onRetry={fetchPosts} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon="📝"
          title={search || activeTab !== "all" ? "No matching posts" : "No blog posts yet"}
          description={search || activeTab !== "all" ? "Try adjusting your search or filters." : "Create your first blog post to get started."}
          action={!search && activeTab === "all" ? { label: "New Post", href: "/admin/blog/new" } : undefined}
        />
      ) : (
        <DataTable
          columns={columns}
          data={posts}
          keyExtractor={(post: BlogPost) => post.id}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
          <p className="text-sm text-muted">Page {page} of {totalPages} ({total} total)</p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
      />
    </motion.div>
  );
}
