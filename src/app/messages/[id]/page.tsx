"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

import { api, type ConversationMessageData } from "@/lib/api";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string): string {
  if (type.startsWith("image/")) return "\uD83D\uDDBC";
  if (type.includes("pdf")) return "\uD83D\uDCC4";
  if (type.includes("word") || type.includes("document")) return "\uD83D\uDCDD";
  if (type.includes("excel") || type.includes("spreadsheet")) return "\uD83D\uDCCA";
  if (type.includes("zip") || type.includes("rar")) return "\uD83D\uDCE6";
  return "\uD83D\uDCCE";
}

const ADMIN_NAMES = ["David Robert", "Justin Bradon", "Eve Ryan", "Alex Mark", "Donald Paul"];

function getAdminName(msg: ConversationMessageData): string {
  if (msg.user?.full_name) return msg.user.full_name;
  if (msg.user?.is_admin) {
    const hash = msg.user.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return ADMIN_NAMES[hash % ADMIN_NAMES.length];
  }
  return "Unknown";
}

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [messages, setMessages] = useState<ConversationMessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastMessageTimeRef = useRef<string | null>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  const isNearBottom = () => {
    const container = messagesEndRef.current?.parentElement;
    if (!container) return true;
    const threshold = 150;
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  };

  useEffect(() => {
    async function getCurrentUser() {
      try {
        const res = await api.getUser();
        if (res.user?.id) setCurrentUserId(res.user.id);
      } catch {}
    }
    getCurrentUser();
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const res = await api.getConversationMessages(orderId);
      const msgs = res.data || [];
      setMessages(msgs);
      if (msgs.length > 0) {
        lastMessageTimeRef.current = msgs[msgs.length - 1].created_at;
      }
    } catch {
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      loadMessages();
    }
  }, [orderId, loadMessages]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(async () => {
      try {
        const since = lastMessageTimeRef.current;
        const res = since
          ? await api.getRecentConversationMessages(orderId, since)
          : await api.getConversationMessages(orderId);
        const newMsgs = res.data || [];
        if (newMsgs.length > 0) {
          const nearBottom = isNearBottom();
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const unique = newMsgs.filter((m) => !existingIds.has(m.id));
            if (unique.length > 0) {
              lastMessageTimeRef.current = unique[unique.length - 1].created_at;
              return [...prev, ...unique];
            }
            return prev;
          });
          if (nearBottom) {
            setTimeout(() => scrollToBottom(true), 50);
          }
        }
      } catch {
        // silent
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected].slice(0, 10));
    if (e.target) e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    const hasText = text.trim().length > 0;
    const hasFiles = files.length > 0;
    if (!hasText && !hasFiles) return;
    if (sending) return;

    setSending(true);
    try {
      const formData = new FormData();
      if (hasText) formData.append("message", text.trim());
      for (const file of files) {
        formData.append("files[]", file);
      }
      const res = await api.sendConversationMessage(orderId, formData);
      const newMsg = res.data;
      if (newMsg) {
        setMessages((prev) => [...prev, newMsg]);
        lastMessageTimeRef.current = newMsg.created_at;
      }
      setText("");
      setFiles([]);
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-4">
              <svg className="animate-spin h-8 w-8 text-gold mx-auto" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-muted text-sm">Loading messages...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-bold text-white mb-2">Oops</h3>
            <p className="text-muted text-sm mb-6">{error}</p>
            <button
              onClick={loadMessages}
              className="px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-14 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <Link
            href="/messages"
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Back to conversations"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Chat</h1>
            <p className="text-xs text-muted">{messages.length} message{messages.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="glass rounded-2xl flex flex-col min-h-[65vh] max-h-[65vh]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center py-12">
                  <div className="text-4xl mb-4" aria-hidden="true">💬</div>
                  <p className="text-muted text-sm">No messages yet. Start the conversation.</p>
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const isMe = msg.user?.id === currentUserId;
              const isRead = msg.is_read === true && msg.read_at !== null;
              const displayName = getAdminName(msg);
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.user?.is_admin
                      ? "bg-gold/20 text-gold"
                      : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className={`max-w-[75%] ${isMe ? "items-end" : ""}`}>
                    <div className={`rounded-2xl px-4 py-2.5 ${
                      msg.user?.is_admin
                        ? "bg-gold/10 border border-gold/10"
                        : "bg-blue-500/10 border border-blue-500/10"
                    }`}>
                      <p className="text-xs font-medium text-white/50 mb-1">
                        {displayName}
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
                              {att.size && (
                                <span className="text-muted/60 shrink-0">{formatFileSize(att.size)}</span>
                              )}
                              {att.id && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const response = await api.downloadProjectFile(orderId, att.id);
                                      const blob = await response.blob();
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement("a");
                                      a.href = url;
                                      a.download = att.name || "download";
                                      a.click();
                                      URL.revokeObjectURL(url);
                                    } catch {}
                                  }}
                                  className="text-gold hover:text-gold/80 shrink-0"
                                  title="Download"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                      <p className="text-[10px] text-muted/60">{timeAgo(msg.created_at)}</p>
                      {isMe && (
                        <span className={`inline-flex items-center text-xs leading-none ${
                          isRead ? "text-blue-400" : "text-white/30"
                        }`} title={isRead ? "Read" : "Delivered"}>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M15.78 3.78a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06 0L2.22 7.28a.75.75 0 011.06-1.06L7.5 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                            <path d="M11.28 3.78a.75.75 0 010 1.06l-4.72 4.72a.75.75 0 01-1.06-1.06l4.72-4.72a.75.75 0 011.06 0z"/>
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-white/5 p-4">
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-1.5 text-xs">
                    <span>{getFileIcon(file.type)}</span>
                    <span className="text-white/70 max-w-[120px] truncate">{file.name}</span>
                    <span className="text-muted/60">{formatFileSize(file.size)}</span>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-red-400 hover:text-red-300 ml-1"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-end gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
                title="Attach files"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt,.csv"
                className="hidden"
                onChange={handleFileSelect}
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50 resize-none min-h-[42px] max-h-[120px]"
                style={{ height: "auto" }}
                onInput={(e) => {
                  const target = e.currentTarget;
                  target.style.height = "auto";
                  target.style.height = Math.min(target.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={handleSend}
                disabled={sending || (!text.trim() && files.length === 0)}
                className="shrink-0 px-5 h-10 rounded-xl bg-gold-gradient text-background font-semibold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300 disabled:opacity-40 disabled:scale-100 disabled:shadow-none flex items-center gap-2"
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
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link
            href={`/hire/project/${orderId}`}
            className="text-xs text-gold hover:text-gold/80 transition-colors"
          >
            View full project workspace &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
