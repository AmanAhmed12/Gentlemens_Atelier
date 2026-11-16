import { prisma } from "@/lib/db";
import { toPlain } from "@/lib/serialize";
import { Hero } from "@/components/storefront/Hero";
import { CategoryGrid } from "@/components/storefront/CategoryGrid";
import { FeaturedCarousel } from "@/components/storefront/FeaturedCarousel";
import { AboutSection } from "@/components/storefront/AboutSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, newArrivals] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true, vendor: { status: "APPROVED" } },
      include: { category: true, vendor: { select: { storeName: true } } },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true, vendor: { status: "APPROVED" } },
      orderBy: { createdAt: "desc" },
      include: { category: true, vendor: { select: { storeName: true } } },
      take: 8,
    }),
  ]);

  return (
    <>
      <Hero />
      <CategoryGrid categories={categories} />
      <FeaturedCarousel title="Featured Products" products={toPlain(featured)} />
      <FeaturedCarousel title="New Arrivals" products={toPlain(newArrivals)} />
      <AboutSection />
    </>
  );
}
