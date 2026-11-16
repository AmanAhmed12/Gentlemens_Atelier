import Link from "next/link";
import Image from "next/image";

export function CategoryGrid({
  categories,
}: {
  categories: { id: string; name: string; slug: string; imageUrl: string | null }[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 className="font-display text-2xl text-foreground">Shop by Category</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="glass group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl transition hover:border-gold/50"
          >
            {category.imageUrl && (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                className="object-cover opacity-30 transition group-hover:opacity-50"
              />
            )}
            <span className="relative z-10 text-center text-sm font-medium text-foreground">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
