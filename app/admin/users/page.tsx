"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { Plus, Pencil, Trash2, ShieldOff, ShieldCheck } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { formatDate, cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "VENDOR" | "CUSTOMER";
  isSuspended: boolean;
  createdAt: string;
  vendorProfile: { storeName: string; status: string } | null;
}

const emptyCreateForm = {
  name: "",
  email: "",
  password: "",
  role: "CUSTOMER" as "CUSTOMER" | "VENDOR",
  storeName: "",
  businessRegNo: "",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);
  const { show } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [creating, setCreating] = useState(false);

  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await apiFetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleSuspend(user: AdminUser) {
    await apiFetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isSuspended: !user.isSuspended }),
    });
    show(user.isSuspended ? "User reinstated" : "User suspended", "success");
    load();
  }

  async function confirmDelete() {
    if (!toDelete) return;
    await apiFetch(`/api/admin/users/${toDelete.id}`, { method: "DELETE" });
    show("User deleted", "success");
    setToDelete(null);
    load();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await apiFetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.error ?? "Could not create user", "error");
        return;
      }
      show("User created", "success");
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      load();
    } finally {
      setCreating(false);
    }
  }

  function openEdit(user: AdminUser) {
    setEditing(user);
    setEditForm({ name: user.name, email: user.email, password: "" });
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload: Record<string, string> = { name: editForm.name, email: editForm.email };
      if (editForm.password) payload.password = editForm.password;

      const res = await apiFetch(`/api/admin/users/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.error ?? "Could not update user", "error");
        return;
      }
      show("User updated", "success");
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-foreground">Manage Users</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New User
        </Button>
      </div>

      {loading ? (
        <p className="mt-6 text-muted">Loading…</p>
      ) : (
        <Table className="mt-6">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user.id}>
                <Td>{user.name}{user.vendorProfile && <span className="ml-2 text-xs text-muted">({user.vendorProfile.storeName})</span>}</Td>
                <Td>{user.email}</Td>
                <Td><Badge>{user.role}</Badge></Td>
                <Td>{user.isSuspended ? <Badge status="SUSPENDED">Suspended</Badge> : <Badge status="APPROVED">Active</Badge>}</Td>
                <Td>{formatDate(user.createdAt)}</Td>
                <Td>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => toggleSuspend(user)}>
                      {user.isSuspended ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setToDelete(user)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New User">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex gap-2 rounded-full bg-white/5 p-1">
            {(["CUSTOMER", "VENDOR"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setCreateForm({ ...createForm, role: r })}
                className={cn(
                  "flex-1 rounded-full py-2 text-sm font-medium transition",
                  createForm.role === r ? "bg-gold text-[#1a1408]" : "text-muted hover:text-foreground",
                )}
              >
                {r === "CUSTOMER" ? "Customer" : "Vendor"}
              </button>
            ))}
          </div>
          <Input
            label="Full Name"
            required
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            required
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={8}
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
          />
          {createForm.role === "VENDOR" && (
            <>
              <Input
                label="Store Name"
                required
                value={createForm.storeName}
                onChange={(e) => setCreateForm({ ...createForm, storeName: e.target.value })}
              />
              <Input
                label="Business Registration No."
                required
                value={createForm.businessRegNo}
                onChange={(e) => setCreateForm({ ...createForm, businessRegNo: e.target.value })}
              />
              <p className="text-xs text-muted">Vendors created here are automatically approved.</p>
            </>
          )}
          <Button type="submit" loading={creating} className="self-start">
            Create User
          </Button>
        </form>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit User">
        <form onSubmit={handleEditSave} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            required
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            required
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Leave blank to keep current password"
            minLength={8}
            value={editForm.password}
            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
          />
          <Button type="submit" loading={saving} className="self-start">
            Save Changes
          </Button>
        </form>
      </Modal>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete User">
        <p className="text-sm text-muted">
          Are you sure you want to permanently delete <strong>{toDelete?.name}</strong>? This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
