"use client";

/**
 * Browser-side calls to Django through the same-origin /api proxy.
 * Session cookie + CSRF token make writes safe; errors come back in one shape.
 */

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[] | string> | undefined;

  constructor(status: number, message: string, errors?: Record<string, string[] | string>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

let csrfPromise: Promise<void> | null = null;
async function ensureCsrf() {
  if (readCookie("csrftoken")) return;
  csrfPromise ??= fetch("/api/auth/csrf", { credentials: "same-origin" }).then(() => undefined);
  await csrfPromise;
  csrfPromise = null;
}

const FRIENDLY: Record<number, string> = {
  401: "Tizimga qaytadan kiring.",
  403: "Bu amal uchun ruxsat yo‘q.",
  404: "Ma’lumot topilmadi.",
  413: "Fayl hajmi juda katta.",
  429: "Juda ko‘p urinish. Birozdan so‘ng qayta urinib ko‘ring.",
};

export async function apiFetch<T = unknown>(
  path: string,
  init: Omit<RequestInit, "body"> & { body?: unknown; form?: FormData } = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  let body: BodyInit | undefined;

  if (method !== "GET") {
    await ensureCsrf();
    headers.set("X-CSRFToken", readCookie("csrftoken"));
    if (init.form) body = init.form;
    else if (init.body !== undefined) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(init.body);
    }
  }

  let res: Response;
  try {
    res = await fetch(`/api/${path.replace(/^\//, "")}`, { ...init, method, headers, body, credentials: "same-origin" });
  } catch {
    throw new ApiError(0, "Server bilan aloqa yo‘q. Internetni tekshiring.");
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = (data && typeof data.detail === "string" && data.detail) || FRIENDLY[res.status] || "Xatolik yuz berdi.";
    throw new ApiError(res.status, detail, data?.errors);
  }
  return data as T;
}

/** First error message for a form field, if any. */
export function fieldError(error: unknown, field: string): string | undefined {
  if (!(error instanceof ApiError) || !error.errors) return undefined;
  const value = error.errors[field];
  return Array.isArray(value) ? value[0] : value;
}
