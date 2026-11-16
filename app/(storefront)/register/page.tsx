"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const { show } = useToast();
  const [role, setRole] = useState<"CUSTOMER" | "VENDOR">("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    businessRegNo: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      show("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.error ?? "Registration failed", "error");
        return;
      }
      await refresh();
      show(
        role === "VENDOR" ? "Vendor account created — awaiting admin approval" : "Account created successfully",
        "success",
      );
      router.push(role === "VENDOR" ? "/vendor" : "/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <GlassCard strong>
          <h1 className="font-display text-2xl text-foreground">Join The Atelier</h1>
          <p className="mt-1 text-sm text-muted">Create a customer or vendor account.</p>

          <div className="mt-5 flex gap-2 rounded-full bg-white/5 p-1">
            {(["CUSTOMER", "VENDOR"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "flex-1 rounded-full py-2 text-sm font-medium transition",
                  role === r ? "bg-gold text-[#1a1408]" : "text-muted hover:text-foreground",
                )}
              >
                {r === "CUSTOMER" ? "Customer" : "Vendor"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Input label="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <Input
                label="Confirm Password"
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>

            {role === "VENDOR" && (
              <>
                <Input
                  label="Store Name"
                  required
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                />
                <Input
                  label="Business Registration No."
                  required
                  value={form.businessRegNo}
                  onChange={(e) => setForm({ ...form, businessRegNo: e.target.value })}
                />
              </>
            )}

            <Button type="submit" loading={loading} className="mt-2">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-gold-light hover:underline">
              Log in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
