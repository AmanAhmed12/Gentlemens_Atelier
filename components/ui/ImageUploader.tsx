"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { apiFetch } from "@/lib/apiFetch";

export function ImageUploader({
  value,
  onChange,
  max = 1,
  label,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { show } = useToast();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = max - value.length;
    const selected = Array.from(files).slice(0, remaining);
    if (selected.length === 0) {
      show(`You can upload up to ${max} image(s)`, "error");
      return;
    }

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of selected) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await apiFetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          show(data.error ?? "Upload failed", "error");
          continue;
        }
        uploaded.push(data.url);
      }
      if (uploaded.length > 0) {
        show(uploaded.length > 1 ? `${uploaded.length} images uploaded` : "Image uploaded", "success");
        onChange([...value, ...uploaded]);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {label && <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{label}</p>}
      <div className="flex flex-wrap gap-3">
        {value.map((url, idx) => (
          <div key={url + idx} className="relative h-24 w-24 overflow-hidden rounded-xl border border-white/10">
            <Image src={url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== idx))}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-burgundy"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/20 text-muted transition hover:border-gold/50 hover:text-gold-light"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            <span className="text-xs">{uploading ? "Uploading" : "Upload"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={max > 1}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
