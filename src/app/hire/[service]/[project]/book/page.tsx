"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api, type AddOnCategoryData, type ProjectDetailData } from "@/lib/api";
import { useBooking } from "@/contexts/BookingContext";

const steps = [
  { id: 1, label: "Add-ons" },
  { id: 2, label: "Summary" },
];

export default function BookPage() {
  const { service: serviceSlug, project: projectSlug } = useParams<{ service: string; project: string }>();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [addOns, setAddOns] = useState<AddOnCategoryData[]>([]);
  const [projectData, setProjectData] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatePrice, setAnimatePrice] = useState(false);
  const { state, toggleAddOn } = useBooking();

  useEffect(() => {
    Promise.all([
      api.getAddOns(),
      api.getProjectType(serviceSlug, projectSlug),
    ]).then(([addOnRes, projectRes]) => {
      setAddOns(addOnRes.data);
      setProjectData(projectRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [serviceSlug, projectSlug]);

  const addOnsTotalNgn = useMemo(
    () => state.addOns.reduce((sum, a) => sum + a.price_ngn, 0),
    [state.addOns]
  );
  const packagePriceNgn = state.package?.price_ngn || 0;
  const grandTotalNgn = packagePriceNgn + addOnsTotalNgn;

  const handleToggleAddOn = (item: { id: string; name: string; price_ngn: number; price_usd: number }) => {
    toggleAddOn(item);
    setAnimatePrice(true);
    setTimeout(() => setAnimatePrice(false), 300);
  };

  const handleProceedToRequirements = () => {
    router.push(`/hire/${serviceSlug}/${projectSlug}/requirements`);
  };

  const progressPercent = (currentStep / steps.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 animate-pulse space-y-4">
          <div className="h-8 w-64 bg-white/10 rounded" />
          <div className="h-4 w-96 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (!state.service || !state.projectType || !state.package) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-muted mb-4">No project selected. Please start from the beginning.</p>
          <Link href="/hire" className="text-gold hover:underline">Choose a Service</Link>
        </div>
      </div>
    );
  }

  return (
    <section className="relative pt-0 pb-16 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Progress */}
        <div className="mb-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted uppercase tracking-wider">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-xs text-muted">{steps.find((s) => s.id === currentStep)?.label}</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gold-gradient rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((s) => (
              <span key={s.id} className={`text-xs ${currentStep >= s.id ? "text-gold" : "text-muted"}`}>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="addons"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-8">
                    <span className="section-label">STEP 4</span>
                    <h2 className="text-3xl md:text-4xl font-bold mt-2">
                      Optional <span className="text-gradient">Add-ons</span>
                    </h2>
                    <p className="text-muted mt-2">Customize your project with additional services. Price updates instantly.</p>
                  </div>

                  <div className="space-y-8">
                    {addOns.map((category) => (
                      <div key={category.category}>
                        <h3 className="text-lg font-bold text-white mb-4">{category.category}</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {category.items.map((item) => {
                            const selected = state.addOns.some((a) => a.id === item.id);
                            return (
                              <motion.div
                                key={item.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => handleToggleAddOn({
                                  id: item.id,
                                  name: item.name,
                                  price_ngn: item.price_ngn,
                                  price_usd: item.price_usd,
                                })}
                                className={`glass rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                                  selected ? "gold-border ring-1 ring-gold/20" : "hover:bg-white/5"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                                        selected ? "border-gold bg-gold" : "border-white/20"
                                      }`}>
                                        {selected && <span className="text-background text-xs font-bold">✓</span>}
                                      </div>
                                      <span className="text-sm font-medium text-white truncate">{item.name}</span>
                                    </div>
                                    {item.description && (
                                      <p className="text-xs text-muted mt-1 ml-6 line-clamp-2">{item.description}</p>
                                    )}
                                  </div>
                                  <span className="text-sm text-gold font-semibold shrink-0 ml-3">
                                    +₦{item.price_ngn.toLocaleString()}
                                  </span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 flex items-center justify-between">
                    <Link
                      href={`/hire/${serviceSlug}/${projectSlug}`}
                      className="text-sm text-muted hover:text-white transition-colors"
                    >
                      ← Back to Packages
                    </Link>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-8 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
                    >
                      Review Summary →
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-8">
                    <span className="section-label">STEP 5</span>
                    <h2 className="text-3xl md:text-4xl font-bold mt-2">
                      Project <span className="text-gradient">Summary</span>
                    </h2>
                    <p className="text-muted mt-2">Review your selections before proceeding to checkout.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-xs text-muted uppercase tracking-wider mb-1">Service</h3>
                      <p className="text-white font-semibold">{state.service.title}</p>
                    </div>
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-xs text-muted uppercase tracking-wider mb-1">Project</h3>
                      <p className="text-white font-semibold">{state.projectType.title}</p>
                    </div>
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-xs text-muted uppercase tracking-wider mb-1">Package</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-white font-semibold">
                          {state.package.name} — ₦{packagePriceNgn.toLocaleString()}
                        </p>
                        <Link
                          href={`/hire/${serviceSlug}/${projectSlug}`}
                          className="text-xs text-gold hover:underline"
                        >
                          Change
                        </Link>
                      </div>
                      {projectData?.packages.find((p) => p.id === state.package?.id)?.features && (
                        <ul className="mt-3 space-y-1">
                          {projectData.packages
                            .find((p) => p.id === state.package?.id)
                            ?.features?.slice(0, 5)
                            .map((f) => (
                              <li key={f} className="text-xs text-muted flex items-center gap-1.5">
                                <span className="text-gold">✓</span> {f}
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                    {state.addOns.length > 0 && (
                      <div className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs text-muted uppercase tracking-wider">Add-ons ({state.addOns.length})</h3>
                          <button
                            onClick={() => setCurrentStep(1)}
                            className="text-xs text-gold hover:underline"
                          >
                            Change
                          </button>
                        </div>
                        <div className="space-y-2">
                          {state.addOns.map((a) => (
                            <div key={a.id} className="flex items-center justify-between text-sm">
                              <span className="text-white">{a.name}</span>
                              <span className="text-gold">+₦{a.price_ngn.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-sm text-muted hover:text-white transition-colors"
                    >
                      ← Back to Add-ons
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Price Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-32">
              <h3 className="text-sm font-bold text-white mb-4">Order Total</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Package</span>
                  <span className="text-white">₦{packagePriceNgn.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Add-ons</span>
                  <span className="text-white">+₦{addOnsTotalNgn.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/10 pt-3" />
                <motion.div
                  className="flex justify-between font-bold"
                  animate={animatePrice ? { scale: [1, 1.03, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-white">Total</span>
                  <span className="text-gold text-lg">₦{grandTotalNgn.toLocaleString()}</span>
                </motion.div>
                <div className="text-xs text-muted">
                  <p>Timeline: {state.package?.name ? projectData?.packages.find((p) => p.id === state.package?.id)?.estimated_timeline : ""}</p>
                  <p className="mt-1">Support: {state.package?.name ? projectData?.packages.find((p) => p.id === state.package?.id)?.support_period : ""}</p>
                </div>
              </div>

              <button
                onClick={handleProceedToRequirements}
                className="w-full mt-6 px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
              >
                Continue to Requirements →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
