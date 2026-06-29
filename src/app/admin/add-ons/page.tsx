"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, type AddOnCategoryData, type AddOnItemData } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { formatCurrency } from "@/lib/utils";

interface AddOnFormData {
  name: string;
  slug: string;
  price_ngn: number;
  category: string;
}

const emptyForm: AddOnFormData = { name: "", slug: "", price_ngn: 0, category: "" };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function AdminAddOnsPage() {
  const [categories, setCategories] = useState<AddOnCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddOnFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchAddOns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAddOns();
      setCategories(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load add-ons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAddOns(); }, [fetchAddOns]);

  const allItems = categories.flatMap((c) => c.items);

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) &&
          (categoryFilter === "all" || cat.category === categoryFilter)
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  function openCreate() {
    setForm(emptyForm);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createAddOn({
        name: form.name,
        slug: form.slug,
        price_ngn: Number(form.price_ngn),
        category: form.category || undefined,
      });
      setShowForm(false);
      fetchAddOns();
    } catch (err) {
      console.error("Failed to create add-on:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((c) => ({ value: c.category, label: c.category })),
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="section-label">ADD-ONS</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">Manage Add-ons</h1>
          <p className="text-muted text-sm mt-1">Create and manage add-on items grouped by category.</p>
        </div>
        <Button onClick={openCreate} icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }>
          Create Add-on
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search add-ons by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={categoryOptions}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorMessage title="Failed to load add-ons" message={error} onRetry={fetchAddOns} />
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          icon="🧩"
          title={search || categoryFilter !== "all" ? "No matching add-ons" : "No add-ons yet"}
          description={search || categoryFilter !== "all" ? "Try a different search or filter." : "Create your first add-on to get started."}
          action={!search && categoryFilter === "all" ? { label: "Create Add-on", href: "#" } : undefined}
        />
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {filteredCategories.map((cat) => (
            <motion.div key={cat.category} variants={itemVariants} className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">{cat.category}</h3>
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Name</th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Slug</th>
                      <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Price</th>
                    </tr>
                  </thead>
                  <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                    {cat.items.map((item, i) => (
                      <motion.tr
                        key={item.id}
                        variants={itemVariants}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            {item.icon && <span className="text-lg">{item.icon}</span>}
                            <div>
                              <span className="text-sm font-medium text-white">{item.name}</span>
                              {item.description && (
                                <p className="text-xs text-muted mt-0.5">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-muted">{item.slug}</td>
                        <td className="px-6 py-3 text-sm text-right font-semibold text-white">
                          {formatCurrency(item.price_ngn)}
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 md:hidden">
                {cat.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      {item.icon && <span className="text-lg">{item.icon}</span>}
                      <div>
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-muted">{item.slug}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gold">{formatCurrency(item.price_ngn)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
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
                  <h2 className="text-xl font-bold text-white">Create Add-on</h2>
                  <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Price (NGN)" type="number" value={form.price_ngn || ""} onChange={(e) => setForm({ ...form, price_ngn: Number(e.target.value) })} required />
                  <Select
                    label="Category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    options={categories.map((c) => ({ value: c.category, label: c.category }))}
                    placeholder="Select category"
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
