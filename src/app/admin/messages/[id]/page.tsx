"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";


interface Msg {
  id: string;
  message: string;
  type: string;
  attachments: any[] | null;
  is_read: boolean;
  read_at: string | null;
  delivered_at: string | null;
  created_at: string;
  is_mine: boolean;
  user: {
    id: string;
    full_name: string | null;
    is_admin: boolean;
  } | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getFileIcon(type: string): string {
  if (type?.startsWith("image/")) return "🖼";
  if (type?.includes("pdf")) return "📄";
  if (type?.includes("word") || type?.includes("document")) return "📝";
  if (type?.includes("zip") || type?.includes("rar")) return "📦";
  return "📎";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type LocalStatus = "sending" | "failed";

export default function AdminConversationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [clientName, setClientName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastMsgTimeRef = useRef<string | null>(null);
  const localStatusRef = useRef<Map<string, LocalStatus>>(new Map());
  const [localStatusVer, setLocalStatusVer] = useState(0);

  const scrollToBottom = (smooth = true) => messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });

  const isNearBottom = () => {
    const container = messagesEndRef.current?.parentElement;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 150;
  };

  useEffect(() => {
    if (!loading && messages.length > 0) scrollToBottom(false);
  }, [loading]);

  const getStatus = (msg: Msg): string => {
    const local = localStatusRef.current.get(msg.id);
    if (local === "sending") return "sending";
    if (local === "failed") return "failed";
    if (msg.is_read && msg.read_at) return "read";
    if (msg.delivered_at) return "delivered";
    return "sent";
  };

