"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";

interface AdminOrder {
  id: string;
  totalAmount: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  customer: { name: string; email: string };
  items: { id: string }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">All Orders</h1>

      {loading ? (
        <p className="mt-6 text-muted">Loading…</p>
      ) : (
        <Table className="mt-6">
          <Thead>
            <Tr>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Items</Th>
              <Th>Total</Th>
              <Th>Payment</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map((order) => (
              <Tr key={order.id}>
                <Td>
                  <Link href={`/admin/orders/${order.id}`} className="text-gold-light hover:underline">
                    #{order.id.slice(-8).toUpperCase()}
                  </Link>
                </Td>
                <Td>{order.customer.name}<br /><span className="text-xs text-muted">{order.customer.email}</span></Td>
                <Td>{order.items.length}</Td>
                <Td className="text-gold-light">{formatPrice(order.totalAmount)}</Td>
                <Td><Badge status={order.paymentStatus}>{order.paymentStatus}</Badge></Td>
                <Td><Badge status={order.orderStatus}>{order.orderStatus}</Badge></Td>
                <Td>{formatDate(order.createdAt)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
