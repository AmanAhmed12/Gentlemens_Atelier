import { ShieldCheck, Store, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const highlights = [
  {
    icon: Store,
    title: "Multi-Vendor Marketplace",
    description: "Independent menswear houses run their own storefronts, inventory, and orders from one dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Design",
    description: "Role-based access, encrypted passwords, and JWT sessions keep every account protected.",
  },
  {
    icon: Sparkles,
    title: "AI Shopping Assistant",
    description: "Ask our Gemini-powered assistant about sizing, availability, or your order status   any time.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 sm:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <GlassCard key={item.title} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold-light">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
