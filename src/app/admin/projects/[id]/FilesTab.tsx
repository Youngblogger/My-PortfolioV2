"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, type ServiceFileData } from "@/lib/api";
import { cn, formatDate, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

const categories = [
  { value: "", label: "All Files" },
  { value: "client_files", label: "Client Files" },
  { value: "design", label: "Design Files" },
  { value: "development", label: "Development Files" },
  { value: "testing", label: "Testing Files" },
  { value: "final_deliverables", label: "Final Deliverables" },
  { value: "other", label: "Other" },
];

const categoryColors: Record<string, string> = {
  client_files: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  design: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  development: "bg-green-500/10 text-green-400 border-green-500/20",
  testing: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  final_deliverables: "bg-[#5B4CF0]/10 text-[#5B4CF0] border-[#5B4CF0]/20",
  other: "bg-gray-100 text-[#667085] border-[#ECEFF5]",
};

export default function FilesTab({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<ServiceFileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminGetProjectFiles
        ? await api.adminGetProjectFiles(projectId, category || undefined, sort)
        : await api.getProjectFiles(projectId, category || undefined, sort);
      setFiles(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId, category, sort]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.adminUploadProjectFile(projectId, file, category || undefined);
      fetchFiles();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Delete this file? This cannot be undone.")) return;
    try {
      await api.adminDeleteProjectFile(projectId, fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleDownload = async (file: ServiceFileData) => {
    try {
      const res = await api.downloadProjectFile(projectId, file.id);
      const blob = await (res as unknown as Response).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className="portal-card rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider">Project Files</h3>
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
            className="bg-gray-50 border border-[#ECEFF5] rounded-lg px-2 py-1 text-xs text-[#101828] focus:outline-none focus:border-[#5B4CF0]/50"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
          />
          <Button size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all",
              category === cat.value
                ? "bg-[#5B4CF0]/10 text-[#5B4CF0] border-[#5B4CF0]/30"
                : "bg-gray-50 text-[#667085] border-[#ECEFF5] hover:text-white"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage title="Failed to Load Files" message={error} onRetry={fetchFiles} />
      ) : files.length === 0 ? (
        <EmptyFiles />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#5B4CF0]/10 flex items-center justify-center shrink-0">
                  <FileIcon type={file.type || ""} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#101828] truncate">{file.name}</p>
                  <div className="flex items-center gap-3 text-xs text-[#667085] mt-0.5">
                    <span className={cn("px-1.5 py-0.5 rounded text-[10px] border", categoryColors[file.category] || categoryColors.other)}>
                      {file.category.replace(/_/g, " ")}
                    </span>
                    <span>{formatFileSize(file.size)}</span>
                    {file.user?.full_name && <span>by {file.user.full_name}</span>}
                    <span>{formatDate(file.created_at)}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(file)}
                    className="text-xs px-2 py-1 rounded bg-gray-50 text-[#667085] hover:text-white"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function EmptyFiles() {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-3 opacity-30">📁</div>
      <p className="text-sm text-[#667085]">No files uploaded yet.</p>
      <p className="text-xs text-[#667085]/50 mt-1">Upload project files to share with the client.</p>
    </div>
  );
}

function FileIcon({ type }: { type: string }) {
  if (type.includes("image")) return <span className="text-lg">🖼</span>;
  if (type.includes("pdf")) return <span className="text-lg">📄</span>;
  if (type.includes("zip") || type.includes("rar")) return <span className="text-lg">📦</span>;
  if (type.includes("word") || type.includes("document")) return <span className="text-lg">📝</span>;
  if (type.includes("code") || type.includes("text")) return <span className="text-lg">📃</span>;
  return <span className="text-lg">📎</span>;
}
