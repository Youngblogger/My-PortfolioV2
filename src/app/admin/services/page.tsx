"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, type ServiceData } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { cn, formatCurrency } from "@/lib/utils";

interface ServiceFormData {
  title: string;
  slug: string;
  icon: string;
  short_description: string;
  starting_price_ngn: number;
  starting_price_usd: number;
}

const emptyForm: ServiceFormData = {
  title: "",
  slug: "",
  icon: "",
  short_description: "",
  starting_price_ngn: 0,
  starting_price_usd: 0,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getServices();
      setServices(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const filtered = services.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(svc: ServiceData) {
    setForm({
      title: svc.title,
      slug: svc.slug,
      icon: svc.icon,
      short_description: svc.short_description || "",
      starting_price_ngn: svc.starting_price_ngn,
      starting_price_usd: svc.starting_price_usd,
    });
    setEditingId(svc.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const { starting_price_usd, ...updateData } = form;
        await api.updateService(editingId, {
          ...updateData,
          starting_price_ngn: Number(form.starting_price_ngn),
        });
      } else {
        await api.createService({
          ...form,
          starting_price_ngn: Number(form.starting_price_ngn),
          starting_price_usd: Number(form.starting_price_usd) || undefined,
        });
      }
      setShowForm(false);
      fetchServices();
    } catch (err) {
      console.error("Failed to save service:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(svc: ServiceData) {
    try {
      await api.updateService(svc.id, { is_active: !(svc as any).is_active });
      fetchServices();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="section-label">SERVICES</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">Manage Services</h1>
          <p className="text-muted text-sm mt-1">Create and manage your service offerings.</p>
        </div>
        <Button onClick={openCreate} icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }>
          Create Service
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search services by title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage title="Failed to load services" message={error} onRetry={fetchServices} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="⚙️"
          title={search ? "No matching services" : "No services yet"}
          description={search ? "Try a different search term." : "Create your first service to get started."}
          action={!search ? { label: "Create Service", href: "#" } : undefined}
        />
      ) : (
        <>
          <div className="hidden md:block glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Title</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Slug</th>
                    <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Starting Price</th>
                    <th className="text-center text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                  {filtered.map((svc) => (
                    <motion.tr
                      key={svc.id}
                      variants={rowVariants}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{svc.icon}</span>
                          <span className="text-sm font-medium text-white">{svc.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">{svc.slug}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-white">
                        {formatCurrency(svc.starting_price_ngn)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={(svc as any).is_active === false ? "error" : "success"}>
                          {(svc as any).is_active === false ? "Inactive" : "Active"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(svc)}>
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(svc)}
                          >
                            {(svc as any).is_active === false ? "Activate" : "Archive"}
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4 md:hidden">
            {filtered.map((svc) => (
              <motion.div
                key={svc.id}
                variants={rowVariants}
                className="glass rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{svc.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white">{svc.title}</p>
                      <p className="text-xs text-muted">{svc.slug}</p>
                    </div>
                  </div>
                  <Badge variant={(svc as any).is_active === false ? "error" : "success"}>
                    {(svc as any).is_active === false ? "Inactive" : "Active"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <p className="text-lg font-bold text-gold">{formatCurrency(svc.starting_price_ngn)}</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(svc)}>Edit</Button>
                    <Button variant="outline" size="sm" onClick={() => handleToggleActive(svc)}>
                      {(svc as any).is_active === false ? "Activate" : "Archive"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ ease: [0.16, 1, 0.3, 1] as const }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">{editingId ? "Edit Service" : "Create Service"}</h2>
                  <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
                </div>
                <Input label="Icon (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} required />
                <Input label="Short Description" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Price (NGN)" type="number" value={form.starting_price_ngn || ""} onChange={(e) => setForm({ ...form, starting_price_ngn: Number(e.target.value) })} required />
                  <Input label="Price (USD)" type="number" value={form.starting_price_usd || ""} onChange={(e) => setForm({ ...form, starting_price_usd: Number(e.target.value) })} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" loading={submitting}>{editingId ? "Update" : "Create"}</Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
