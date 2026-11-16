import { apiFetch } from "@/lib/apiFetch";

type ToastFn = (message: string, variant?: "success" | "error" | "info") => void;

export async function mutate(
  url: string,
  init: RequestInit,
  show: ToastFn,
  successMessage: string,
  fallbackError = "Something went wrong, please try again",
) {
  try {
    const res = await apiFetch(url, init);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      show(data.error ?? fallbackError, "error");
      return { ok: false as const, data };
    }
    show(successMessage, "success");
    return { ok: true as const, data };
  } catch {
    show(fallbackError, "error");
    return { ok: false as const, data: null };
  }
}
