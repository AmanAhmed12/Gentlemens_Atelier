"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { mutate } from "@/lib/toastFetch";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { formatPrice } from "@/lib/utils";

interface AdminProduct {
  id: string;
  title: string;
  price: string;
  stockQuantity: number;
  isActive: boolean;
  images: string[];
  category: { name: string };
  vendor: { storeName: string };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  async function load() {
    const res = await apiFetch("/api/products?all=true&pageSize=24");
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(product: AdminProduct) {
    const { ok } = await mutate(
      `/api/products/${product.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      },
      show,
      product.isActive ? "Product deactivated" : "Product activated",
      "Could not update product status",
    );
    if (ok) load();
  }

  async function handleDelete(product: AdminProduct) {
    if (!window.confirm(`Remove "${product.title}" from the platform?`)) return;
    const { ok } = await mutate(`/api/products/${product.id}`, { method: "DELETE" }, show, "Product removed", "Could not remove product");
    if (ok) load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-foreground">All Products</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4" /> New Product
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-muted">Loading…</p>
      ) : (
        <Table className="mt-6">
          <Thead>
            <Tr>
              <Th>Product</Th>
              <Th>Vendor</Th>
              <Th>Category</Th>
              <Th>Price</Th>
              <Th>Stock</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {products.map((product) => (
              <Tr key={product.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    {product.images[0] && (
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                        <Image src={product.images[0]} alt="" fill className="object-cover" />
                      </div>
                    )}
                    {product.title}
                  </div>
                </Td>
                <Td>{product.vendor.storeName}</Td>
                <Td>{product.category.name}</Td>
                <Td className="text-gold-light">{formatPrice(product.price)}</Td>
                <Td>{product.stockQuantity}</Td>
                <Td>
                  <button onClick={() => toggleActive(product)}>
                    <Badge status={product.isActive ? "APPROVED" : "SUSPENDED"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </button>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="secondary" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(product)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
