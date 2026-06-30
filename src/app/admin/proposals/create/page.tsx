"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PaginatedOrdersData } from "@/lib/api";

interface Milestone {
  name: string;
  description: string;
  due_date: string;
  amount_ngn: number;
}

interface PaymentSchedule {
  event: string;
  percentage: number;
  amount_ngn: number;
}

export default function CreateProposalPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PaginatedOrdersData["data"]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [serviceOrderId, setServiceOrderId] = useState("");
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [deliverables, setDeliverables] = useState<string[]>([""]);
  const [timelineDescription, setTimelineDescription] = useState("");
  const [totalNgn, setTotalNgn] = useState<number>(0);
  const [validUntil, setValidUntil] = useState("");
  const [includedFeatures, setIncludedFeatures] = useState<string[]>([""]);
  const [excludedItems, setExcludedItems] = useState<string[]>([""]);
  const [milestones, setMilestones] = useState<Milestone[]>([
    { name: "", description: "", due_date: "", amount_ngn: 0 },
  ]);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule[]>([
    { event: "", percentage: 0, amount_ngn: 0 },
  ]);
  const [termsAndConditions, setTermsAndConditions] = useState<string[]>([""]);

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      setLoadingOrders(true);
      try {
        const res = await api.getAdminOrders();
        if (!mounted) return;
        setOrders(res.data.data || []);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        if (mounted) setLoadingOrders(false);
      }
    }

    loadOrders();
    return () => { mounted = false; };
  }, []);

  function handleArrayChange<T>(index: number, value: T, arr: T[], setter: (arr: T[]) => void) {
    const updated = [...arr];
    updated[index] = value;
    setter(updated);
  }

  function handleAddItem<T>(defaultValue: T, setter: React.Dispatch<React.SetStateAction<T[]>>) {
    setter((prev) => [...prev, defaultValue]);
  }

  function handleRemoveItem<T>(index: number, setter: React.Dispatch<React.SetStateAction<T[]>>) {
    setter((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceOrderId) {
      setError("Please select an order");
      return;
    }

    setSubmitting(true);
    setError(null);

    const nonEmpty = (arr: string[]) => arr.filter((s) => s.trim().length > 0);
    const validMilestones = milestones.filter((m) => m.name.trim().length > 0);
    const validPaymentSchedule = paymentSchedule.filter((p) => p.event.trim().length > 0);

    try {
      const res = await api.createProposal({
        service_order_id: serviceOrderId,
        scope_of_work: scopeOfWork,
        deliverables: nonEmpty(deliverables),
        timeline_description: timelineDescription,
        total_ngn: totalNgn,
        valid_until: validUntil || undefined,
        included_features: nonEmpty(includedFeatures).length > 0 ? nonEmpty(includedFeatures) : undefined,
        excluded_items: nonEmpty(excludedItems).length > 0 ? nonEmpty(excludedItems) : undefined,
        milestones: validMilestones.length > 0 ? validMilestones : undefined,
        payment_schedule: validPaymentSchedule.length > 0 ? validPaymentSchedule : undefined,
        terms_and_conditions: nonEmpty(termsAndConditions).length > 0 ? nonEmpty(termsAndConditions) : undefined,
      });

      router.push(`/proposals/${res.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create proposal");
    } finally {
      setSubmitting(false);
    }
  }

  const orderOptions = orders.map((o) => ({
    value: o.id,
    label: `${o.order_number} - ${o.project_name || o.service?.title || "Untitled"} (${o.user?.profile?.full_name || "Unknown"})`,
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <span className="section-label">PROPOSALS</span>
        <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">
          Create Proposal
        </h1>
        <p className="text-muted text-sm mt-1">
          Generate a new proposal from an existing service order.
        </p>
      </div>

      {error && (
        <div className="mb-6 glass rounded-xl px-5 py-3 border border-red-500/20 bg-red-500/5">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {loadingOrders ? (
        <div className="glass rounded-2xl p-8 space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Order Selection */}
          <div className="glass rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Order Information</h2>
            <Select
              label="Service Order"
              placeholder="Select an order..."
              options={orderOptions}
              value={serviceOrderId}
              onChange={(e) => setServiceOrderId(e.target.value)}
              required
            />
          </div>

          {/* Scope & Timeline */}
          <div className="glass rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Scope & Timeline</h2>

            <div className="space-y-1.5">
              <label className="block text-sm text-white/80 font-medium">Scope of Work</label>
              <textarea
                value={scopeOfWork}
                onChange={(e) => setScopeOfWork(e.target.value)}
                rows={4}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-y"
                placeholder="Describe the scope of work in detail..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm text-white/80 font-medium">Timeline Description</label>
              <textarea
                value={timelineDescription}
                onChange={(e) => setTimelineDescription(e.target.value)}
                rows={3}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-y"
                placeholder="Describe the project timeline..."
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="glass rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Pricing</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <Input
                label="Total (NGN)"
                type="number"
                min={0}
                value={totalNgn || ""}
                onChange={(e) => setTotalNgn(Number(e.target.value))}
                required
                placeholder="e.g. 500000"
              />
              <Input
                label="Valid Until"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          {/* Deliverables */}
          <ArraySection
            title="Deliverables"
            items={deliverables}
            onAdd={() => handleAddItem<string>("", setDeliverables)}
            onRemove={(i) => handleRemoveItem(i, setDeliverables)}
            onChange={(i, v) => handleArrayChange(i, v, deliverables, setDeliverables)}
            placeholder="e.g. Responsive website with 5 pages"
          />

          {/* Included Features */}
          <ArraySection
            title="Included Features"
            items={includedFeatures}
            onAdd={() => handleAddItem<string>("", setIncludedFeatures)}
            onRemove={(i) => handleRemoveItem(i, setIncludedFeatures)}
            onChange={(i, v) => handleArrayChange(i, v, includedFeatures, setIncludedFeatures)}
            placeholder="e.g. SEO optimization"
          />

          {/* Excluded Items */}
          <ArraySection
            title="Excluded Items"
            items={excludedItems}
            onAdd={() => handleAddItem<string>("", setExcludedItems)}
            onRemove={(i) => handleRemoveItem(i, setExcludedItems)}
            onChange={(i, v) => handleArrayChange(i, v, excludedItems, setExcludedItems)}
            placeholder="e.g. Content creation"
          />

          {/* Milestones */}
          <div className="glass rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Milestones</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddItem({ name: "", description: "", due_date: "", amount_ngn: 0 }, setMilestones as any)}
              >
                + Add
              </Button>
            </div>
            <AnimatePresence>
              {milestones.map((milestone, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted font-medium uppercase">Milestone {i + 1}</span>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(i, setMilestones as any)}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      value={milestone.name}
                      onChange={(e) => {
                        const updated = [...milestones];
                        updated[i] = { ...updated[i], name: e.target.value };
                        setMilestones(updated);
                      }}
                      placeholder="e.g. Design Approval"
                    />
                    <Input
                      label="Due Date"
                      type="date"
                      value={milestone.due_date}
                      onChange={(e) => {
                        const updated = [...milestones];
                        updated[i] = { ...updated[i], due_date: e.target.value };
                        setMilestones(updated);
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm text-white/80 font-medium">Description</label>
                    <textarea
                      value={milestone.description}
                      onChange={(e) => {
                        const updated = [...milestones];
                        updated[i] = { ...updated[i], description: e.target.value };
                        setMilestones(updated);
                      }}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-y"
                      placeholder="Describe this milestone..."
                    />
                  </div>
                  <Input
                    label="Amount (NGN)"
                    type="number"
                    min={0}
                    value={milestone.amount_ngn || ""}
                    onChange={(e) => {
                      const updated = [...milestones];
                      updated[i] = { ...updated[i], amount_ngn: Number(e.target.value) };
                      setMilestones(updated);
                    }}
                    placeholder="e.g. 250000"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Payment Schedule */}
          <div className="glass rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Payment Schedule</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddItem({ event: "", percentage: 0, amount_ngn: 0 }, setPaymentSchedule as any)}
              >
                + Add
              </Button>
            </div>
            <AnimatePresence>
              {paymentSchedule.map((schedule, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted font-medium uppercase">Payment {i + 1}</span>
                    {paymentSchedule.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(i, setPaymentSchedule as any)}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Input
                      label="Event"
                      value={schedule.event}
                      onChange={(e) => {
                        const updated = [...paymentSchedule];
                        updated[i] = { ...updated[i], event: e.target.value };
                        setPaymentSchedule(updated);
                      }}
                      placeholder="e.g. Initial Deposit"
                    />
                    <Input
                      label="Percentage (%)"
                      type="number"
                      min={0}
                      max={100}
                      value={schedule.percentage || ""}
                      onChange={(e) => {
                        const updated = [...paymentSchedule];
                        updated[i] = { ...updated[i], percentage: Number(e.target.value) };
                        setPaymentSchedule(updated);
                      }}
                      placeholder="e.g. 50"
                    />
                    <Input
                      label="Amount (NGN)"
                      type="number"
                      min={0}
                      value={schedule.amount_ngn || ""}
                      onChange={(e) => {
                        const updated = [...paymentSchedule];
                        updated[i] = { ...updated[i], amount_ngn: Number(e.target.value) };
                        setPaymentSchedule(updated);
                      }}
                      placeholder="e.g. 250000"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Terms & Conditions */}
          <ArraySection
            title="Terms & Conditions"
            items={termsAndConditions}
            onAdd={() => handleAddItem<string>("", setTermsAndConditions)}
            onRemove={(i) => handleRemoveItem(i, setTermsAndConditions)}
            onChange={(i, v) => handleArrayChange(i, v, termsAndConditions, setTermsAndConditions)}
            placeholder="e.g. Payment is due within 30 days of invoice"
          />

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" loading={submitting} size="lg">
              Create Proposal
            </Button>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-muted hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
}

function ArraySection({
  title,
  items,
  onAdd,
  onRemove,
  onChange,
  placeholder,
}: {
  title: string;
  items: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          + Add
        </Button>
      </div>
      <AnimatePresence>
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="flex-1">
              <Input
                value={item}
                onChange={(e) => onChange(i, e.target.value)}
                placeholder={placeholder}
              />
            </div>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-red-400 hover:text-red-300 text-sm transition-colors shrink-0"
              >
                Remove
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
