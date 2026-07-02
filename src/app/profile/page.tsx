"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { api, type ProfileData } from "@/lib/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    address: "",
    company: "",
    tax_id: "",
    bio: "",
    avatar_url: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getDashboard();
      const p = res.profile;
      setProfile(p);
      setForm({
        full_name: p.full_name || "",
        phone: p.phone || "",
        country: p.country || "",
        state: p.state || "",
        city: p.city || "",
        address: p.address || "",
        company: p.company || "",
        tax_id: p.tax_id || "",
        bio: p.bio || "",
        avatar_url: p.avatar_url || "",
      });
    } catch {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.updateProfile(form);
      setProfile(res.profile);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="h-8 bg-[#F7F9FC] rounded w-48 mb-2 animate-pulse" />
          <div className="h-5 bg-[#F7F9FC] rounded w-64 mb-10 animate-pulse" />
          <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-[#F7F9FC] rounded animate-pulse" />
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
          <h1 className="text-3xl font-bold text-[#101828]">Profile</h1>
          <p className="text-[#98A2B3] mt-1">Manage your personal information and contact details.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-6 md:p-8"
        >
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

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#ECEFF5]">
            <div className="w-16 h-16 rounded-full bg-[#5B4CF0]/20 flex items-center justify-center text-2xl font-bold text-[#5B4CF0] shrink-0">
              {form.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-[#101828] font-semibold text-lg">{form.full_name || "Your Name"}</p>
              <p className="text-sm text-[#98A2B3]">{profile?.email || ""}</p>
              <p className="text-xs text-[#667085] mt-0.5 capitalize">Role: {profile?.role || "client"}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#101828] mb-1.5">Full Name</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="w-full bg-white border-[#ECEFF5] rounded-xl px-4 py-2.5 text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#5B4CF0]/50 transition-colors"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-xs text-[#101828] mb-1.5">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full bg-white border-[#ECEFF5] rounded-xl px-4 py-2.5 text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#5B4CF0]/50 transition-colors"
                placeholder="+234..."
              />
            </div>
            <div>
              <label className="block text-xs text-[#101828] mb-1.5">Country</label>
              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full bg-white border-[#ECEFF5] rounded-xl px-4 py-2.5 text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#5B4CF0]/50 transition-colors"
                placeholder="Nigeria"
              />
            </div>
            <div>
              <label className="block text-xs text-[#101828] mb-1.5">State</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full bg-white border-[#ECEFF5] rounded-xl px-4 py-2.5 text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#5B4CF0]/50 transition-colors"
                placeholder="Lagos"
              />
            </div>
            <div>
              <label className="block text-xs text-[#101828] mb-1.5">City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full bg-white border-[#ECEFF5] rounded-xl px-4 py-2.5 text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#5B4CF0]/50 transition-colors"
                placeholder="Ikeja"
              />
            </div>
            <div>
              <label className="block text-xs text-[#101828] mb-1.5">Company</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className="w-full bg-white border-[#ECEFF5] rounded-xl px-4 py-2.5 text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#5B4CF0]/50 transition-colors"
                placeholder="Company name"
              />
            </div>
            <div>
              <label className="block text-xs text-[#101828] mb-1.5">Tax ID</label>
              <input
                name="tax_id"
                value={form.tax_id}
                onChange={handleChange}
                className="w-full bg-white border-[#ECEFF5] rounded-xl px-4 py-2.5 text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#5B4CF0]/50 transition-colors"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-xs text-[#101828] mb-1.5">Avatar URL</label>
              <input
                name="avatar_url"
                value={form.avatar_url}
                onChange={handleChange}
                className="w-full bg-white border-[#ECEFF5] rounded-xl px-4 py-2.5 text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#5B4CF0]/50 transition-colors"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs text-[#101828] mb-1.5">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full bg-white border-[#ECEFF5] rounded-xl px-4 py-2.5 text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#5B4CF0]/50 transition-colors"
              placeholder="Your address"
            />
          </div>

          <div className="mt-4">
            <label className="block text-xs text-[#101828] mb-1.5">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className="w-full bg-white border-[#ECEFF5] rounded-xl px-4 py-2.5 text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#5B4CF0]/50 transition-colors resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-8 w-full px-6 py-3 rounded-xl bg-[#5B4CF0] text-white font-bold text-sm hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:scale-100"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
