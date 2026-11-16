import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProductForm } from "@/components/vendor/ProductForm";

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories, vendors] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.vendorProfile.findMany({ orderBy: { storeName: "asc" }, select: { id: true, storeName: true, status: true } }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-foreground">Edit Product</h1>
      <GlassCard strong className="mt-6">
        <ProductForm
          categories={categories}
          vendors={vendors.map((v) => ({ id: v.id, storeName: `${v.storeName} (${v.status})` }))}
          redirectTo="/admin/products"
          initial={{
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price.toString(),
            stockQuantity: product.stockQuantity.toString(),
            categoryId: product.categoryId,
            vendorId: product.vendorId,
            images: product.images,
            isActive: product.isActive,
            isFeatured: product.isFeatured,
          }}
        />
      </GlassCard>
    </div>
  );
}
