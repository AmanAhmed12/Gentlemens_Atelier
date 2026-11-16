"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ProductFilters({ categories }: { categories: { slug: string; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        updateParam("search", search);
      }}
      className="glass flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-end sm:gap-4"
    >
      <div className="flex-1">
        <Input
          label="Search"
          placeholder="Search for suits, shirts, shoes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Select
        label="Category"
        value={searchParams.get("category") ?? ""}
        onChange={(e) => updateParam("category", e.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </Select>
      <Select
        label="Sort by"
        value={searchParams.get("sort") ?? "newest"}
        onChange={(e) => updateParam("sort", e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </Select>
      <Button type="submit" className="shrink-0">
        <Search className="h-4 w-4" /> Search
      </Button>
    </form>
  );
}
