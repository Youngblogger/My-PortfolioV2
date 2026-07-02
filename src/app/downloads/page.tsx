"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { api, type DownloadFileItem, type DownloadGroup } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string): string {
  if (type?.startsWith("image/")) return "🖼";
  if (type?.includes("pdf")) return "📄";
  if (type?.includes("word") || type?.includes("document")) return "📝";
  if (type?.includes("excel") || type?.includes("spreadsheet")) return "📊";
  if (type?.includes("zip") || type?.includes("rar")) return "📦";
  return "📎";
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function DownloadsPage() {
  const [grouped, setGrouped] = useState<DownloadGroup[]>([]);
  const [allFiles, setAllFiles] = useState<DownloadFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getDownloads();
      setGrouped(res.data.grouped || []);
      setAllFiles(res.data.all_files || []);
    } catch {
      setError("Failed to load downloads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDownload = async (fileId: string, fileName: string) => {
    setDownloading(fileId);
    try {
      const response = await api.downloadFile(fileId);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-[#F7F9FC] rounded w-48 mb-2 animate-pulse" />
          <div className="h-5 bg-[#F7F9FC] rounded w-64 mb-10 animate-pulse" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-xl p-5 mb-4 animate-pulse">
              <div className="h-5 bg-[#F7F9FC] rounded w-48 mb-3" />
              <div className="h-4 bg-[#F7F9FC] rounded w-64 mb-2" />
              <div className="h-4 bg-[#F7F9FC] rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-12">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-bold text-[#101828] mb-2">Oops</h3>
            <p className="text-[#98A2B3] text-sm mb-6">{error}</p>
            <button onClick={load} className="px-6 py-3 rounded-xl bg-[#5B4CF0] text-white font-bold text-sm hover:scale-[1.02] transition-all duration-300">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#101828]">Downloads</h1>
          <p className="text-[#98A2B3] mt-1">
            {allFiles.length} file{allFiles.length !== 1 ? "s" : ""} across {grouped.length} project{grouped.length !== 1 ? "s" : ""}
          </p>
        </div>

        {allFiles.length === 0 ? (
          <EmptyState
            icon="📁"
            title="No Files Yet"
            description="Files uploaded to your projects will appear here."
            action={{ label: "View Projects", href: "/dashboard" }}
          />
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
            {grouped.map((group) => (
              <motion.div key={group.order_id} variants={fadeUp} className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-[#101828] font-semibold">{group.project_name}</h3>
                    <p className="text-xs text-[#98A2B3] mt-0.5">
                      #{group.order_number} &middot; {group.service} &middot; {group.total_files} file{group.total_files !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-xs text-[#667085]">
                    {formatFileSize(group.total_size)}
                  </div>
                </div>
                <div className="space-y-2">
                  {group.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between bg-[#F7F9FC] rounded-xl px-4 py-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-lg shrink-0">{getFileIcon(file.type)}</span>
                        <div className="min-w-0">
                          <p className="text-sm text-[#101828] truncate">{file.name}</p>
                          <p className="text-[10px] text-[#667085]">
                            {formatFileSize(file.size)} &middot; {file.category?.replace(/_/g, " ")}
                            {file.created_at && ` · ${formatDate(file.created_at)}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(file.id, file.name)}
                        disabled={downloading === file.id}
                        className="shrink-0 ml-4 px-3 py-1.5 rounded-lg bg-[#5B4CF0] text-white text-xs font-semibold hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:scale-100"
                      >
                        {downloading === file.id ? (
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          "Download"
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
