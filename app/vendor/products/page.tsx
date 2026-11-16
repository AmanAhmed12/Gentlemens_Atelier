"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { apiFetch } from "@/lib/apiFetch";
import { formatPrice } from "@/lib/utils";

interface VendorProduct {
  id: string;
  title: string;
  price: string;
  stockQuantity: number;
  isActive: boolean;
  images: string[];
  category: { name: string };
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  async function load() {
    const res = await apiFetch("/api/products?mine=true&pageSize=24");
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(product: VendorProduct) {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    const res = await apiFetch(`/api/products/${product.id}`, { method: "DELETE" });
    if (!res.ok) {
      show("Could not delete product", "error");
      return;
    }
    show("Product deleted", "success");
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-foreground">My Products</h1>
        <Link href="/vendor/products/new">
          <Button>
            <Plus className="h-4 w-4" /> New Product
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-muted">Loading…</p>
      ) : products.length === 0 ? (
        <div className="glass mt-6 rounded-2xl p-10 text-center text-muted">
          You haven&apos;t listed any products yet.
        </div>
      ) : (
        <Table className="mt-6">
          <Thead>
            <Tr>
              <Th>Product</Th>
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
                <Td>{product.category.name}</Td>
                <Td className="text-gold-light">{formatPrice(product.price)}</Td>
                <Td>{product.stockQuantity}</Td>
                <Td><Badge status={product.isActive ? "APPROVED" : "SUSPENDED"}>{product.isActive ? "Active" : "Inactive"}</Badge></Td>
                <Td>
                  <div className="flex gap-2">
                    <Link href={`/vendor/products/${product.id}/edit`}>
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
