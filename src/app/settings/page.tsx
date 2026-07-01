"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

type Settings = {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    marketing_emails: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/settings", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.data);
      }
    } catch {
      setError("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (key: keyof Settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const csrfRes = await fetch("/sanctum/csrf-cookie", { credentials: "include" });
      const csrfMatch = document.cookie.match(/(^| )XSRF-TOKEN=([^;]+)/);
      const token = csrfMatch ? decodeURIComponent(csrfMatch[2]) : null;

      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { "X-XSRF-TOKEN": token } : {}),
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save settings");
      }

      setSuccess("Settings saved!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStyle = (on: boolean) =>
    `relative w-11 h-6 rounded-full transition-colors duration-300 ${
      on ? "bg-gold" : "bg-white/10"
    }`;

  const knobStyle = (on: boolean) =>
    `absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 shadow-md ${
      on ? "translate-x-5" : "translate-x-0"
    }`;

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="h-8 bg-white/5 rounded w-48 mb-2 animate-pulse" />
          <div className="h-5 bg-white/5 rounded w-64 mb-10 animate-pulse" />
          <div className="glass rounded-2xl p-6 space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-muted mt-1">Manage your notification preferences.</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400">
            {success}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 md:p-8 space-y-6"
        >
          <h2 className="text-lg font-bold text-white">Notification Preferences</h2>
          <p className="text-xs text-muted -mt-4">Choose how you receive updates about your projects.</p>

          {[
            { key: "email_notifications" as keyof Settings, label: "Email Notifications", desc: "Receive project updates via email" },
            { key: "push_notifications" as keyof Settings, label: "Push Notifications", desc: "Receive browser notifications" },
            { key: "sms_notifications" as keyof Settings, label: "SMS Notifications", desc: "Receive updates via SMS" },
            { key: "marketing_emails" as keyof Settings, label: "Marketing Emails", desc: "Receive promotional offers and updates" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-white">{item.label}</p>
                <p className="text-xs text-muted mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={toggleStyle(settings[item.key])}
                role="switch"
                aria-checked={settings[item.key]}
              >
                <span className={knobStyle(settings[item.key])} />
              </button>
            </div>
          ))}

          <div className="pt-4 border-t border-white/5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:scale-100"
            >
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
