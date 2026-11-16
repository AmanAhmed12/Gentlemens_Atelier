import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  PROCESSING: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  SHIPPED: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  DELIVERED: "bg-emerald/20 text-emerald border-emerald/40",
  CANCELLED: "bg-burgundy/20 text-red-300 border-burgundy/40",
  APPROVED: "bg-emerald/20 text-emerald border-emerald/40",
  REJECTED: "bg-burgundy/20 text-red-300 border-burgundy/40",
  SUSPENDED: "bg-burgundy/20 text-red-300 border-burgundy/40",
  FAILED: "bg-burgundy/20 text-red-300 border-burgundy/40",
};

export function Badge({ status, children, className }: { status?: string; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        status ? statusStyles[status] ?? "bg-white/10 text-foreground border-white/20" : "bg-white/10 border-white/20",
        className,
      )}
    >
      {children}
    </span>
  );
}
