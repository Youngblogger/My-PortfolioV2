"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, type ServiceMessageData } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export default function DiscussionTab({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<ServiceMessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminGetProjectMessages(projectId);
      setMessages(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await api.adminSendProjectMessage(projectId, text);
      setMessages((prev) => [...prev, res.data]);
      setText("");
    } catch (err) {
      console.error("Send failed:", err);
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

  const handlePin = async (messageId: string) => {
    try {
      await api.pinMessage(messageId);
      fetchMessages();
    } catch (err) {
      console.error("Pin failed:", err);
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
    return <ErrorMessage title="Failed to Load Discussion" message={error} onRetry={fetchMessages} />;
  }

  return (
    <div className="portal-card rounded-2xl p-6 md:p-8 flex flex-col h-[600px]">
      <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wider mb-4 shrink-0">Project Discussion</h3>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3 opacity-30">💬</div>
            <p className="text-sm text-[#667085]">No messages yet.</p>
            <p className="text-xs text-[#667085]/50 mt-1">Start the conversation with your client.</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.is_mine ? "flex-row-reverse" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-[#5B4CF0]/10 flex items-center justify-center shrink-0 text-xs font-bold text-[#5B4CF0]">
                  {msg.user?.full_name?.charAt(0) || "?"}
                </div>
                <div className={`max-w-[75%] ${msg.is_mine ? "items-end" : ""} flex flex-col`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-[#667085]">{msg.user?.full_name || "Unknown"}</span>
                    {msg.user?.is_admin && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5B4CF0]/10 text-[#5B4CF0]">Admin</span>}
                    <span className="text-[10px] text-[#667085]">{formatDate(msg.created_at)}</span>
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm ${
                      msg.is_mine
                        ? "bg-[#5B4CF0]/10 text-[#101828] rounded-tr-sm"
                        : "bg-gray-100 text-white/90 rounded-tl-sm"
                    }`}
                  >
                    {msg.message}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {msg.is_important && <span className="text-[10px] text-[#5B4CF0]">📌 Important</span>}
                    {msg.user?.is_admin && (
                      <button
                        onClick={() => handlePin(msg.id)}
                        className="text-[10px] text-[#667085] hover:text-white"
                      >
                        {msg.is_important ? "Unpin" : "Pin as important"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 shrink-0">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          rows={2}
          className="flex-1 bg-gray-50 border border-[#ECEFF5] rounded-xl px-4 py-2.5 text-sm text-[#101828] placeholder:text-[#667085] focus:outline-none focus:border-[#5B4CF0]/50 resize-none"
        />
        <Button disabled={!text.trim() || sending} onClick={handleSend} className="self-end">
          {sending ? "..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
