"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader, AdminModal } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  permissions: string[];
  created_at: string;
}

interface AdminUserListResponse {
  data: AdminUser[];
  current_page: number;
  last_page: number;
  total: number;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  project_manager: "Project Manager",
  content_manager: "Content Manager",
  academy_manager: "Academy Manager",
  finance_manager: "Finance Manager",
  support_staff: "Support Staff",
};

const ROLE_COLORS: Record<string, "gold" | "info" | "success" | "error"> = {
  super_admin: "error",
  project_manager: "info",
  content_manager: "gold",
  academy_manager: "success",
  finance_manager: "gold",
  support_staff: "info",
};

const ALL_PERMISSIONS = [
  "manage_clients",
  "manage_projects",
  "manage_payments",
  "manage_academy",
  "manage_content",
  "manage_services",
  "manage_blog",
  "manage_portfolio",
  "manage_media",
  "manage_settings",
  "manage_admins",
  "manage_roles",
  "view_analytics",
  "view_audit_logs",
  "manage_notifications",
  "manage_reviews",
];

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

export default function RolesPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<AdminUserListResponse>("/admin-users?page=1&per_page=100");
      setUsers(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const groupedByRole = users.reduce<Record<string, AdminUser[]>>((acc, user) => {
    if (!acc[user.role]) acc[user.role] = [];
    acc[user.role].push(user);
    return acc;
  }, {});

  const openEdit = (user: AdminUser) => {
    setEditUser(user);
    setEditPermissions([...user.permissions]);
  };

  const togglePermission = (perm: string) => {
    setEditPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSavePermissions = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await adminFetch(`/admin-users/${editUser.id}`, {
        method: "PUT",
        body: JSON.stringify({ permissions: editPermissions }),
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id ? { ...u, permissions: editPermissions } : u
        )
      );
      setEditUser(null);
    } catch (err) {
      console.error("Failed to update permissions:", err);
    } finally {
      setSaving(false);
    }
  };

  const permissionLabel = (perm: string) =>
    perm.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  if (loading) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="portal-card rounded-2xl p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return <ErrorMessage title="Failed to load roles" message={error} onRetry={fetchUsers} />;
  }

  if (users.length === 0) {
    return (
      <div>
        <AdminPageHeader title="Roles & Permissions" description="View and manage admin user permissions." />
        <EmptyState
          icon="🔐"
          title="No admin users found"
          description="Admin users will appear here once they are created."
        />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Roles & Permissions"
        description="View all admin users grouped by role and manage their permissions."
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {Object.entries(groupedByRole).map(([role, roleUsers]) => (
          <motion.div key={role} variants={itemVariants} className="portal-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {ROLE_LABELS[role] || role.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </h3>
                <p className="text-sm text-[#667085]">{roleUsers.length} admin{roleUsers.length !== 1 ? "s" : ""}</p>
              </div>
              <Badge variant={ROLE_COLORS[role] || "info"}>{role}</Badge>
            </div>

            {roleUsers.length > 0 && (
              <div className="space-y-2 mb-4">
                {roleUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-white/[0.04] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-[#667085]">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${user.is_active ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => openEdit(user)}>
                        Edit Permissions
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {roleUsers.length > 0 && (
              <div>
                <p className="text-xs text-[#667085] mb-2 font-medium uppercase tracking-wider">Permissions Summary</p>
                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    const allPerms = new Set(roleUsers.flatMap((u) => u.permissions));
                    return ALL_PERMISSIONS.map((perm) => (
                      <span
                        key={perm}
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
                          allPerms.has(perm)
                            ? "bg-[#5B4CF0]/10 text-[#5B4CF0]"
                            : "bg-gray-50 text-[#667085]"
                        )}
                      >
                        {permissionLabel(perm)}
                      </span>
                    ));
                  })()}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <AdminModal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title={`Permissions: ${editUser?.name || ""}`}
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleSavePermissions} loading={saving}>
              Save Permissions
            </Button>
          </div>
        }
      >
        {editUser && (
          <div className="space-y-4">
            <div className="text-sm text-[#667085] mb-2">
              Editing permissions for <span className="text-white font-medium">{editUser.name}</span>
              <br />
              Current role: <Badge variant={ROLE_COLORS[editUser.role] || "info"}>
                {ROLE_LABELS[editUser.role] || editUser.role}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {ALL_PERMISSIONS.map((perm) => (
                <Checkbox
                  key={perm}
                  label={permissionLabel(perm)}
                  checked={editPermissions.includes(perm)}
                  onChange={() => togglePermission(perm)}
                />
              ))}
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
