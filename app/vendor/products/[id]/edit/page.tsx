import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProductForm } from "@/components/vendor/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { vendor: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product || product.vendor.userId !== user.sub) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-foreground">Edit Product</h1>
      <GlassCard strong className="mt-6">
        <ProductForm
          categories={categories}
          initial={{
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price.toString(),
            stockQuantity: product.stockQuantity.toString(),
            categoryId: product.categoryId,
            images: product.images,
            isActive: product.isActive,
            isFeatured: product.isFeatured,
          }}
        />
      </GlassCard>
    </div>
  );
}