  const loadMessages = useCallback(async (isPoll = false) => {
    try {
      const sinceParam = isPoll && lastMsgTimeRef.current ? `?since=${encodeURIComponent(lastMsgTimeRef.current)}` : "";
      const res = await fetch(`/api/v1/admin/projects/${orderId}/messages${sinceParam}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        const msgs = data.data || [];
        setMessages((prev) => {
          if (prev.length === 0) return msgs;
          const existingIds = new Set(prev.map((m) => m.id));
          const unique = msgs.filter((m: Msg) => !existingIds.has(m.id));
          if (unique.length === 0) return prev;
          unique.forEach((m: Msg) => {
            const local = localStatusRef.current.get(m.id);
            if (local === "sending" || local === "failed") {
              localStatusRef.current.delete(m.id);
            }
          });
          return [...prev, ...unique];
        });
        if (msgs.length > 0) lastMsgTimeRef.current = msgs[msgs.length - 1].created_at;
      }
    } catch {} finally {
      if (!isPoll) setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { if (orderId) loadMessages(false); }, [orderId, loadMessages]);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/v1/admin/projects/${orderId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const p = d.data;
          if (p?.client?.full_name) setClientName(p.client.full_name);
        }
      })
      .catch(() => {});
  }, [orderId]);

  // Polling
  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(() => {
      loadMessages(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [orderId, loadMessages]);

  const retrySend = useCallback(async (failedMsg: Msg) => {
    localStatusRef.current.set(failedMsg.id, "sending");
    setLocalStatusVer((v) => v + 1);
    try {
      await fetch("/sanctum/csrf-cookie", { credentials: "include" });
      const csrfMatch = document.cookie.match(/(^| )XSRF-TOKEN=([^;]+)/);
      const token = csrfMatch ? decodeURIComponent(csrfMatch[2]) : null;

      const formData = new FormData();
      if (failedMsg.message) formData.append("message", failedMsg.message);
      const res = await fetch(`/api/v1/admin/projects/${orderId}/messages`, {
        method: "POST",
        credentials: "include",
        headers: token ? { "X-XSRF-TOKEN": token } : {},
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => prev.map((m) => (m.id === failedMsg.id ? data.data : m)));
        localStatusRef.current.delete(data.data.id);
        lastMsgTimeRef.current = data.data.created_at;
      }
    } catch {
      localStatusRef.current.set(failedMsg.id, "failed");
    } finally {
      setLocalStatusVer((v) => v + 1);
    }
  }, [orderId]);

  const handleSend = async () => {
    if (!text.trim() && files.length === 0) return;
    if (sending) return;
    setSending(true);

    const optimisticMsg: Msg = {
      id: `temp-${Date.now()}`,
      message: text.trim(),
      type: "text",
      attachments: null,
      is_read: false,
      read_at: null,
      delivered_at: null,
      created_at: new Date().toISOString(),
      is_mine: true,
      user: { id: "", full_name: "You", is_admin: true },
    };
    localStatusRef.current.set(optimisticMsg.id, "sending");
    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const formData = new FormData();
      if (text.trim()) formData.append("message", text.trim());
      for (const file of files) formData.append("files[]", file);

      // Need CSRF for admin route
      await fetch("/sanctum/csrf-cookie", { credentials: "include" });
      const csrfMatch = document.cookie.match(/(^| )XSRF-TOKEN=([^;]+)/);
      const token = csrfMatch ? decodeURIComponent(csrfMatch[2]) : null;

      const res = await fetch(`/api/v1/admin/projects/${orderId}/messages`, {
        method: "POST",
        credentials: "include",
        headers: token ? { "X-XSRF-TOKEN": token } : {},
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => prev.map((m) => (m.id === optimisticMsg.id ? data.data : m)));
        localStatusRef.current.delete(optimisticMsg.id);
        lastMsgTimeRef.current = data.data.created_at;
      }
      setText("");
      setFiles([]);
      setTimeout(() => scrollToBottom(true), 50);
    } catch {
      localStatusRef.current.set(optimisticMsg.id, "failed");
      setLocalStatusVer((v) => v + 1);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <button onClick={() => router.push("/admin/messages")} className="text-[#98A2B3] hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Chat with Client</h1>
          <p className="text-xs text-[#98A2B3]">{messages.length} message{messages.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl flex flex-col min-h-[65vh] max-h-[65vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <svg className="animate-spin h-6 w-6 text-[#5B4CF0]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center py-12">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-[#98A2B3] text-sm">No messages yet. Reply to start the conversation.</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.is_mine;
              const displayName = isAdmin ? "You" : (clientName || "Client");
              const status = getStatus(msg);
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAdmin ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    isAdmin ? "bg-[#5B4CF0]/20 text-[#5B4CF0]" : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className={`max-w-[75%] ${isAdmin ? "items-end" : ""}`}>
                    <div className={`rounded-2xl px-4 py-2.5 ${
                      status === "failed"
                        ? "bg-red-500/10 border border-red-500/20"
                        : isAdmin
                          ? "bg-[#5B4CF0]/10 border border-[#5B4CF0]/10"
                          : "bg-blue-500/10 border border-blue-500/10"
                    }`}>
                      <p className="text-xs font-medium text-[#98A2B3] mb-1">
                        {displayName}
                      </p>
                      {msg.message && (
                        <p className="text-sm text-[#101828] whitespace-pre-wrap break-words">{msg.message}</p>
                      )}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className={`mt-2 space-y-1.5 ${msg.message ? "border-t border-[#ECEFF5] pt-2" : ""}`}>
                          {msg.attachments.map((att: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2">
                              <span>{getFileIcon(att.type || "")}</span>
                              <span className="text-[#667085] truncate flex-1">{att.name || "Attachment"}</span>
                              {att.size && <span className="text-[#98A2B3] shrink-0">{formatFileSize(att.size)}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={`flex items-center gap-1.5 mt-1 px-1 ${isAdmin ? "flex-row-reverse" : ""}`}>
                      <p className="text-[10px] text-[#98A2B3]">{timeAgo(msg.created_at)}</p>
                      {isAdmin && (
                        <span
                          className={`inline-flex items-center text-xs leading-none ${
                            status === "sending" ? "text-[#D0D5DD]" :
                            status === "failed" ? "text-red-400" :
                            msg.is_read && msg.read_at ? "text-blue-400" : "text-[#98A2B3]"
                          }`}
                          title={
                            status === "sending" ? "Sending..." :
                            status === "failed" ? "Failed — tap to retry" :
                            msg.is_read && msg.read_at ? "Read" : "Delivered"
                          }
                        >
                          {status === "sending" && (
                            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          )}
                          {status === "failed" && (
                            <button
                              onClick={() => retrySend(msg)}
                              className="hover:opacity-80 transition-opacity flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                          {status === "sent" && (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M13.78 4.22a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06 0L2.22 9.72a.75.75 0 011.06-1.06L5.5 11.94l6.72-6.72a.75.75 0 011.06 0z"/>
                            </svg>
                          )}
                          {(status === "delivered" || status === "read") && (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M15.78 3.78a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06 0L2.22 7.28a.75.75 0 011.06-1.06L7.5 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                              <path d="M11.28 3.78a.75.75 0 010 1.06l-4.72 4.72a.75.75 0 01-1.06-1.06l4.72-4.72a.75.75 0 011.06 0z"/>
                            </svg>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#ECEFF5] p-4">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 text-xs">
                  <span>{getFileIcon(file.type)}</span>
                  <span className="text-[#667085] max-w-[120px] truncate">{file.name}</span>
                  <button onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 ml-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-3">
            <button onClick={() => fileInputRef.current?.click()} className="shrink-0 w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-[#98A2B3] hover:text-white transition-all" title="Attach files">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
            </button>
            <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt,.csv" className="hidden" onChange={(e) => {
              const selected = Array.from(e.target.files || []);
              setFiles((prev) => [...prev, ...selected].slice(0, 10));
              if (e.target) e.target.value = "";
            }} />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reply as admin..."
              rows={1}
              className="flex-1 bg-gray-50 border border-[#ECEFF5] rounded-xl px-4 py-2.5 text-sm text-[#101828] placeholder-white/30 focus:outline-none focus:border-[#5B4CF0]/50 resize-none min-h-[42px] max-h-[120px]"
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={handleSend}
              disabled={sending || (!text.trim() && files.length === 0)}
              className="shrink-0 px-5 h-10 rounded-xl portal-primary-bg text-[#101828] font-semibold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300 disabled:opacity-40 disabled:scale-100 flex items-center gap-2"
            >
              {sending ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
              <span className="hidden sm:inline">Reply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
