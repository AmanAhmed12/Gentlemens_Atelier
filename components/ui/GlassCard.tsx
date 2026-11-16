import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({ className, strong, ...props }: HTMLAttributes<HTMLDivElement> & { strong?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6",
        strong ? "glass-strong" : "glass",
        className,
      )}
      {...props}
    />
  );
}
