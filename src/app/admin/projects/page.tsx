"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import type { AdminProjectListItem, AdminProjectListData } from "@/lib/api";

type ProjectItem = AdminProjectListItem;

const statusTabs = [
  "all",
  "pending_review",
  "requirements_reviewed",
  "in_progress",
  "on_hold",
  "blocked",
  "completed",
  "cancelled",
] as const;

const priorityVariant: Record<string, "gold" | "success" | "error" | "info"> = {
  low: "info",
  normal: "gold",
  high: "error",
  urgent: "error",
};

const projectVariant: Record<string, "gold" | "success" | "error" | "info"> = {
  pending_review: "gold",
  requirements_reviewed: "info",
  in_progress: "success",
  on_hold: "gold",
  blocked: "error",
  completed: "success",
  cancelled: "error",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export default function AdminProjectsPage() {
  const [data, setData] = useState<AdminProjectListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("created_at");
  const [orderDir, setOrderDir] = useState("desc");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminProjects({
        status: activeTab === "all" ? undefined : activeTab,
        search: search.trim() || undefined,
        page,
        sort,
        order: orderDir,
        per_page: 20,
      });
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, page, sort, orderDir]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  const toggleSort = (field: string) => {
    if (sort === field) {
      setOrderDir(orderDir === "desc" ? "asc" : "desc");
    } else {
      setSort(field);
      setOrderDir("desc");
    }
  };

  const items = data?.data || [];
  const currentPage = data?.current_page || 1;
  const lastPage = data?.last_page || 1;

  return (
    <div>
      <div className="mb-8">
        <span className="section-label">PROJECTS</span>
        <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">
          Project Workspace
        </h1>
        <p className="text-muted text-sm mt-1">
          Manage all paid projects from initiation to completion.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={cn(
              "text-sm font-medium px-3 py-1.5 rounded-lg transition-all whitespace-nowrap",
              activeTab === tab
                ? "text-gold bg-gold/10"
                : "text-muted hover:text-white"
            )}
          >
            {tab === "all"
              ? "All"
              : tab
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search projects by number, client, or service..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ) : error ? (
        <ErrorMessage title="Failed to Load Projects" message={error} onRetry={fetchProjects} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No projects found"
          description={
            search
              ? "No projects match your search criteria."
              : activeTab === "all"
              ? "Projects will appear here once clients complete payments."
              : `No projects with status "${activeTab}".`
          }
        />
      ) : (
        <>
          {/* Table - Desktop */}
          <div className="hidden md:block glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <SortTh label="Project" sortField="order_number" current={sort} dir={orderDir} onToggle={toggleSort} />
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Client</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Service</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Milestone</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Progress</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Priority</th>
                    <SortTh label="Created" sortField="created_at" current={sort} dir={orderDir} onToggle={toggleSort} />
                    <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                  {items.map((project, i) => (
                    <motion.tr
                      key={project.id}
                      variants={rowVariants}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/projects/${project.id}`}
                          className="text-sm font-medium text-gold hover:text-gold-secondary transition-colors"
                        >
                          {project.project_number || project.order_number}
                        </Link>
                        <p className="text-xs text-muted mt-0.5">{project.project_name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/80">{project.client}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white/80">{project.service}</p>
                        <p className="text-xs text-muted">{project.project_type}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={projectVariant[project.project_status] || "info"}>
                          {project.project_status
                            .split("_")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">{project.current_milestone || "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={priorityVariant[project.priority] || "gold"}>
                          {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted whitespace-nowrap">{formatDate(project.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/projects/${project.id}`}
                            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-muted hover:text-white hover:border-gold/30 transition-all"
                          >
                            View
                          </Link>
                          <Link
                            href={`/hire/project/${project.id}`}
                            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-muted hover:text-white hover:border-gold/30 transition-all"
                          >
                            Client View
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </div>

          {/* Cards - Mobile */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4 md:hidden">
            {items.map((project) => (
              <motion.div key={project.id} variants={rowVariants} className="glass rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-sm font-bold text-gold hover:text-gold-secondary transition-colors"
                    >
                      {project.project_number || project.order_number}
                    </Link>
                    <p className="text-xs text-muted">{project.project_name}</p>
                  </div>
                  <Badge variant={projectVariant[project.project_status] || "info"}>
                    {project.project_status
                      .split("_")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-white/80 font-medium">{project.client}</p>
                  <p className="text-xs text-muted mt-0.5">{project.service} &mdash; {project.project_type}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                    </div>
                    <span className="text-xs text-muted">{project.progress}%</span>
                  </div>
                  <Badge variant={priorityVariant[project.priority] || "gold"} className="text-[10px]">
                    {project.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <p className="text-xs text-muted">{formatDate(project.created_at)}</p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-muted hover:text-white hover:border-gold/30 transition-all"
                    >
                      View
                    </Link>
                    <Link
                      href={`/hire/project/${project.id}`}
                      className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-muted hover:text-white hover:border-gold/30 transition-all"
                    >
                      Client View
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
            <p className="text-sm text-muted">
              Page {currentPage} of {lastPage}
              {data && <span className="ml-2">({data.total} total projects)</span>}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <Button size="sm" variant="secondary" disabled={currentPage >= lastPage} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SortTh({ label, sortField, current, dir, onToggle }: {
  label: string;
  sortField: string;
  current: string;
  dir: string;
  onToggle: (field: string) => void;
}) {
  const active = current === sortField;
  return (
    <th
      className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4 cursor-pointer hover:text-white select-none transition-colors"
      onClick={() => onToggle(sortField)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (
          <span className="text-gold text-[10px]">{dir === "desc" ? "▼" : "▲"}</span>
        )}
      </span>
    </th>
  );
}
