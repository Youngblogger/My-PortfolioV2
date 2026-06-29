"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, type ServiceData, type ProjectTypeSummaryData } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { formatCurrency } from "@/lib/utils";

interface ProjectTypeFormData {
  title: string;
  slug: string;
  starting_price_ngn: number;
  icon: string;
}

const emptyForm: ProjectTypeFormData = {
  title: "",
  slug: "",
  starting_price_ngn: 0,
  icon: "",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function AdminProjectTypesPage() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [projectTypes, setProjectTypes] = useState<ProjectTypeSummaryData[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProjectTypeFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoadingServices(true);
      try {
        const res = await api.getServices();
        setServices(res.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load services");
      } finally {
        setLoadingServices(false);
      }
    }
    load();
  }, []);

  const fetchProjectTypes = useCallback(async () => {
    if (!selectedServiceId) {
      setProjectTypes([]);
      return;
    }
    setLoadingTypes(true);
    setError(null);
    try {
      const svc = services.find((s) => s.id === selectedServiceId);
      if (svc) {
        const res = await api.getProjectTypes(svc.slug);
        setProjectTypes(res.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project types");
    } finally {
      setLoadingTypes(false);
    }
  }, [selectedServiceId, services]);

  useEffect(() => { fetchProjectTypes(); }, [fetchProjectTypes]);

  const filtered = projectTypes.filter((pt) =>
    pt.title.toLowerCase().includes(search.toLowerCase()) ||
    pt.slug.toLowerCase().includes(search.toLowerCase())
  );

  const selectedService = services.find((s) => s.id === selectedServiceId);

  function openCreate() {
    if (!selectedServiceId) return;
    setForm(emptyForm);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedServiceId) return;
    setSubmitting(true);
    try {
      await api.createProjectType({
        service_id: selectedServiceId,
        ...form,
        starting_price_ngn: Number(form.starting_price_ngn),
        icon: form.icon || undefined,
      });
      setShowForm(false);
      fetchProjectTypes();
    } catch (err) {
      console.error("Failed to create project type:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="section-label">PROJECT TYPES</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">Manage Project Types</h1>
          <p className="text-muted text-sm mt-1">Select a service to manage its project types.</p>
        </div>
        {selectedServiceId && (
          <Button onClick={openCreate} icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }>
            Create Project Type
          </Button>
        )}
      </div>

      <div className="glass rounded-2xl p-5 mb-6">
        <Select
          label="Select Service"
          placeholder="Choose a service..."
          value={selectedServiceId}
          onChange={(e) => { setSelectedServiceId(e.target.value); setSearch(""); }}
          options={services.map((s) => ({ value: s.id, label: `${s.icon} ${s.title}` }))}
        />
      </div>

      {selectedServiceId && (
        <div className="mb-6">
          <Input
            placeholder="Search project types by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {loadingServices ? (
        <div className="glass rounded-2xl p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage title="Failed to load" message={error} onRetry={fetchProjectTypes} />
      ) : !selectedServiceId ? (
        <EmptyState icon="📋" title="Select a service" description="Choose a service from the dropdown above to view its project types." />
      ) : loadingTypes ? (
        <div className="glass rounded-2xl p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title={search ? "No matching project types" : "No project types yet"}
          description={search ? "Try a different search term." : `Add project types to ${selectedService?.title}.`}
          action={!search ? { label: "Create Project Type", href: "#" } : undefined}
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
                  </tr>
                </thead>
                <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                  {filtered.map((pt) => (
                    <motion.tr
                      key={pt.id}
                      variants={rowVariants}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {pt.icon && <span className="text-xl">{pt.icon}</span>}
                          <span className="text-sm font-medium text-white">{pt.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">{pt.slug}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-white">
                        {formatCurrency(pt.starting_price_ngn)}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4 md:hidden">
            {filtered.map((pt) => (
              <motion.div
                key={pt.id}
                variants={rowVariants}
                className="glass rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center gap-3">
                  {pt.icon && <span className="text-xl">{pt.icon}</span>}
                  <div>
                    <p className="text-sm font-bold text-white">{pt.title}</p>
                    <p className="text-xs text-muted">{pt.slug}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <p className="text-lg font-bold text-gold">{formatCurrency(pt.starting_price_ngn)}</p>
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
              transition={{ ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Create Project Type</h2>
                  <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-muted">Service: <span className="text-white font-medium">{selectedService?.title}</span></p>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
                </div>
                <Input label="Icon (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
                <Input label="Starting Price (NGN)" type="number" value={form.starting_price_ngn || ""} onChange={(e) => setForm({ ...form, starting_price_ngn: Number(e.target.value) })} required />
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" loading={submitting}>Create</Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
