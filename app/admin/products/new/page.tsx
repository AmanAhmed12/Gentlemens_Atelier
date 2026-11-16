import { prisma } from "@/lib/db";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProductForm } from "@/components/vendor/ProductForm";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const [categories, vendors] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.vendorProfile.findMany({ orderBy: { storeName: "asc" }, select: { id: true, storeName: true, status: true } }),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-foreground">New Product</h1>
      <GlassCard strong className="mt-6">
        <ProductForm
          categories={categories}
          vendors={vendors.map((v) => ({ id: v.id, storeName: `${v.storeName} (${v.status})` }))}
          redirectTo="/admin/products"
        />
      </GlassCard>
    </div>
  );
}
