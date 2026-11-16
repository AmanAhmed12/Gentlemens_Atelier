"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { useToast } from "@/components/providers/ToastProvider";

interface VendorProfile {
  storeName: string;
  description: string | null;
  logoUrl: string | null;
  status: string;
  rejectionReason: string | null;
  businessRegNo: string;
}

export default function VendorProfilePage() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    apiFetch("/api/vendors/me")
      .then((res) => res.json())
      .then((data) => setProfile(data.vendor));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const res = await apiFetch("/api/vendors/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: profile.storeName,
          description: profile.description ?? "",
          logoUrl: profile.logoUrl ?? undefined,
        }),
      });
      if (!res.ok) {
        show("Could not update store profile", "error");
        return;
      }
      show("Store profile updated", "success");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return <p className="text-muted">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-foreground">Store Profile</h1>
        <Badge status={profile.status}>{profile.status}</Badge>
      </div>

      {profile.status === "REJECTED" && profile.rejectionReason && (
        <GlassCard className="mt-4 border-burgundy/40 text-sm text-foreground/90">
          Rejection reason: {profile.rejectionReason}
        </GlassCard>
      )}

      <GlassCard strong className="mt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ImageUploader
            label="Store Logo"
            value={profile.logoUrl ? [profile.logoUrl] : []}
            onChange={(urls) => setProfile({ ...profile, logoUrl: urls[0] ?? null })}
            max={1}
          />
          <Input label="Store Name" value={profile.storeName} onChange={(e) => setProfile({ ...profile, storeName: e.target.value })} />
          <Input label="Business Registration No." value={profile.businessRegNo} disabled />
          <Textarea
            label="Description"
            value={profile.description ?? ""}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
          />
          <Button type="submit" loading={saving} className="self-start">
            Save Changes
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
