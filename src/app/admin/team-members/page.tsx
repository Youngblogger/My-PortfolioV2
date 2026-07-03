"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, type TeamMemberData } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

const roleOptions = [
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
  { value: "project_manager", label: "Project Manager" },
  { value: "qa", label: "QA" },
  { value: "devops", label: "DevOps" },
  { value: "product_owner", label: "Product Owner" },
  { value: "scrum_master", label: "Scrum Master" },
  { value: "consultant", label: "Consultant" },
];

const availabilityFilterOptions = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminTeamMembersPage() {
  const [members, setMembers] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ user_id: "", role_slug: "developer", title: "" });
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignOrderId, setAssignOrderId] = useState("");
  const [assignRole, setAssignRole] = useState("developer");
  const [orders, setOrders] = useState<{ value: string; label: string }[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTargetId, setAssignTargetId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getTeamMembers();
        if (!mounted) return;
        setMembers(res.data || []);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load team members");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function loadOrders() {
    try {
      const res = await api.getAdminOrders();
      const opts = (res.data.data || []).map((o) => ({
        value: o.id,
        label: `${o.order_number} - ${o.project_name || o.projectType?.title || "Untitled"}`,
      }));
      setOrders(opts);
    } catch {
      setOrders([]);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.user_id.trim()) return;
    setCreating(true);
    try {
      await api.createTeamMember(createForm);
      setShowCreateModal(false);
      setCreateForm({ user_id: "", role_slug: "developer", title: "" });
      const res = await api.getTeamMembers();
      setMembers(res.data || []);
    } catch (err) {
      console.error("Failed to create team member:", err);
    } finally {
      setCreating(false);
    }
  }

  async function handleAssign() {
    if (!assignTargetId || !assignOrderId || !assignRole) return;
    setAssigningId(assignTargetId);
    try {
      await api.assignTeamMember(assignOrderId, assignTargetId, assignRole);
      setShowAssignModal(false);
      setAssignTargetId(null);
      setAssignOrderId("");
      setAssignRole("developer");
    } catch (err) {
      console.error("Failed to assign team member:", err);
    } finally {
      setAssigningId(null);
    }
  }

  async function handleUnassign(memberId: string, assignmentId?: string) {
    if (!assignmentId) return;
    try {
      await api.unassignTeamMember(assignmentId);
    } catch (err) {
      console.error("Failed to unassign team member:", err);
    }
  }

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || m.role_slug === roleFilter;
    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && m.is_available) ||
      (availabilityFilter === "unavailable" && !m.is_available);
    return matchesSearch && matchesRole && matchesAvailability;
  });

  function openAssign(member: TeamMemberData) {
    setAssignTargetId(member.id);
    setShowAssignModal(true);
    loadOrders();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="section-label">TEAM</span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#101828] mt-1">
            Team Members
          </h1>
          <p className="text-[#667085] text-sm mt-1">
            Manage your team and assign members to projects.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }>
          Add Member
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          options={roleOptions}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="sm:w-44"
        />
        <Select
          options={availabilityFilterOptions}
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="sm:w-40"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="portal-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorMessage
          title="Failed to Load Team Members"
          message={error}
          onRetry={() => window.location.reload()}
        />
      ) : members.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No team members yet"
          description="Add your first team member to start assigning them to projects."
          action={{ label: "Add Member", href: "#" }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No matching members"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filtered.map((member) => (
            <motion.div
              key={member.id}
              variants={cardVariants}
              className="portal-card rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center text-xl">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[#667085]">{member.name.charAt(0).toUpperCase()}</span>
                    )}
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background ${
                        member.is_available ? "bg-green-400" : "bg-red-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{member.name}</p>
                    <p className="text-[#5B4CF0] text-xs font-medium">{member.title || member.role_slug}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#667085]">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>{member.is_available ? "Available" : "Unavailable"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  <span>Active Projects: 0</span>
                </div>
              </div>

              <div className="flex gap-2 mt-auto pt-2 border-t border-[#ECEFF5]">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => openAssign(member)}
                >
                  Assign
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => handleUnassign(member.id)}
                >
                  Unassign
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => !creating && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="portal-card rounded-2xl p-6 w-full max-w-md space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Add Team Member</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-[#667085] hover:text-white hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  label="User ID"
                  placeholder="Enter user ID"
                  value={createForm.user_id}
                  onChange={(e) => setCreateForm((p) => ({ ...p, user_id: e.target.value }))}
                  required
                />
                <Select
                  label="Role"
                  options={roleOptions}
                  value={createForm.role_slug}
                  onChange={(e) => setCreateForm((p) => ({ ...p, role_slug: e.target.value }))}
                />
                <Input
                  label="Title"
                  placeholder="e.g. Senior Frontend Developer"
                  value={createForm.title}
                  onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                />
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowCreateModal(false)}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" loading={creating}>
                    Add Member
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => !assigningId && setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="portal-card rounded-2xl p-6 w-full max-w-md space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Assign to Project</h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-1 rounded-lg text-[#667085] hover:text-white hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <Select
                  label="Order"
                  options={orders}
                  placeholder="Select an order..."
                  value={assignOrderId}
                  onChange={(e) => setAssignOrderId(e.target.value)}
                />
                <Select
                  label="Role"
                  options={roleOptions}
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                />
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowAssignModal(false)}
                    disabled={!!assigningId}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleAssign}
                    loading={!!assigningId}
                    disabled={!assignOrderId}
                  >
                    Assign
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
