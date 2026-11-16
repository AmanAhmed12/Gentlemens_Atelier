import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { toPlain } from "@/lib/serialize";
import { formatPrice } from "@/lib/utils";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { AddToCartBar } from "@/components/storefront/AddToCartBar";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, vendor: { select: { storeName: true, status: true } } },
  });

  if (!product || !product.isActive || product.vendor.status !== "APPROVED") {
    notFound();
  }

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
      vendor: { status: "APPROVED" },
    },
    include: { category: true, vendor: { select: { storeName: true } } },
    take: 4,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />

        <div>
          <p className="text-xs uppercase tracking-wide text-gold-light">{product.category.name}</p>
          <h1 className="mt-2 font-display text-3xl text-foreground">{product.title}</h1>
          <p className="mt-1 text-sm text-muted">Sold by {product.vendor.storeName}</p>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl text-gold-light">{formatPrice(Number(product.price))}</span>
            <Badge status={product.stockQuantity > 0 ? "DELIVERED" : "FAILED"}>
              {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
            </Badge>
          </div>

          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-foreground/80">{product.description}</p>

          <div className="mt-8">
            <AddToCartBar productId={product.id} stockQuantity={product.stockQuantity} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl text-foreground">You May Also Like</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {toPlain(related).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
