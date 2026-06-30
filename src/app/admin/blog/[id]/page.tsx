"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AdminPageHeader, ConfirmDialog } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { DetailPageSkeleton } from "@/components/ui/PageSkeleton";
import { slugify } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: string | null;
  tags: string[] | null;
  featured_image: string | null;
  status: string;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
}

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

export default function EditBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState("draft");
  const [publishedAt, setPublishedAt] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ post: BlogPost }>(`/api/v1/admin/blog/${id}`);
      const post = res.data.post;
      setTitle(post.title);
      setSlug(post.slug);
      setContent(post.content);
      setExcerpt(post.excerpt || "");
      setCategory(post.category || "");
      setTags((post.tags || []).join(", "));
      setFeaturedImage(post.featured_image || "");
      setStatus(post.status);
      setPublishedAt(post.published_at ? post.published_at.split("T")[0] : "");
      setSeoTitle(post.seo_title || "");
      setSeoDescription(post.seo_description || "");
      setSeoKeywords(post.seo_keywords || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blog post");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(value));
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      await adminFetch(`/api/v1/admin/blog/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt: excerpt || undefined,
          category: category || undefined,
          tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          featured_image: featuredImage || undefined,
          status,
          published_at: status === "scheduled" && publishedAt ? publishedAt : undefined,
          seo_title: seoTitle || undefined,
          seo_description: seoDescription || undefined,
          seo_keywords: seoKeywords || undefined,
        }),
      });
      router.push("/admin/blog");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await adminFetch(`/api/v1/admin/blog/${id}`, { method: "DELETE" });
      router.push("/admin/blog");
    } catch (err) {
      console.error("Failed to delete post:", err);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <DetailPageSkeleton />;

  if (error) {
    return <ErrorMessage title="Failed to load blog post" message={error} onRetry={fetchPost} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AdminPageHeader
        title="Edit Blog Post"
        description={`Editing: ${title}`}
        breadcrumbs={[
          { label: "Blog Posts", href: "/admin/blog" },
          { label: title },
        ]}
      />

      <div className="max-w-3xl space-y-6">
        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Content</h2>
          <Input label="Title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          <div className="space-y-1.5">
            <label className="block text-sm text-white/80 font-medium">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-white/80 font-medium">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
            />
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Metadata</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Technology, Design" />
            <Input label="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="React, JavaScript, Web" />
          </div>
          <Input label="Featured Image URL" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="https://example.com/image.jpg" />
        </div>

        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Publishing</h2>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "scheduled", label: "Scheduled" },
              ]}
            />
            {status === "scheduled" && (
              <Input label="Publish Date" type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">SEO</h2>
          <Input label="SEO Title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
          <div className="space-y-1.5">
            <label className="block text-sm text-white/80 font-medium">SEO Description</label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
            />
          </div>
          <Input label="SEO Keywords" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="keyword1, keyword2, keyword3" />
        </div>

        {saveError && (
          <div className="bg-red-600/10 border border-red-600/30 rounded-xl px-5 py-3">
            <p className="text-red-400 text-sm">{saveError}</p>
          </div>
        )}
        <div className="flex items-center justify-between pt-4">
          <Button variant="ghost" onClick={() => setDeleteConfirm(true)}>
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Post
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => router.push("/admin/blog")}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        destructive
        loading={deleting}
      />
    </motion.div>
  );
}
