"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import Image from "next/image";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { useToast } from "@/components/providers/ToastProvider";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", imageUrl: "" });
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  async function load() {
    const res = await apiFetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", imageUrl: "" });
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setForm({ name: category.name, imageUrl: category.imageUrl ?? "" });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
      const res = await apiFetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, imageUrl: form.imageUrl || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.error ?? "Could not save category", "error");
        return;
      }
      show(editing ? "Category updated" : "Category created", "success");
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    const res = await apiFetch(`/api/categories/${category.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      show(data.error ?? "Could not delete category", "error");
      return;
    }
    show("Category deleted", "success");
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-foreground">Categories</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Category
        </Button>
      </div>

      <Table className="mt-6">
        <Thead>
          <Tr>
            <Th>Image</Th>
            <Th>Name</Th>
            <Th>Slug</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {categories.map((category) => (
            <Tr key={category.id}>
              <Td>
                {category.imageUrl ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                    <Image src={category.imageUrl} alt="" fill className="object-cover" />
                  </div>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </Td>
              <Td>{category.name}</Td>
              <Td className="text-muted">{category.slug}</Td>
              <Td>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(category)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(category)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Category" : "New Category"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <ImageUploader
            label="Image"
            value={form.imageUrl ? [form.imageUrl] : []}
            onChange={(urls) => setForm({ ...form, imageUrl: urls[0] ?? "" })}
            max={1}
          />
          <Button type="submit" loading={saving} className="mt-2 self-start">
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}
