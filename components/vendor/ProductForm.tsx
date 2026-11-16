"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { useToast } from "@/components/providers/ToastProvider";
import { apiFetch } from "@/lib/apiFetch";

interface Category {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  storeName: string;
}

export interface ProductFormValues {
  id?: string;
  title: string;
  description: string;
  price: string;
  stockQuantity: string;
  categoryId: string;
  vendorId?: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
}

export function ProductForm({
  categories,
  vendors,
  initial,
  redirectTo = "/vendor/products",
}: {
  categories: Category[];
  vendors?: Vendor[];
  initial?: ProductFormValues;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductFormValues>(
    initial ?? {
      title: "",
      description: "",
      price: "",
      stockQuantity: "0",
      categoryId: categories[0]?.id ?? "",
      vendorId: vendors?.[0]?.id ?? "",
      images: [],
      isActive: true,
      isFeatured: false,
    },
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = form.id ? `/api/products/${form.id}` : "/api/products";
      const res = await apiFetch(url, {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: Number(form.price),
          stockQuantity: Number(form.stockQuantity),
          categoryId: form.categoryId,
          images: form.images,
          isActive: form.isActive,
          isFeatured: form.isFeatured,
          ...(vendors ? { vendorId: form.vendorId } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.error ?? "Could not save product", "error");
        return;
      }
      show(form.id ? "Product updated" : "Product created", "success");
      router.push(redirectTo);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <ImageUploader
        label="Product Images"
        value={form.images}
        onChange={(images) => setForm({ ...form, images })}
        max={6}
      />
      {vendors && (
        <Select label="Vendor" value={form.vendorId ?? ""} onChange={(e) => setForm({ ...form, vendorId: e.target.value })}>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.storeName}
            </option>
          ))}
        </Select>
      )}
      <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Textarea
        label="Description"
        required
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price (LKR)"
          type="number"
          min={0}
          step="0.01"
          required
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <Input
          label="Stock Quantity"
          type="number"
          min={0}
          required
          value={form.stockQuantity}
          onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
        />
      </div>
      <Select label="Category" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-foreground/80">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active (visible to customers)
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground/80">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
          />
          Feature on homepage
        </label>
      </div>
      <Button type="submit" loading={saving} className="self-start">
        {form.id ? "Save Changes" : "Create Product"}
      </Button>
    </form>
  );
}
