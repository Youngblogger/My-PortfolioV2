"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, type ServiceData, type ProjectTypeSummaryData, type ProjectDetailData } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { formatCurrency } from "@/lib/utils";

interface PackageFormData {
  name: string;
  price_ngn: number;
  features: string;
}

const emptyForm: PackageFormData = { name: "", price_ngn: 0, features: "" };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function AdminPackagesPage() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedServiceSlug, setSelectedServiceSlug] = useState("");

  const [projectTypes, setProjectTypes] = useState<ProjectTypeSummaryData[]>([]);
  const [selectedProjectTypeId, setSelectedProjectTypeId] = useState("");

  const [projectDetail, setProjectDetail] = useState<ProjectDetailData | null>(null);

  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PackageFormData>(emptyForm);
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

  useEffect(() => {
    const svc = services.find((s) => s.id === selectedServiceId);
    setSelectedServiceSlug(svc?.slug || "");
    setSelectedProjectTypeId("");
    setProjectTypes([]);
    setProjectDetail(null);
  }, [selectedServiceId, services]);

  const fetchProjectTypes = useCallback(async () => {
    if (!selectedServiceSlug) return;
    setLoadingTypes(true);
    try {
      const res = await api.getProjectTypes(selectedServiceSlug);
      setProjectTypes(res.data || []);
    } catch (err) {
      console.error("Failed to load project types:", err);
    } finally {
      setLoadingTypes(false);
    }
  }, [selectedServiceSlug]);

  useEffect(() => { fetchProjectTypes(); }, [fetchProjectTypes]);

  const fetchDetail = useCallback(async () => {
    if (!selectedServiceSlug || !selectedProjectTypeId) {
      setProjectDetail(null);
      return;
    }
    setLoadingDetail(true);
    setError(null);
    try {
      const found = projectTypes.find((pt) => pt.id === selectedProjectTypeId);
      if (found) {
        const res = await api.getProjectType(selectedServiceSlug, found.slug);
        setProjectDetail(res.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load packages");
    } finally {
      setLoadingDetail(false);
    }
  }, [selectedServiceSlug, selectedProjectTypeId, projectTypes]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const packages = projectDetail?.packages || [];
  const filtered = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedProjectType = projectTypes.find((pt) => pt.id === selectedProjectTypeId);

  function openCreate() {
    if (!selectedProjectTypeId) return;
    setForm(emptyForm);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProjectTypeId) return;
    setSubmitting(true);
    try {
      await api.createPackage({
        project_type_id: selectedProjectTypeId,
        name: form.name,
        price_ngn: Number(form.price_ngn),
        features: form.features ? form.features.split("\n").map((f) => f.trim()).filter(Boolean) : undefined,
      });
      setShowForm(false);
      fetchDetail();
    } catch (err) {
      console.error("Failed to create package:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="section-label">PACKAGES</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">Manage Packages</h1>
          <p className="text-muted text-sm mt-1">Select a service and project type to manage its packages.</p>
        </div>
        {selectedProjectTypeId && (
          <Button onClick={openCreate} icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }>
            Create Package
          </Button>
        )}
      </div>

      <div className="glass rounded-2xl p-5 mb-6 space-y-4">
        <Select
          label="Select Service"
          placeholder="Choose a service..."
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          options={services.map((s) => ({ value: s.id, label: `${s.icon} ${s.title}` }))}
        />
        {selectedServiceSlug && (
          <Select
            label="Select Project Type"
            placeholder="Choose a project type..."
            value={selectedProjectTypeId}
            onChange={(e) => setSelectedProjectTypeId(e.target.value)}
            options={projectTypes.map((pt) => ({ value: pt.id, label: `${pt.icon || ""} ${pt.title}` }))}
          />
        )}
      </div>

      {selectedProjectTypeId && (
        <div className="mb-6">
          <Input
            placeholder="Search packages by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {loadingServices || loadingTypes ? (
        <div className="glass rounded-2xl p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage title="Failed to load" message={error} onRetry={fetchDetail} />
      ) : !selectedProjectTypeId ? (
        <EmptyState icon="📦" title="Select a service and project type" description="Choose from the dropdowns above to view packages." />
      ) : loadingDetail ? (
        <div className="glass rounded-2xl p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📦"
          title={search ? "No matching packages" : "No packages yet"}
          description={search ? "Try a different search term." : `Add packages to ${selectedProjectType?.title}.`}
          action={!search ? { label: "Create Package", href: "#" } : undefined}
        />
      ) : (
        <>
          <div className="hidden md:block glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Name</th>
                    <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Price</th>
                    <th className="text-center text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Recommended</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Features</th>
                  </tr>
                </thead>
                <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                  {filtered.map((pkg) => (
                    <motion.tr
                      key={pkg.id}
                      variants={rowVariants}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-white">{pkg.name}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-white">
                        {formatCurrency(pkg.price_ngn)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {pkg.is_recommended ? (
                          <Badge variant="gold">Recommended</Badge>
                        ) : (
                          <span className="text-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(pkg.features || []).slice(0, 3).map((f, i) => (
                            <Badge key={i} variant="info">{f}</Badge>
                          ))}
                          {(pkg.features || []).length > 3 && (
                            <span className="text-xs text-muted">+{pkg.features!.length - 3} more</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4 md:hidden">
            {filtered.map((pkg) => (
              <motion.div
                key={pkg.id}
                variants={rowVariants}
                className="glass rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-bold text-white">{pkg.name}</p>
                  {pkg.is_recommended && <Badge variant="gold">Recommended</Badge>}
                </div>
                <p className="text-lg font-bold text-gold">{formatCurrency(pkg.price_ngn)}</p>
                {(pkg.features || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(pkg.features || []).slice(0, 3).map((f, i) => (
                      <Badge key={i} variant="info">{f}</Badge>
                    ))}
                  </div>
                )}
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
                  <h2 className="text-xl font-bold text-white">Create Package</h2>
                  <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-muted">
                  Service: <span className="text-white font-medium">{selectedService?.title}</span>
                  &nbsp;&middot;&nbsp;
                  Project Type: <span className="text-white font-medium">{selectedProjectType?.title}</span>
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <Input label="Price (NGN)" type="number" value={form.price_ngn || ""} onChange={(e) => setForm({ ...form, price_ngn: Number(e.target.value) })} required />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm text-white/80 font-medium">Features (one per line)</label>
                  <textarea
                    value={form.features}
                    onChange={(e) => setForm({ ...form, features: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
                    placeholder="Responsive design&#10;SEO optimization&#10;5 pages"
                  />
                </div>
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
