"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/components/admin";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface Settings {
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  accent_color: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  contact_email: string;
  support_email: string;
  sales_email: string;
  paystack_public_key: string;
  flutterwave_public_key: string;
  default_currency: string;
  tax_percentage: number;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  maintenance_mode: boolean;
  maintenance_message: string;
}

type SettingGroup = {
  id: string;
  label: string;
  keys: (keyof Settings)[];
};

const SETTING_GROUPS: SettingGroup[] = [
  { id: "company", label: "Company", keys: ["company_name", "company_email", "company_phone", "company_address"] },
  { id: "branding", label: "Branding", keys: ["logo_url", "favicon_url", "primary_color", "accent_color"] },
  { id: "social", label: "Social", keys: ["facebook_url", "twitter_url", "instagram_url", "linkedin_url", "youtube_url"] },
  { id: "contact", label: "Contact", keys: ["contact_email", "support_email", "sales_email"] },
  { id: "payment", label: "Payment", keys: ["paystack_public_key", "flutterwave_public_key", "default_currency", "tax_percentage"] },
  { id: "notifications", label: "Notifications", keys: ["email_notifications_enabled", "sms_notifications_enabled"] },
  { id: "seo", label: "SEO", keys: ["meta_title", "meta_description", "meta_keywords"] },
  { id: "maintenance", label: "Maintenance", keys: ["maintenance_mode", "maintenance_message"] },
];

const SETTING_LABELS: Record<string, string> = {
  company_name: "Company Name",
  company_email: "Company Email",
  company_phone: "Company Phone",
  company_address: "Company Address",
  logo_url: "Logo URL",
  favicon_url: "Favicon URL",
  primary_color: "Primary Color",
  accent_color: "Accent Color",
  facebook_url: "Facebook URL",
  twitter_url: "Twitter URL",
  instagram_url: "Instagram URL",
  linkedin_url: "LinkedIn URL",
  youtube_url: "YouTube URL",
  contact_email: "Contact Email",
  support_email: "Support Email",
  sales_email: "Sales Email",
  paystack_public_key: "Paystack Public Key",
  flutterwave_public_key: "Flutterwave Public Key",
  default_currency: "Default Currency",
  tax_percentage: "Tax Percentage (%)",
  email_notifications_enabled: "Email Notifications",
  sms_notifications_enabled: "SMS Notifications",
  meta_title: "Meta Title",
  meta_description: "Meta Description",
  meta_keywords: "Meta Keywords",
  maintenance_mode: "Maintenance Mode",
  maintenance_message: "Maintenance Message",
};

const TEXTAREA_KEYS = new Set(["company_address", "meta_description", "maintenance_message"]);

const BOOLEAN_KEYS = new Set(["email_notifications_enabled", "sms_notifications_enabled", "maintenance_mode"]);

const COLOR_KEYS = new Set(["primary_color", "accent_color"]);

async function adminFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`/api/v1/admin${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("company");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ data: Settings }>("/settings");
      setSettings(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateField = (key: keyof Settings, value: string | boolean | number) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value as never });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSuccessMessage("");
    try {
      await adminFetch("/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      setSuccessMessage("All settings saved successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (key: keyof Settings) => {
    if (!settings) return null;
    const value = settings[key];
    const label = SETTING_LABELS[key] || key;

    if (BOOLEAN_KEYS.has(key)) {
      return (
        <Checkbox
          label={label}
          checked={!!value}
          onChange={(checked) => updateField(key, checked)}
        />
      );
    }

    if (TEXTAREA_KEYS.has(key)) {
      return (
        <div>
          <label className="block text-sm text-[#667085] font-medium mb-1.5">{label}</label>
          <textarea
            value={String(value || "")}
            onChange={(e) => updateField(key, e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-[#ECEFF5] text-[#101828] placeholder:text-[#667085]/50 focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
          />
        </div>
      );
    }

    if (COLOR_KEYS.has(key)) {
      return (
        <div className="flex items-center gap-3">
          <Input
            label={label}
            value={String(value || "")}
            onChange={(e) => updateField(key, e.target.value)}
          />
          <input
            type="color"
            value={String(value || "#000000")}
            onChange={(e) => updateField(key, e.target.value)}
            className="w-10 h-10 rounded-lg border border-[#ECEFF5] bg-transparent cursor-pointer shrink-0 mt-6"
          />
        </div>
      );
    }

    if (key === "tax_percentage") {
      return (
        <Input
          label={label}
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={String(value ?? "")}
          onChange={(e) => updateField(key, parseFloat(e.target.value) || 0)}
        />
      );
    }

    return (
      <Input
        label={label}
        value={String(value || "")}
        onChange={(e) => updateField(key, e.target.value)}
      />
    );
  };

  const tabs = SETTING_GROUPS.map((g) => ({ id: g.id, label: g.label }));

  if (loading) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-10 w-full" />
        <div className="portal-card rounded-2xl p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return <ErrorMessage title="Failed to load settings" message={error} onRetry={load} />;
  }

  if (!settings) return null;

  const currentGroup = SETTING_GROUPS.find((g) => g.id === activeTab) || SETTING_GROUPS[0];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <AdminPageHeader
          title="Settings"
          description="Manage application configuration and preferences."
        />
      </motion.div>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
        >
          {successMessage}
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </motion.div>

      <motion.div key={activeTab} variants={itemVariants} className="portal-card rounded-2xl p-6">
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-white">{currentGroup.label}</h3>
          {currentGroup.keys.map((key) => (
            <div key={key}>{renderField(key)}</div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-[#ECEFF5] flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg">
            Save All Settings
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
