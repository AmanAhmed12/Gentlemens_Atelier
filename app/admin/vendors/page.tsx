"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { Check, X, Ban } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn, formatDate } from "@/lib/utils";
import { useToast } from "@/components/providers/ToastProvider";

interface Vendor {
  id: string;
  storeName: string;
  businessRegNo: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  createdAt: string;
  user: { name: string; email: string };
  _count: { products: number };
}

const TABS = ["ALL", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const;

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("ALL");
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  async function load() {
    setLoading(true);
    const query = tab === "ALL" ? "" : `?status=${tab}`;
    const res = await apiFetch(`/api/vendors${query}`);
    const data = await res.json();
    setVendors(data.vendors ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [tab]);

  async function updateStatus(id: string, status: Vendor["status"]) {
    await apiFetch(`/api/vendors/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    show(`Vendor ${status.toLowerCase()}`, "success");
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Vendor Approvals</h1>

      <div className="mt-5 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition",
              tab === t ? "bg-gold text-[#1a1408]" : "glass text-muted hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-muted">Loading…</p>
      ) : vendors.length === 0 ? (
        <p className="mt-6 text-muted">No vendors in this category.</p>
      ) : (
        <Table className="mt-6">
          <Thead>
            <Tr>
              <Th>Store</Th>
              <Th>Owner</Th>
              <Th>Registration No.</Th>
              <Th>Products</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {vendors.map((vendor) => (
              <Tr key={vendor.id}>
                <Td>{vendor.storeName}</Td>
                <Td>{vendor.user.name}<br /><span className="text-xs text-muted">{vendor.user.email}</span></Td>
                <Td>{vendor.businessRegNo}</Td>
                <Td>{vendor._count.products}</Td>
                <Td><Badge status={vendor.status}>{vendor.status}</Badge></Td>
                <Td>{formatDate(vendor.createdAt)}</Td>
                <Td>
                  <div className="flex gap-2">
                    {vendor.status !== "APPROVED" && (
                      <Button size="sm" onClick={() => updateStatus(vendor.id, "APPROVED")}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {vendor.status !== "REJECTED" && (
                      <Button variant="secondary" size="sm" onClick={() => updateStatus(vendor.id, "REJECTED")}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {vendor.status !== "SUSPENDED" && (
                      <Button variant="danger" size="sm" onClick={() => updateStatus(vendor.id, "SUSPENDED")}>
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
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
