"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { formatPrice, formatDate } from "@/lib/utils";

interface VendorOrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: string;
  fulfillmentStatus: string;
  product: { title: string };
}

interface VendorOrder {
  id: string;
  createdAt: string;
  paymentStatus: string;
  customer: { name: string; email: string };
  items: VendorOrderItem[];
}

const NEXT_STATUSES = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  async function load() {
    const res = await apiFetch("/api/orders");
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateItem(orderId: string, itemId: string, status: string) {
    const res = await apiFetch(`/api/orders/${orderId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fulfillmentStatus: status }),
    });
    if (!res.ok) {
      show("Could not update order item", "error");
      return;
    }
    show("Order item updated", "success");
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Incoming Orders</h1>

      {loading ? (
        <p className="mt-6 text-muted">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="glass mt-6 rounded-2xl p-10 text-center text-muted">No orders yet.</div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Table key={order.id}>
              <Thead>
                <Tr>
                  <Th colSpan={5}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span>
                        Order #{order.id.slice(-8).toUpperCase()} &middot; {order.customer.name} &middot; {formatDate(order.createdAt)}
                      </span>
                      <Badge status={order.paymentStatus}>Payment {order.paymentStatus}</Badge>
                    </div>
                  </Th>
                </Tr>
                <Tr>
                  <Th>Product</Th>
                  <Th>Qty</Th>
                  <Th>Total</Th>
                  <Th>Status</Th>
                  <Th>Update</Th>
                </Tr>
              </Thead>
              <Tbody>
                {order.items.map((item) => (
                  <Tr key={item.id}>
                    <Td>{item.product.title}</Td>
                    <Td>{item.quantity}</Td>
                    <Td className="text-gold-light">{formatPrice(Number(item.priceAtPurchase) * item.quantity)}</Td>
                    <Td><Badge status={item.fulfillmentStatus}>{item.fulfillmentStatus}</Badge></Td>
                    <Td>
                      <Select
                        value=""
                        onChange={(e) => e.target.value && updateItem(order.id, item.id, e.target.value)}
                      >
                        <option value="">Change status…</option>
                        {NEXT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </Select>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ))}
        </div>
      )}
    </div>
  );
}
