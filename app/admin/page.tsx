import { Package, ShoppingCart, Users, Store, Wallet } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatCard } from "@/components/admin/StatCard";
import { OrderStatusChart, RevenueChart } from "@/components/admin/AdminCharts";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [productCount, orderCount, customerCount, vendorCount, revenue, statusBreakdown, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.vendorProfile.count({ where: { status: "APPROVED" } }),
      prisma.order.aggregate({ where: { paymentStatus: "APPROVED" }, _sum: { totalAmount: true } }),
      prisma.order.groupBy({ by: ["orderStatus"], _count: { _all: true } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 7, select: { createdAt: true, totalAmount: true } }),
    ]);

  const statusData = statusBreakdown.map((row) => ({ status: row.orderStatus, count: row._count._all }));
  const revenueData = recentOrders
    .slice()
    .reverse()
    .map((order) => ({ label: formatDate(order.createdAt), amount: Number(order.totalAmount) }));

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Platform Overview</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Revenue" value={formatPrice(Number(revenue._sum.totalAmount ?? 0))} icon={Wallet} />
        <StatCard label="Orders" value={orderCount} icon={ShoppingCart} />
        <StatCard label="Products" value={productCount} icon={Package} accent="text-emerald" />
        <StatCard label="Customers" value={customerCount} icon={Users} />
        <StatCard label="Active Vendors" value={vendorCount} icon={Store} accent="text-emerald" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <OrderStatusChart data={statusData} />
        <RevenueChart data={revenueData} />
      </div>
    </div>
  );
}
