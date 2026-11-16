"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/components/providers/AuthProvider";

interface Profile {
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
}

export default function AccountPage() {
  const { show } = useToast();
  const { refresh } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    apiFetch("/api/account")
      .then((res) => res.json())
      .then((data) => setProfile(data.profile));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const res = await apiFetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone ?? "",
          avatarUrl: profile.avatarUrl ?? undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        show(data.error ?? "Could not update profile", "error");
        return;
      }
      await refresh();
      show("Profile updated", "success");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setChangingPassword(true);
    try {
      const res = await apiFetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords),
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.error ?? "Could not change password", "error");
        return;
      }
      show("Password changed", "success");
      setPasswords({ currentPassword: "", newPassword: "" });
    } finally {
      setChangingPassword(false);
    }
  }

  if (!profile) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted">Loading profile…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-foreground">My Account</h1>
        <Link href="/account/orders" className="text-sm text-gold-light hover:underline">
          View Order History &rarr;
        </Link>
      </div>

      <GlassCard strong className="mt-8">
        <h2 className="font-display text-lg text-foreground">Profile</h2>
        <form onSubmit={handleSave} className="mt-5 flex flex-col gap-4">
          <ImageUploader
            label="Avatar"
            value={profile.avatarUrl ? [profile.avatarUrl] : []}
            onChange={(urls) => setProfile({ ...profile, avatarUrl: urls[0] ?? null })}
            max={1}
          />
          <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <Input label="Email" value={profile.email} disabled />
          <Input
            label="Phone"
            value={profile.phone ?? ""}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
          <Button type="submit" loading={saving} className="mt-2 self-start">
            Save Changes
          </Button>
        </form>
      </GlassCard>

      <GlassCard className="mt-6">
        <h2 className="font-display text-lg text-foreground">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="mt-5 flex flex-col gap-4">
          <Input
            label="Current Password"
            type="password"
            required
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
          />
          <Input
            label="New Password"
            type="password"
            required
            minLength={8}
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          />
          <Button type="submit" variant="secondary" loading={changingPassword} className="mt-2 self-start">
            Update Password
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
