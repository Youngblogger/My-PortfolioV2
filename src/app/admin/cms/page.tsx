"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader, AdminModal } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";

interface CmsSection {
  key: string;
  name: string;
  content: Record<string, string>;
  updated_at: string | null;
}

const sectionIcons: Record<string, string> = {
  hero: "🏠",
  about: "ℹ️",
  workflow: "⚙️",
  services: "🛠️",
  portfolio: "🖼️",
  testimonials: "⭐",
  faq: "❓",
  contact: "📬",
  footer: "🔻",
  seo: "🔍",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
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

function getPreviewText(content: Record<string, string>): string {
  const values = Object.values(content).filter(Boolean);
  if (values.length === 0) return "No content yet";
  const first = values[0];
  return first.length > 120 ? first.substring(0, 120) + "..." : first;
}

function getSectionLabel(key: string): string {
  const labels: Record<string, string> = {
    hero: "Hero Section",
    about: "About Section",
    workflow: "Workflow Section",
    services: "Services Section",
    portfolio: "Portfolio Section",
    testimonials: "Testimonials Section",
    faq: "FAQ Section",
    contact: "Contact Section",
    footer: "Footer Section",
    seo: "SEO Metadata",
  };
  return labels[key] || key;
}

export default function CmsPage() {
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingSection, setEditingSection] = useState<CmsSection | null>(null);
  const [formContent, setFormContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<CmsSection[]>("/api/v1/admin/cms-sections");
      setSections(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load CMS sections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  function openEditor(section: CmsSection) {
    setEditingSection(section);
    setFormContent({ ...section.content });
  }

  function handleFieldChange(key: string, value: string) {
    setFormContent((prev) => ({ ...prev, [key]: value }));
  }

  function renderFields() {
    if (!editingSection) return null;
    const fields = Object.keys(formContent);
    return (
      <div className="space-y-4">
        {fields.map((key) => (
          <div key={key}>
            {formContent[key] && formContent[key].length > 150 ? (
              <div className="space-y-1.5">
                <label className="block text-sm text-white/80 font-medium capitalize">
                  {key.replace(/_/g, " ")}
                </label>
                <textarea
                  value={formContent[key] || ""}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
                />
              </div>
            ) : (
              <Input
                label={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                value={formContent[key] || ""}
                onChange={(e) => handleFieldChange(key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  async function handleSave() {
    if (!editingSection) return;
    setSaving(true);
    try {
      await adminFetch(`/api/v1/admin/cms/${editingSection.key}`, {
        method: "PUT",
        body: JSON.stringify({ content: formContent }),
      });
      setEditingSection(null);
      fetchSections();
    } catch (err) {
      console.error("Failed to save CMS section:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <AdminPageHeader
        title="Website CMS"
        description="Edit the content of your website sections."
      />

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 space-y-4">
              <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
              <div className="h-9 w-20 bg-white/5 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorMessage title="Failed to load CMS sections" message={error} onRetry={fetchSections} />
      ) : sections.length === 0 ? (
        <EmptyState
          icon="📄"
          title="No CMS sections found"
          description="CMS sections will appear here once configured."
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {sections.map((section) => (
            <motion.div
              key={section.key}
              variants={cardVariants}
              className="glass rounded-2xl p-6 hover:bg-white/[0.03] transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{sectionIcons[section.key] || "📄"}</span>
                  <div>
                    <h3 className="text-base font-semibold text-white">{getSectionLabel(section.key)}</h3>
                    <p className="text-xs text-muted mt-0.5">
                      {section.updated_at
                        ? `Updated ${new Date(section.updated_at).toLocaleDateString()}`
                        : "Not yet saved"}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted mb-4 line-clamp-2">
                {getPreviewText(section.content)}
              </p>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openEditor(section)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Button>
              </div>
              {!section.content || Object.keys(section.content).length === 0 && (
                <p className="text-xs text-muted mt-2 italic">No content yet</p>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      <AdminModal
        open={!!editingSection}
        onClose={() => setEditingSection(null)}
        title={`Edit ${editingSection ? getSectionLabel(editingSection.key) : ""}`}
        size="xl"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setEditingSection(null)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        }
      >
        {editingSection && renderFields()}
      </AdminModal>
    </motion.div>
  );
}
