"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { DetailPageSkeleton } from "@/components/ui/PageSkeleton";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  technologies: string[] | null;
  client_name: string | null;
  project_url: string | null;
  featured_image: string | null;
  is_featured: boolean;
  is_case_study: boolean;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

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

export default function PortfolioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [clientName, setClientName] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isCaseStudy, setIsCaseStudy] = useState(false);
  const [status, setStatus] = useState("draft");
  const [sortOrder, setSortOrder] = useState(0);

  const fetchItem = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ item: PortfolioItem }>(`/api/v1/admin/portfolio/${id}`);
      const data = res.data.item;
      setItem(data);
      setTitle(data.title);
      setSlug(data.slug);
      setDescription(data.description || "");
      setCategory(data.category);
      setTechnologies((data.technologies || []).join(", "));
      setClientName(data.client_name || "");
      setProjectUrl(data.project_url || "");
      setFeaturedImage(data.featured_image);
      setIsFeatured(data.is_featured);
      setIsCaseStudy(data.is_case_study || false);
      setStatus(data.status);
      setSortOrder(data.sort_order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio item");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchItem(); }, [fetchItem]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await adminFetch(`/api/v1/admin/portfolio/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          slug,
          description,
          category,
          technologies: technologies ? technologies.split(",").map((t) => t.trim()).filter(Boolean) : [],
          client_name: clientName,
          project_url: projectUrl,
          is_featured: isFeatured,
          is_case_study: isCaseStudy,
          status,
          sort_order: sortOrder,
        }),
      });
      router.push("/admin/portfolio");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <DetailPageSkeleton />;

  if (error) {
    return <ErrorMessage title="Failed to load portfolio item" message={error} onRetry={fetchItem} />;
  }

  if (!item) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AdminPageHeader
        title="Edit Portfolio Item"
        description={`Editing: ${item.title}`}
        breadcrumbs={[
          { label: "Portfolio Items", href: "/admin/portfolio" },
          { label: item.title },
        ]}
      />

      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        <div className="portal-card rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-[#667085] font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-[#ECEFF5] text-[#101828] placeholder:text-[#667085]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categories.map((c) => ({ value: c, label: c }))}
              required
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            placeholder="React, Node.js, TypeScript"
          />
        </div>

        <div className="portal-card rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Client & Links</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Client Name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            <Input label="Project URL" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://..." />
          </div>
          <Input label="Sort Order" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </div>

        <div className="portal-card rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Featured Image</h2>
          {featuredImage && (
            <div className="relative rounded-xl overflow-hidden mb-4">
              <img src={featuredImage} alt="Featured" className="w-full h-48 object-cover" />
            </div>
          )}
          <Input
            label="Featured Image URL"
            value={featuredImage || ""}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-[#667085] cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-[#ECEFF5] bg-gray-50 accent-gold"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-[#667085] cursor-pointer">
              <input
                type="checkbox"
                checked={isCaseStudy}
                onChange={(e) => setIsCaseStudy(e.target.checked)}
                className="w-4 h-4 rounded border-[#ECEFF5] bg-gray-50 accent-gold"
              />
              Case Study
            </label>
          </div>
        </div>

        {saveError && (
          <div className="bg-red-600/10 border border-red-600/30 rounded-xl px-5 py-3">
            <p className="text-red-400 text-sm">{saveError}</p>
          </div>
        )}
        <div className="flex items-center gap-3 pt-4">
          <Button type="submit" loading={saving}>Save Changes</Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/portfolio")}>Cancel</Button>
        </div>
      </form>
    </motion.div>
  );
}
