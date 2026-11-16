import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { productSchema } from "@/lib/validation";
import { uniqueSlug } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const search = params.get("search")?.trim();
  const category = params.get("category") ?? undefined;
  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");
  const sort = params.get("sort") ?? "newest";
  const mine = params.get("mine") === "true";
  const showAll = params.get("all") === "true";
  const page = Math.max(1, Number(params.get("page") ?? "1"));
  const pageSize = Math.min(24, Math.max(1, Number(params.get("pageSize") ?? "12")));

  const where: Prisma.ProductWhereInput = {};

  if (mine) {
    const user = await requireRole(["VENDOR"]);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: user.sub } });
    if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
    where.vendorId = vendor.id;
  } else if (showAll) {
    const user = await requireRole(["ADMIN"]);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else {
    where.isActive = true;
    where.vendor = { status: "APPROVED" };
  }

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }
  if (category) {
    where.category = { slug: category };
  }
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: new Prisma.Decimal(minPrice) } : {}),
      ...(maxPrice ? { lte: new Prisma.Decimal(maxPrice) } : {}),
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true, vendor: { select: { storeName: true, id: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["VENDOR", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  let vendorId: string;
  if (user.role === "ADMIN") {
    if (!parsed.data.vendorId) {
      return NextResponse.json({ error: "A vendor must be selected" }, { status: 400 });
    }
    const vendor = await prisma.vendorProfile.findUnique({ where: { id: parsed.data.vendorId } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    vendorId = vendor.id;
  } else {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: user.sub } });
    if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
    if (vendor.status !== "APPROVED") {
      return NextResponse.json({ error: "Your vendor account is not approved yet" }, { status: 403 });
    }
    vendorId = vendor.id;
  }

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      slug: uniqueSlug(parsed.data.title),
      vendorId,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
