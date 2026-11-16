import { prisma } from "@/lib/db";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProductForm } from "@/components/vendor/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-foreground">New Product</h1>
      <GlassCard strong className="mt-6">
        <ProductForm categories={categories} />
      </GlassCard>
    </div>
  );
}
