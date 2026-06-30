"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminPageHeader, AdminModal, ConfirmDialog } from "@/components/admin";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, formatFileSize, cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  alt_text: string | null;
  folder: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

interface MediaListResponse {
  data: MediaItem[];
  current_page: number;
  last_page: number;
  total: number;
}

const API_BASE = "/api/v1/admin/media";

async function adminFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [detailAlt, setDetailAlt] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search.trim()) params.set("search", search.trim());
      const res = await adminFetch<MediaListResponse>(`?${params.toString()}`);
      setMedia(res.data);
      setTotalPages(res.last_page);
      setTotalItems(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await adminFetch("/upload", { method: "POST", body: formData });
      fetchMedia();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openDetail = (item: MediaItem) => {
    setSelectedItem(item);
    setDetailAlt(item.alt_text || "");
  };

  const handleSaveAlt = async () => {
    if (!selectedItem) return;
    setSavingAlt(true);
    try {
      await adminFetch(`/${selectedItem.id}`, {
        method: "PUT",
        body: JSON.stringify({ alt_text: detailAlt }),
      });
      setMedia((prev) =>
        prev.map((m) => (m.id === selectedItem.id ? { ...m, alt_text: detailAlt } : m))
      );
      setSelectedItem((prev) => (prev ? { ...prev, alt_text: detailAlt } : null));
    } catch (err) {
      console.error("Failed to update alt text:", err);
    } finally {
      setSavingAlt(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminFetch(`/${deleteTarget.id}`, { method: "DELETE" });
      setMedia((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSelectedItem(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const isImage = (mime: string) => mime?.startsWith("image/");
  const isVideo = (mime: string) => mime?.startsWith("video/");

  return (
    <div>
      <AdminPageHeader
        title="Media Library"
        description="Upload and manage media files."
        actions={
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,application/pdf"
              onChange={handleUpload}
              className="hidden"
              id="media-upload"
            />
            <label
              htmlFor="media-upload"
              className="inline-flex items-center gap-2 px-6 py-3 text-base rounded-xl bg-gold-gradient text-background font-bold hover:shadow-gold cursor-pointer transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {uploading ? "Uploading..." : "Upload"}
            </label>
          </div>
        }
      />

      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search by filename..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="glass rounded-xl overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorMessage title="Failed to load media" message={error} onRetry={fetchMedia} />
      ) : media.length === 0 ? (
        <EmptyState
          icon="🖼️"
          title={search ? "No matching files" : "No media yet"}
          description={search ? "Try a different search term." : "Upload your first media file to get started."}
        />
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {media.map((item) => (
              <motion.button
                key={item.id}
                variants={itemVariants}
                onClick={() => openDetail(item)}
                className="glass rounded-xl overflow-hidden text-left group hover:border-gold/30 transition-all duration-300 border border-transparent"
              >
                <div className="aspect-square bg-white/5 relative overflow-hidden">
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.alt_text || item.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : isImage(item.mime_type) ? (
                    <img
                      src={item.url}
                      alt={item.alt_text || item.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : isVideo(item.mime_type) ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-xs font-medium text-white truncate">{item.filename}</p>
                  <p className="text-[10px] text-muted">{formatFileSize(item.size)}</p>
                  <p className="text-[10px] text-muted">{formatDate(item.created_at)}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
              <p className="text-sm text-muted">
                Page {page} of {totalPages}
                <span className="ml-2">({totalItems} total)</span>
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AdminModal
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.filename || "Media Details"}
        size="md"
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => { setDeleteTarget(selectedItem); setSelectedItem(null); }}
            >
              Delete
            </Button>
            <Button onClick={handleSaveAlt} loading={savingAlt}>
              Save Changes
            </Button>
          </div>
        }
      >
        {selectedItem && (
          <div className="space-y-4">
            {isImage(selectedItem.mime_type) ? (
              <img
                src={selectedItem.url}
                alt={selectedItem.alt_text || selectedItem.filename}
                className="w-full max-h-64 object-contain rounded-xl bg-white/5"
              />
            ) : (
              <div className="w-full h-40 bg-white/5 rounded-xl flex items-center justify-center">
                <span className="text-muted text-sm">{selectedItem.mime_type}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted block text-xs">Filename</span>
                <span className="text-white font-medium">{selectedItem.filename}</span>
              </div>
              <div>
                <span className="text-muted block text-xs">Original Name</span>
                <span className="text-white font-medium">{selectedItem.original_name}</span>
              </div>
              <div>
                <span className="text-muted block text-xs">MIME Type</span>
                <span className="text-white font-medium">{selectedItem.mime_type}</span>
              </div>
              <div>
                <span className="text-muted block text-xs">Size</span>
                <span className="text-white font-medium">{formatFileSize(selectedItem.size)}</span>
              </div>
              <div>
                <span className="text-muted block text-xs">Upload Date</span>
                <span className="text-white font-medium">{formatDate(selectedItem.created_at)}</span>
              </div>
              {selectedItem.folder && (
                <div>
                  <span className="text-muted block text-xs">Folder</span>
                  <span className="text-white font-medium">{selectedItem.folder}</span>
                </div>
              )}
            </div>

            <div>
              <span className="text-muted block text-xs mb-1">URL</span>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={selectedItem.url}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                />
                <button
                  onClick={() => copyToClipboard(selectedItem.url)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-all"
                  title="Copy URL"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <Input
                label="Alt Text"
                value={detailAlt}
                onChange={(e) => setDetailAlt(e.target.value)}
              />
            </div>
          </div>
        )}
      </AdminModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Media"
        message={`Are you sure you want to delete "${deleteTarget?.filename}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        loading={deleting}
      />
    </div>
  );
}
