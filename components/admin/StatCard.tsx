import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "text-gold-light",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <GlassCard className="flex items-center gap-4">
      <div className={cn("flex h-11 w-11 items-center justify-center rounded-full bg-white/5", accent)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
        <p className="font-display text-xl text-foreground">{value}</p>
      </div>
    </GlassCard>
  );
}
