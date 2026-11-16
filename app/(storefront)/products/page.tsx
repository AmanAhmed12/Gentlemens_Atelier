import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { toPlain } from "@/lib/serialize";
import { ProductFilters } from "@/components/storefront/ProductFilters";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    vendor: { status: "APPROVED" },
  };

  if (params.search) {
    where.title = { contains: params.search, mode: "insensitive" };
  }
  if (params.category) {
    where.category = { slug: params.category };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.sort === "price-asc" ? { price: "asc" } : params.sort === "price-desc" ? { price: "desc" } : { createdAt: "desc" };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: true, vendor: { select: { storeName: true } } },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-foreground">Shop the Collection</h1>
      <p className="mt-2 text-sm text-muted">{total} product{total === 1 ? "" : "s"} available</p>

      <div className="mt-6">
        <ProductFilters categories={categories} />
      </div>

      {products.length === 0 ? (
        <div className="glass mt-10 rounded-2xl p-10 text-center text-muted">No products match your search.</div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {toPlain(products).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Link
              key={pageNum}
              href={{ pathname: "/products", query: { ...params, page: pageNum } }}
            >
              <Button variant={pageNum === page ? "primary" : "secondary"} size="sm">
                {pageNum}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
