"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { slugify } from "@/lib/utils";

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

export default function NewBlogPostPage() {
  const router = useRouter();

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
  const [saving, setSaving] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(value));
    }
  }

  async function handleSave(publishStatus: string) {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title,
        slug,
        content,
        excerpt,
        category: category || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        featured_image: featuredImage || undefined,
        status: publishStatus,
        seo_title: seoTitle || undefined,
        seo_description: seoDescription || undefined,
        seo_keywords: seoKeywords || undefined,
      };
      if (publishStatus === "scheduled" && publishedAt) {
        body.published_at = publishedAt;
      }
      await adminFetch("/api/v1/admin/blog", {
        method: "POST",
        body: JSON.stringify(body),
      });
      router.push("/admin/blog");
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AdminPageHeader
        title="New Blog Post"
        description="Create a new blog post."
        breadcrumbs={[
          { label: "Blog Posts", href: "/admin/blog" },
          { label: "New Post" },
        ]}
      />

      <div className="max-w-3xl space-y-6">
        <div className="portal-card rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Content</h2>
          <Input
            label="Title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />
          <Input
            label="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-sm text-[#667085] font-medium">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-[#ECEFF5] text-[#101828] placeholder:text-[#667085]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-[#667085] font-medium">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-[#ECEFF5] text-[#101828] placeholder:text-[#667085]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
            />
          </div>
        </div>

        <div className="portal-card rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Metadata</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Technology, Design"
            />
            <Input
              label="Tags (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="React, JavaScript, Web"
            />
          </div>
          <Input
            label="Featured Image URL"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="portal-card rounded-2xl p-6 space-y-5">
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
              <Input
                label="Publish Date"
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="portal-card rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">SEO</h2>
          <Input
            label="SEO Title"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-sm text-[#667085] font-medium">SEO Description</label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-[#ECEFF5] text-[#101828] placeholder:text-[#667085]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
            />
          </div>
          <Input
            label="SEO Keywords"
            value={seoKeywords}
            onChange={(e) => setSeoKeywords(e.target.value)}
            placeholder="keyword1, keyword2, keyword3"
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button onClick={() => handleSave("draft")} loading={saving} variant="secondary">
            Save as Draft
          </Button>
          <Button onClick={() => handleSave(status === "scheduled" ? "scheduled" : "published")} loading={saving}>
            {status === "scheduled" ? "Schedule" : "Publish"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push("/admin/blog")}>
            Cancel
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
