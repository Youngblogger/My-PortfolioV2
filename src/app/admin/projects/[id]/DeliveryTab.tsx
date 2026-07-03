"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, type ServiceFileData } from "@/lib/api";
import { formatDate, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export default function DeliveryTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<ServiceFileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [itemType, setItemType] = useState("url");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminGetProjectDeliveryItems(projectId);
      setItems(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load delivery items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [projectId]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.addDeliveryItem(projectId, {
        name: name.trim(),
        type: itemType,
        description: description.trim() || undefined,
        file: file || undefined,
      });
      setName("");
      setDescription("");
      setFile(null);
      setShowForm(false);
      fetchItems();
    } catch (err) {
      console.error("Add failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (fileId: string) => {
    if (!confirm("Remove this delivery item?")) return;
    try {
      await api.removeDeliveryItem(projectId, fileId);
      setItems((prev) => prev.filter((i) => i.id !== fileId));
    } catch (err) {
      console.error("Remove failed:", err);
    }
  };

  const handleDownload = async (item: ServiceFileData) => {
    if (!item.has_file) return;
    try {
      const res = await api.downloadProjectFile(projectId, item.id);
      const blob = await (res as unknown as Response).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="portal-card rounded-2xl p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage title="Failed to Load Delivery" message={error} onRetry={fetchItems} />;
  }

  return (
    <div className="portal-card rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider">Final Delivery</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Item"}
        </Button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Item name (e.g. Live Website URL, Source Code)"
                className="w-full bg-gray-50 border border-[#ECEFF5] rounded-lg px-3 py-2 text-sm text-[#101828] placeholder:text-[#667085] focus:outline-none focus:border-[#5B4CF0]/50"
              />
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="w-full bg-gray-50 border border-[#ECEFF5] rounded-lg px-3 py-2 text-sm text-[#101828] focus:outline-none focus:border-[#5B4CF0]/50"
              >
                <option value="url">URL / Link</option>
                <option value="text">Text / Information</option>
                <option value="credentials">Credentials (secure)</option>
                <option value="file">File Upload</option>
              </select>
              {itemType === "file" ? (
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-[#667085] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#5B4CF0]/10 file:text-[#5B4CF0] hover:file:bg-[#5B4CF0]/20"
                />
              ) : (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={itemType === "url" ? "https://..." : "Enter details..."}
                  rows={2}
                  className="w-full bg-gray-50 border border-[#ECEFF5] rounded-lg px-3 py-2 text-sm text-[#101828] placeholder:text-[#667085] focus:outline-none focus:border-[#5B4CF0]/50 resize-none"
                />
              )}
              <div className="flex justify-end">
                <Button size="sm" disabled={!name.trim() || saving} onClick={handleAdd}>
                  {saving ? "Adding..." : "Add to Delivery"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3 opacity-30">📦</div>
          <p className="text-sm text-[#667085]">No delivery items published yet.</p>
          <p className="text-xs text-[#667085]/50 mt-1">Add final deliverables for the client to access.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  {item.has_file ? <span className="text-lg">📦</span> : item.type === "url" ? <span className="text-lg">🔗</span> : <span className="text-lg">📝</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#101828] truncate">{item.name}</p>
                  <div className="flex items-center gap-3 text-xs text-[#667085] mt-0.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] border bg-green-500/10 text-green-400 border-green-500/20">
                      {item.type || "delivery"}
                    </span>
                    {item.has_file && <span>{formatFileSize(item.size)}</span>}
                    {item.user?.full_name && <span>by {item.user.full_name}</span>}
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-[#667085]/70 mt-1 truncate">{item.description}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.has_file && (
                    <button
                      onClick={() => handleDownload(item)}
                      className="text-xs px-2 py-1 rounded bg-gray-50 text-[#667085] hover:text-white"
                    >
                      Download
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    Remove
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
