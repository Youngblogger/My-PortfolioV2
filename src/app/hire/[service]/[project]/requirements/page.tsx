"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api, type RequirementQuestionData, type RequirementResponsePayload } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const STEP_SIZE = 3;

type ResponseValue = string | string[] | boolean | number;

export default function RequirementsPage() {
  const { service: serviceSlug, project: projectSlug } = useParams<{ service: string; project: string }>();
  const router = useRouter();

  const [questions, setQuestions] = useState<RequirementQuestionData[]>([]);
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  const latestResponses = useRef(responses);
  latestResponses.current = responses;

  const storageKey = `requirements_${serviceSlug}_${projectSlug}`;

  useEffect(() => {
    if (!serviceSlug) return;
    setLoading(true);
    setFetchError(null);
    api
      .getRequirementQuestions(serviceSlug)
      .then((res) => {
        const qs = (res.data || []).sort((a, b) => a.sort_order - b.sort_order);
        setQuestions(qs);

        try {
          const saved = sessionStorage.getItem(storageKey);
          if (saved) {
            setResponses(JSON.parse(saved));
          }
        } catch {}

        setLoading(false);
      })
      .catch((err) => {
        setFetchError(err.message || "Failed to load requirements questions");
        setLoading(false);
      });
  }, [serviceSlug, projectSlug, storageKey]);

  const steps = useMemo(() => {
    const chunks: RequirementQuestionData[][] = [];
    for (let i = 0; i < questions.length; i += STEP_SIZE) {
      chunks.push(questions.slice(i, i + STEP_SIZE));
    }
    return chunks;
  }, [questions]);

  const isQuestionVisible = useCallback((q: RequirementQuestionData): boolean => {
    if (!q.conditional_on) return true;
    const parentValue = latestResponses.current[q.conditional_on];
    if (parentValue === undefined || parentValue === null || parentValue === "") return false;
    if (q.conditional_value === null) return true;
    return String(parentValue) === q.conditional_value;
  }, []);

  const visibleQuestions = useMemo(() => {
    if (!steps[currentStep]) return [];
    return steps[currentStep].filter(isQuestionVisible);
  }, [steps, currentStep, isQuestionVisible]);

  const validateStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let valid = true;

    for (const q of steps[currentStep] || []) {
      if (!isQuestionVisible(q)) continue;
      if (q.is_required) {
        const value = responses[q.question_key];
        if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
          newErrors[q.question_key] = "This field is required";
          valid = false;
        }
      }
    }

    setErrors(newErrors);
    return valid;
  }, [steps, currentStep, responses, isQuestionVisible]);

  const handleChange = useCallback((key: string, value: ResponseValue) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const saveResponses = useCallback(
    async (data: Record<string, ResponseValue>) => {
      setSaving(true);
      try {
        const payload: RequirementResponsePayload[] = Object.entries(data)
          .map(([key, value]) => {
            const question = questions.find((q) => q.question_key === key);
            if (!question) return null;
            return { question_id: question.id, value };
          })
          .filter((r): r is RequirementResponsePayload => r !== null);

        if (payload.length > 0) {
          await api.saveRequirementResponses({ responses: payload });
        }

        sessionStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        // Silently fail - sessionStorage still has the data
      }
      setSaving(false);
    },
    [questions, storageKey],
  );

  const handleNext = useCallback(async () => {
    if (!validateStep()) return;
    await saveResponses(responses);

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    } else {
      setCompleted(true);
    }
  }, [validateStep, saveResponses, responses, currentStep, steps.length]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  }, [currentStep]);

  const handleStepClick = useCallback(
    async (index: number) => {
      if (index >= currentStep) return;
      setCurrentStep(index);
      window.scrollTo(0, 0);
    },
    [currentStep],
  );

  const progressPercent = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  const renderField = (q: RequirementQuestionData) => {
    const value = responses[q.question_key];
    const error = errors[q.question_key];
    const label = q.is_required ? `${q.question} *` : q.question;
    const placeholder = q.placeholder || undefined;
    const required = q.is_required;

    switch (q.type) {
      case "text":
        return (
          <Input
            label={label}
            placeholder={placeholder}
            value={(value as string) || ""}
            onChange={(e) => handleChange(q.question_key, e.target.value)}
            error={error}
            required={required}
          />
        );

      case "textarea":
        return (
          <div className="space-y-1.5">
            <label className="block text-sm text-white/80 font-medium">{label}</label>
            <textarea
              value={(value as string) || ""}
              onChange={(e) => handleChange(q.question_key, e.target.value)}
              placeholder={placeholder}
              rows={4}
              required={required}
              className={`
                w-full px-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder:text-muted/50
                focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20
                transition-all duration-300 resize-none
                ${error ? "border-red-500/50" : ""}
              `}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
        );

      case "select":
        return (
          <Select
            label={label}
            placeholder={placeholder}
            options={(q.options || []).map((o) => ({ value: o, label: o }))}
            value={(value as string) || ""}
            onChange={(e) => handleChange(q.question_key, e.target.value)}
            error={error}
          />
        );

      case "boolean":
        return (
          <Checkbox
            label={label}
            checked={value === true || value === "true"}
            onChange={(checked) => handleChange(q.question_key, checked)}
            error={error}
          />
        );

      case "multi_select": {
        const selected = (Array.isArray(value) ? value : []) as string[];
        return (
          <div className="space-y-2">
            <label className="block text-sm text-white/80 font-medium mb-1">{label}</label>
            <div className="space-y-2">
              {(q.options || []).map((opt) => (
                <Checkbox
                  key={opt}
                  label={opt}
                  checked={selected.includes(opt)}
                  onChange={(checked) => {
                    handleChange(
                      q.question_key,
                      checked ? [...selected, opt] : selected.filter((v) => v !== opt),
                    );
                  }}
                />
              ))}
            </div>
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
        );
      }

      case "number":
        return (
          <Input
            label={label}
            placeholder={placeholder}
            type="number"
            value={(value as string) || ""}
            onChange={(e) => handleChange(q.question_key, e.target.value)}
            error={error}
            required={required}
          />
        );

      case "url":
        return (
          <Input
            label={label}
            placeholder={placeholder}
            type="url"
            value={(value as string) || ""}
            onChange={(e) => handleChange(q.question_key, e.target.value)}
            error={error}
            required={required}
          />
        );

      case "file":
        return (
          <div className="space-y-1.5">
            <label className="block text-sm text-white/80 font-medium">{label}</label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleChange(q.question_key, file.name);
              }}
              className="w-full text-sm text-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-gold/10 file:text-gold hover:file:bg-gold/20 file:cursor-pointer file:transition-colors"
            />
            {value && (
              <p className="text-xs text-gold mt-1">Selected: {value as string}</p>
            )}
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <section className="relative pt-32 pb-20 md:pt-40 overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <Skeleton className="h-4 w-24 mb-6" />
          <Skeleton className="h-10 w-72 mb-3" />
          <Skeleton className="h-5 w-96 mb-10" />
          <Skeleton className="h-1.5 w-full mb-8" />
          <div className="glass rounded-2xl p-8 space-y-6">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="flex justify-end mt-8">
            <Skeleton className="h-12 w-36" />
          </div>
        </div>
      </section>
    );
  }

  if (fetchError) {
    return (
      <section className="relative pt-32 pb-20 md:pt-40 overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <ErrorMessage
            title="Failed to load requirements"
            message={fetchError}
            onRetry={() => {
              setLoading(true);
              setFetchError(null);
              api
                .getRequirementQuestions(serviceSlug)
                .then((res) => {
                  const qs = (res.data || []).sort((a, b) => a.sort_order - b.sort_order);
                  setQuestions(qs);
                  setLoading(false);
                })
                .catch((err) => {
                  setFetchError(err.message || "Failed to load");
                  setLoading(false);
                });
            }}
          />
        </div>
      </section>
    );
  }

  if (questions.length === 0) {
    return (
      <section className="relative pt-32 pb-20 md:pt-40 overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No requirements needed</h3>
            <p className="text-muted text-sm mb-6 max-w-md mx-auto">
              This project type doesn&apos;t require any additional information. You can proceed with your booking.
            </p>
            <Link href={`/hire/${serviceSlug}/${projectSlug}/book`}>
              <Button>Continue to Booking</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (completed) {
    return (
      <section className="relative pt-32 pb-20 md:pt-40 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-surface" />
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>

            <span className="section-label">COMPLETE</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-4">
              Requirements <span className="text-gradient">Submitted</span>
            </h1>
            <p className="text-muted text-lg mb-8 max-w-lg mx-auto">
              Thank you! Your project requirements have been saved successfully.
              Our team will review them and get back to you shortly.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href={`/hire/review`}>
                <Button variant="primary" size="lg">
                  Review & Cost Estimate →
                </Button>
              </Link>
              <Link href={`/hire/${serviceSlug}/${projectSlug}`}>
                <Button variant="outline" size="lg">
                  Back to Project
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-32 pb-20 md:pt-40 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-surface" />
        <motion.div
          className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <Link
            href={`/hire/${serviceSlug}/${projectSlug}`}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors mb-6"
          >
            ← Back
          </Link>
          <span className="section-label">REQUIREMENTS</span>
          <h1 className="section-heading mt-2">
            Project <span className="text-gradient">Requirements</span>
          </h1>
          <p className="section-subtitle mt-3">
            Help us understand your project better by answering a few questions.
          </p>
        </motion.div>

        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted uppercase tracking-wider">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-xs text-muted">{Math.round(progressPercent)}% complete</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gold-gradient rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <div className="flex justify-between mt-3">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => handleStepClick(i)}
                disabled={i > currentStep}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                  transition-all duration-300
                  ${i === currentStep
                    ? "bg-gold-gradient text-background font-bold"
                    : i < currentStep
                    ? "bg-gold/20 text-gold cursor-pointer hover:bg-gold/30"
                    : "bg-white/5 text-muted cursor-default"
                  }
                `}
              >
                {i < currentStep ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stagger}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div variants={fadeUp} className="glass rounded-2xl p-8 space-y-6">
              <div className="space-y-6">
                {visibleQuestions.length === 0 ? (
                  <p className="text-muted text-sm text-center py-4">
                    No questions to display for this step.
                  </p>
                ) : (
                  visibleQuestions.map((q) => (
                    <motion.div key={q.id} variants={fadeUp}>
                      {renderField(q)}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            <div className="flex items-center justify-between mt-8">
              <div>
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="text-sm text-muted hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    ← Previous
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {saving && (
                  <span className="text-xs text-muted flex items-center gap-1.5">
                    <LoadingSpinner size="sm" />
                    Saving...
                  </span>
                )}
                <Button onClick={handleNext} loading={saving} disabled={visibleQuestions.length === 0 && steps[currentStep]?.length > 0}>
                  {currentStep < steps.length - 1 ? "Continue →" : "Submit Requirements"}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
