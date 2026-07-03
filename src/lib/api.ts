const API_BASE_URL = "/api/v1";

const CSRF_COOKIE = "XSRF-TOKEN";

async function ensureCsrfCookie(): Promise<void> {
  if (typeof window === "undefined") return;
  await fetch("/sanctum/csrf-cookie", { credentials: "include" });
}

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${CSRF_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    await ensureCsrfCookie();
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers["X-XSRF-TOKEN"] = csrfToken;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/pdf")) {
      return response as unknown as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error || data.message || "Request failed", response.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", 408);
    }
    throw new ApiError("A network error occurred. Please try again.", 0);
  } finally {
    clearTimeout(timeoutId);
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const api = {
  // Services
  getServices: () =>
    apiRequest<ApiResponse & { data: ServiceData[] }>("/services"),

  getService: (slug: string) =>
    apiRequest<ApiResponse & { data: ServiceDetailData }>(`/services/${slug}`),

  getProjectType: (serviceSlug: string, projectSlug: string) =>
    apiRequest<ApiResponse & { data: ProjectDetailData }>(`/services/${serviceSlug}/project-types/${projectSlug}`),

  // Contact
  sendContact: (data: ContactData) =>
    apiRequest<ApiResponse>("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Quote
  sendQuoteRequest: (data: QuoteData) =>
    apiRequest<ApiResponse>("/request-quote", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Discovery Call
  requestDiscoveryCall: (data: RequestDiscoveryCallPayload) =>
    apiRequest<ApiResponse & { data: { id: string; status: string } }>("/discovery-calls", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Types ─────────────────────────────────────────────────

export interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export interface ServiceData {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  short_description: string;
  description?: string | null;
  icon: string;
  gradient: string;
  image_url?: string | null;
  starting_price_ngn?: number;
  starting_price_usd?: number;
  estimated_delivery?: string | null;
  features?: string[] | null;
  project_types_count?: number;
  duration: string;
  level: string;
  featured: boolean;
  order: number;
  meta_title?: string;
  meta_description?: string;
}

export interface ServiceDetailData extends ServiceData {
  subtitle: string;
  starting_price_ngn: number;
  estimated_delivery?: string;
  features: string[];
  project_types: ProjectTypeSummaryData[];
}

export interface ProjectTypeSummaryData {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  icon: string;
  starting_price_ngn: number;
  estimated_timeline?: string;
}

export interface PackageData {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_ngn: number;
  price_usd: number;
  is_recommended: boolean;
  estimated_timeline: string;
  features: string[];
  revision_count: string;
  support_period: string;
}

export interface ProjectDetailData {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  price_range: string;
  delivery_timeframe: string;
  revisions: string;
  icon: string;
  gradient: string;
  skills: string[];
  features: string[];
  process_steps: { step: string; title: string; desc: string }[];
  packages: PackageData[];
  service: { title: string; slug: string };
  faqs: { q: string; a: string }[];
  starting_price_ngn: number;
  estimated_timeline: string;
  portfolio_samples?: string[];
  technologies?: string[];
  deliverables?: string[];
  project_types?: ProjectTypeSummaryData[];
}

export interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface QuoteData {
  full_name: string;
  email: string;
  phone: string;
  company?: string;
  project_type: string;
  budget_range: string;
  timeline: string;
  description: string;
}

export interface RequestDiscoveryCallPayload {
  full_name: string;
  email: string;
  phone: string;
  company?: string;
  preferred_date: string;
  preferred_time: string;
  notes?: string;
  service_interest?: string;
}
