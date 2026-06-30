"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, type RequirementQuestionData, type ServiceData } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface QuestionFormData {
  question_key: string;
  question: string;
  type: string;
  service_id: string;
  project_type_id: string;
  options: string;
  is_required: boolean;
}

const emptyForm: QuestionFormData = {
  question_key: "",
  question: "",
  type: "text",
  service_id: "",
  project_type_id: "",
  options: "",
  is_required: true,
};

const typeOptions = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Select" },
  { value: "boolean", label: "Boolean" },
  { value: "multi_select", label: "Multi Select" },
  { value: "number", label: "Number" },
  { value: "url", label: "URL" },
  { value: "file", label: "File" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function AdminRequirementQuestionsPage() {
  const [questions, setQuestions] = useState<RequirementQuestionData[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<QuestionFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [qRes, sRes] = await Promise.all([
        api.getRequirementQuestionsAdmin(),
        api.getServices(),
      ]);
      setQuestions(qRes.data || []);
      setServices(sRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requirement questions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const filtered = questions.filter((q) => {
    const matchesSearch =
      q.question_key.toLowerCase().includes(search.toLowerCase()) ||
      q.question.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || q.type === typeFilter;
    return matchesSearch && matchesType;
  });

  function openCreate() {
    setForm(emptyForm);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createRequirementQuestion({
        question_key: form.question_key,
        question: form.question,
        type: form.type,
        service_id: form.service_id || undefined,
        project_type_id: form.project_type_id || undefined,
        options: form.options
          ? form.options.split("\n").map((o) => o.trim()).filter(Boolean)
          : undefined,
      });
      setShowForm(false);
      fetchQuestions();
    } catch (err) {
      console.error("Failed to create question:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="section-label">REQUIREMENT QUESTIONS</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">Manage Requirement Questions</h1>
          <p className="text-muted text-sm mt-1">Create and manage questions shown during service ordering.</p>
        </div>
        <Button onClick={openCreate} icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }>
          Create Question
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by question key or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: "all", label: "All Types" },
              ...typeOptions,
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage title="Failed to load questions" message={error} onRetry={fetchQuestions} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="❓"
          title={search || typeFilter !== "all" ? "No matching questions" : "No questions yet"}
          description={search || typeFilter !== "all" ? "Try a different search or filter." : "Create your first requirement question."}
          action={!search && typeFilter === "all" ? { label: "Create Question", href: "#" } : undefined}
        />
      ) : (
        <>
          <div className="hidden md:block glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Question Key</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Question</th>
                    <th className="text-center text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Type</th>
                    <th className="text-center text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Required</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Service / Project</th>
                  </tr>
                </thead>
                <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                  {filtered.map((q) => (
                    <motion.tr
                      key={q.id}
                      variants={rowVariants}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <code className="text-sm font-mono text-gold">{q.question_key}</code>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white max-w-xs truncate">{q.question}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="info">{q.type}</Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {q.is_required ? (
                          <Badge variant="success">Required</Badge>
                        ) : (
                          <span className="text-muted text-xs">Optional</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {q.service?.title || "—"}
                        {q.projectType?.title && (
                          <span className="text-xs"> / {q.projectType.title}</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4 md:hidden">
            {filtered.map((q) => (
              <motion.div
                key={q.id}
                variants={rowVariants}
                className="glass rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <code className="text-sm font-mono text-gold">{q.question_key}</code>
                  <Badge variant={q.is_required ? "success" : "info"}>
                    {q.is_required ? "Required" : "Optional"}
                  </Badge>
                </div>
                <p className="text-sm text-white">{q.question}</p>
                <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-xs text-muted">
                  <Badge variant="info">{q.type}</Badge>
                  {q.service?.title && <span>{q.service.title}</span>}
                  {q.projectType?.title && <span>/ {q.projectType.title}</span>}
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
                  <h2 className="text-xl font-bold text-white">Create Requirement Question</h2>
                  <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <Input
                  label="Question Key"
                  value={form.question_key}
                  onChange={(e) => setForm({ ...form, question_key: e.target.value })}
                  placeholder="e.g. project_name"
                  required
                />

                <Input
                  label="Question"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="e.g. What is the name of your project?"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    options={typeOptions}
                  />
                  <div className="flex items-end pb-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_required}
                        onChange={(e) => setForm({ ...form, is_required: e.target.checked })}
                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-gold focus:ring-gold/20"
                      />
                      <span className="text-sm text-white/80 font-medium">Required</span>
                    </label>
                  </div>
                </div>

                {(form.type === "select" || form.type === "multi_select") && (
                  <div className="space-y-1.5">
                    <label className="block text-sm text-white/80 font-medium">Options (one per line)</label>
                    <textarea
                      value={form.options}
                      onChange={(e) => setForm({ ...form, options: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Service (optional)"
                    value={form.service_id}
                    onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                    options={[
                      { value: "", label: "All Services" },
                      ...services.map((s) => ({ value: s.id, label: s.title })),
                    ]}
                  />
                  <Select
                    label="Project Type (optional)"
                    value={form.project_type_id}
                    onChange={(e) => setForm({ ...form, project_type_id: e.target.value })}
                    options={[
                      { value: "", label: "All Project Types" },
                    ]}
                    disabled
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
