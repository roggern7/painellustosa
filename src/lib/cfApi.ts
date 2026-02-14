import { ADMIN_TOKEN } from "@/config/adminAuth";

const API_BASE = "https://lustosasports-api.sportslustosa.workers.dev";

export function getToken(): string {
  return ADMIN_TOKEN;
}

function getHeaders(json = true): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };
  if (json) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ${res.status}: ${text}`);
  }
  return res.json();
}

export async function uploadFile(file: File): Promise<{ url: string; key: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  return handleResponse(res);
}

export async function fetchProducts(params?: {
  category?: string;
  size?: string;
  search?: string;
}): Promise<{ items: any[] }> {
  const token = getToken();
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.size) searchParams.set("size", params.size);
  if (params?.search) searchParams.set("search", params.search);

  const qs = searchParams.toString();
  const res = await fetch(`${API_BASE}/api/products${qs ? `?${qs}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(res);
}

export async function createProduct(payload: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/products`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateProduct(id: string, payload: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(res);
}
