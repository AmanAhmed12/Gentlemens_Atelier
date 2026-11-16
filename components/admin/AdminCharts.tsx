"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";

const COLORS = ["#c9a227", "#1f6f54", "#7a2338", "#5b6ee1", "#e7c565"];

export function OrderStatusChart({ data }: { data: { status: string; count: number }[] }) {
  return (
    <GlassCard>
      <h3 className="font-display text-base text-foreground">Orders by Status</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" innerRadius={55} outerRadius={85} paddingAngle={3}>
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#141019", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 12 }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

export function RevenueChart({ data }: { data: { label: string; amount: number }[] }) {
  return (
    <GlassCard>
      <h3 className="font-display text-base text-foreground">Recent Order Value</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="label" stroke="#a6a0b3" fontSize={12} />
            <YAxis stroke="#a6a0b3" fontSize={12} />
            <Tooltip contentStyle={{ background: "#141019", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 12 }} />
            <Bar dataKey="amount" fill="#c9a227" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
