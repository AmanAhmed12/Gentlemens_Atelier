import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../lib/utils";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@gentlemensatelier.com" },
    update: {},
    create: {
      name: "Platform Admin",
      email: "admin@gentlemensatelier.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`Admin ready: ${admin.email} / Admin@12345`);

  const categoryNames = ["Suits", "Shirts", "Trousers", "Footwear", "Accessories", "New Arrivals"];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { name, slug: slugify(name) },
      }),
    ),
  );
  console.log(`Categories ready: ${categories.length}`);

  const vendorPassword = await bcrypt.hash("Vendor@12345", 10);
  const vendorUser = await prisma.user.upsert({
    where: { email: "vendor@gentlemensatelier.com" },
    update: {},
    create: {
      name: "Savile Row Tailors",
      email: "vendor@gentlemensatelier.com",
      passwordHash: vendorPassword,
      role: "VENDOR",
    },
  });

  const vendorProfile = await prisma.vendorProfile.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      storeName: "Savile Row Tailors",
      businessRegNo: "BRN-00123",
      description: "Classic and contemporary menswear, tailored to perfection.",
      status: "APPROVED",
    },
  });
  console.log(`Vendor ready: ${vendorUser.email} / Vendor@12345`);

  const sampleProducts = [
    {
      title: "Charcoal Wool Three-Piece Suit",
      description: "A timeless charcoal wool suit with a tailored fit, perfect for formal occasions.",
      price: 45000,
      stockQuantity: 12,
      category: "Suits",
      isFeatured: true,
    },
    {
      title: "Classic White Oxford Shirt",
      description: "Premium cotton oxford shirt with a crisp collar and tailored silhouette.",
      price: 6500,
      stockQuantity: 40,
      category: "Shirts",
      isFeatured: true,
    },
    {
      title: "Slim Fit Navy Trousers",
      description: "Versatile navy trousers crafted from breathable wool-blend fabric.",
      price: 8200,
      stockQuantity: 30,
      category: "Trousers",
      isFeatured: false,
    },
    {
      title: "Oxford Leather Brogues",
      description: "Hand-finished leather brogues with a durable sole for everyday elegance.",
      price: 15800,
      stockQuantity: 18,
      category: "Footwear",
      isFeatured: true,
    },
    {
      title: "Silk Paisley Necktie",
      description: "A rich paisley silk necktie that adds character to any formal outfit.",
      price: 3200,
      stockQuantity: 50,
      category: "Accessories",
      isFeatured: false,
    },
  ];

  for (const item of sampleProducts) {
    const category = categories.find((c) => c.name === item.category);
    if (!category) continue;
    const slug = slugify(item.title);
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        vendorId: vendorProfile.id,
        categoryId: category.id,
        title: item.title,
        slug,
        description: item.description,
        price: item.price,
        stockQuantity: item.stockQuantity,
        images: ["https://res.cloudinary.com/demo/image/upload/v1690000000/sample.jpg"],
        isFeatured: item.isFeatured,
      },
    });
  }
  console.log(`Sample products ready: ${sampleProducts.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
