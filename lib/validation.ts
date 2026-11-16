import { z } from "zod";

const optionalString = (schema: z.ZodString) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["CUSTOMER", "VENDOR"]),
  storeName: optionalString(z.string().min(2).max(100)),
  businessRegNo: optionalString(z.string().min(2).max(50)),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().max(20).optional(),
  avatarUrl: optionalString(z.string().url()),
});

export const vendorProfileUpdateSchema = z.object({
  storeName: optionalString(z.string().min(2).max(100)),
  description: z.string().max(1000).optional(),
  logoUrl: optionalString(z.string().url()),
});

export const adminCreateUserSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["CUSTOMER", "VENDOR"]),
  storeName: optionalString(z.string().min(2).max(100)),
  businessRegNo: optionalString(z.string().min(2).max(50)),
});

export const adminUpdateUserSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(100).optional(),
  isSuspended: z.boolean().optional(),
});

export const vendorStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "SUSPENDED"]),
  rejectionReason: z.string().max(300).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(60),
  imageUrl: optionalString(z.string().url()),
});

export const productSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(10).max(3000),
  price: z.coerce.number().positive(),
  stockQuantity: z.coerce.number().int().min(0),
  categoryId: z.string().min(1),
  images: z.array(z.string().url()).min(1).max(8),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  vendorId: optionalString(z.string().min(1)),
});

export const productUpdateSchema = productSchema.partial();

export const cartAddSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(50).default(1),
});

export const cartUpdateSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(50),
});

export const checkoutSchema = z.object({
  shippingName: z.string().min(2).max(100),
  shippingPhone: z.string().min(7).max(20),
  shippingAddress: z.string().min(5).max(300),
  shippingCity: z.string().min(2).max(100),
});

export const orderItemStatusSchema = z.object({
  fulfillmentStatus: z.enum(["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(1000),
});
