"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader, DataTable, AdminModal, ConfirmDialog } from "@/components/admin";
import type { Column } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { formatDate, cn } from "@/lib/utils";

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

interface ExistingUser {
  id: string;
  full_name: string | null;
  email: string;
}

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "project_manager", label: "Project Manager" },
  { value: "content_manager", label: "Content Manager" },
  { value: "academy_manager", label: "Academy Manager" },
  { value: "finance_manager", label: "Finance Manager" },
  { value: "support_staff", label: "Support Staff" },
];

const ALL_PERMISSIONS = [
  "manage_clients",
  "manage_projects",
  "manage_payments",
  "manage_academy",
  "manage_content",
  "manage_settings",
  "manage_admins",
  "view_analytics",
];

const ROLE_COLORS: Record<string, "gold" | "info" | "success" | "error"> = {
  super_admin: "error",
  project_manager: "info",
  content_manager: "gold",
  academy_manager: "success",
  finance_manager: "gold",
  support_staff: "info",
};

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formRole, setFormRole] = useState("project_manager");
  const [formPermissions, setFormPermissions] = useState<string[]>([]);
  const [existingUsers, setExistingUsers] = useState<ExistingUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search.trim()) params.set("search", search.trim());
      const res = await adminFetch<AdminUserListResponse>(`/admin-users?${params.toString()}`);
      setUsers(res.data);
      setLastPage(res.last_page);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin users");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const fetchExistingUsers = async () => {
    try {
      const res = await fetch("/api/v1/admin/users", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) setExistingUsers(data.data || []);
    } catch { /* ignore */ }
  };

  const openCreate = async () => {
    setEditingId(null);
    setFormRole("project_manager");
    setFormPermissions([]);
    setSelectedUserId("");
    await fetchExistingUsers();
    setShowForm(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditingId(user.id);
    setFormRole(user.role);
    setFormPermissions(user.permissions);
    setSelectedUserId(user.user_id);
    setShowForm(true);
  };

  const togglePermission = (perm: string) => {
    setFormPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await adminFetch(`/admin-users/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({
            role: formRole,
            permissions: formPermissions,
          }),
        });
      } else {
        await adminFetch("/admin-users", {
          method: "POST",
          body: JSON.stringify({
            user_id: selectedUserId,
            role: formRole,
            permissions: formPermissions,
          }),
        });
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      console.error("Failed to save admin user:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      await adminFetch(`/admin-users/${user.id}/toggle-status`, { method: "PATCH" });
      fetchUsers();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminFetch(`/admin-users/${deleteTarget.id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (user) => (
        <div>
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-muted">{user.email}</p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      hideOnMobile: true,
      render: (user) => <span className="text-sm text-muted">{user.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (user) => (
        <Badge variant={ROLE_COLORS[user.role] || "info"}>
          {user.role.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
        </Badge>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (user) => (
        <Badge variant={user.is_active ? "success" : "error"}>
          {user.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "last_login_at",
      header: "Last Login",
      hideOnMobile: true,
      render: (user) => (
        <span className="text-sm text-muted">
          {user.last_login_at ? formatDate(user.last_login_at) : "Never"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleActive(user)}
          >
            {user.is_active ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300"
            onClick={() => setDeleteTarget(user)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Admin Users"
        description="Manage users who have access to the admin panel."
        actions={
          <Button onClick={openCreate} icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          }>
            Add Admin
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchable
        searchPlaceholder="Search admin users..."
        onSearch={(val) => { setSearch(val); setPage(1); }}
        keyExtractor={(u) => u.id}
        pagination={{
          currentPage: page,
          lastPage,
          total,
          perPage: users.length || 10,
          onPageChange: (p) => setPage(p),
        }}
        emptyState={
          <EmptyState
            icon="👤"
            title={search ? "No matching users" : "No admin users yet"}
            description={search ? "Try a different search term." : "Add your first admin user."}
          />
        }
      />

      {error && !loading && (
        <div className="mt-4">
          <ErrorMessage title="Failed to load admin users" message={error} onRetry={fetchUsers} />
        </div>
      )}

      <AdminModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? "Edit Admin User" : "Add Admin User"}
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting}>
              {editingId ? "Update" : "Add Admin"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {!editingId && (
            <div>
              <label className="block text-sm text-white/80 font-medium mb-1.5">Select User</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                required
              >
                <option value="" disabled>Choose a user...</option>
                {existingUsers.map((u) => (
                  <option key={u.id} value={u.id} className="bg-surface text-white">
                    {u.full_name || u.email} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Select
            label="Role"
            value={formRole}
            onChange={(e) => setFormRole(e.target.value)}
            options={ROLE_OPTIONS}
          />

          <div>
            <label className="block text-sm text-white/80 font-medium mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PERMISSIONS.map((perm) => (
                <Checkbox
                  key={perm}
                  label={perm.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  checked={formPermissions.includes(perm)}
                  onChange={() => togglePermission(perm)}
                />
              ))}
            </div>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Admin User"
        message={`Are you sure you want to remove ${deleteTarget?.name || "this user"}? Super admins cannot be deleted if they are the last one.`}
        confirmText="Delete"
        destructive
        loading={deleting}
      />
    </div>
  );
}
