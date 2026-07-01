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
  created_at: string;
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

const ADMIN_NAMES = ["David Robert", "Justin Bradon", "Eve Ryan", "Alex Mark", "Donald Paul"];

function getAdminName(msg: Msg): string {
  if (msg.user?.full_name) return msg.user.full_name;
  if (msg.user?.is_admin) {
    const hash = msg.user.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return ADMIN_NAMES[hash % ADMIN_NAMES.length];
  }
  return "Unknown";
}

export default function AdminConversationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [projectName, setProjectName] = useState("Chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastMsgTimeRef = useRef<string | null>(null);

  const scrollToBottom = (smooth = true) => messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });

  const isNearBottom = () => {
    const container = messagesEndRef.current?.parentElement;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 150;
  };

  useEffect(() => {
    if (!loading && messages.length > 0) scrollToBottom(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/admin/projects/${orderId}/messages`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
        const msgs = data.data || [];
        if (msgs.length > 0) lastMsgTimeRef.current = msgs[msgs.length - 1].created_at;
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { if (orderId) loadMessages(); }, [orderId, loadMessages]);

  // Polling
  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(async () => {
      try {
        const since = lastMsgTimeRef.current;
        if (!since) return;
        const res = await fetch(`/api/v1/admin/projects/${orderId}/messages`, { credentials: "include" });
        const data = await res.json();
        if (data.success && data.data) {
          const nearBottom = isNearBottom();
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const unique = data.data.filter((m: Msg) => !existingIds.has(m.id));
            if (unique.length > 0) {
              lastMsgTimeRef.current = unique[unique.length - 1].created_at;
              return [...prev, ...unique];
            }
            return prev;
          });
          if (nearBottom) setTimeout(() => scrollToBottom(true), 50);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleSend = async () => {
    if (!text.trim() && files.length === 0) return;
    if (sending) return;
    setSending(true);
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
        setMessages((prev) => [...prev, data.data]);
        lastMsgTimeRef.current = data.data.created_at;
      }
      setText("");
      setFiles([]);
      setTimeout(() => scrollToBottom(true), 50);
    } catch {} finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <button onClick={() => router.push("/admin/messages")} className="text-white/40 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Chat with Client</h1>
          <p className="text-xs text-white/40">{messages.length} message{messages.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl flex flex-col min-h-[65vh] max-h-[65vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <svg className="animate-spin h-6 w-6 text-gold" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center py-12">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-white/50 text-sm">No messages yet. Reply to start the conversation.</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.user?.is_admin === true;
              const displayName = getAdminName(msg);
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAdmin ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    isAdmin ? "bg-gold/20 text-gold" : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className={`max-w-[75%] ${isAdmin ? "items-end" : ""}`}>
                    <div className={`rounded-2xl px-4 py-2.5 ${
                      isAdmin ? "bg-gold/10 border border-gold/10" : "bg-blue-500/10 border border-blue-500/10"
                    }`}>
                      <p className="text-xs font-medium text-white/50 mb-1">
                        {displayName}
                        {isAdmin ? "" : " (Client)"}
                      </p>
                      {msg.message && (
                        <p className="text-sm text-white whitespace-pre-wrap break-words">{msg.message}</p>
                      )}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className={`mt-2 space-y-1.5 ${msg.message ? "border-t border-white/5 pt-2" : ""}`}>
                          {msg.attachments.map((att: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs bg-white/5 rounded-lg px-3 py-2">
                              <span>{getFileIcon(att.type || "")}</span>
                              <span className="text-white/70 truncate flex-1">{att.name || "Attachment"}</span>
                              {att.size && <span className="text-white/30 shrink-0">{formatFileSize(att.size)}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className={`text-[10px] text-white/30 mt-1 px-1 ${isAdmin ? "text-right" : ""}`}>
                      {timeAgo(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/5 p-4">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-1.5 text-xs">
                  <span>{getFileIcon(file.type)}</span>
                  <span className="text-white/70 max-w-[120px] truncate">{file.name}</span>
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
            <button onClick={() => fileInputRef.current?.click()} className="shrink-0 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all" title="Attach files">
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
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50 resize-none min-h-[42px] max-h-[120px]"
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={handleSend}
              disabled={sending || (!text.trim() && files.length === 0)}
              className="shrink-0 px-5 h-10 rounded-xl bg-gold-gradient text-background font-semibold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300 disabled:opacity-40 disabled:scale-100 flex items-center gap-2"
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
