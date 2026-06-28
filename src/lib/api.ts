const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

interface ApiOptions extends RequestInit {
  token?: string | null;
}

async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
}

function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
}

async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  const authToken = token ?? (await getToken());

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/pdf")) {
    return response as unknown as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || "Request failed", response.status, data);
  }

  return data;
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
  getToken,
  setToken,
  removeToken,

  // Auth
  login: (email: string, password: string) =>
    apiRequest<ApiResponse & { token: string; user: UserData }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (fullName: string, email: string, password: string) =>
    apiRequest<ApiResponse & { token: string; user: UserData }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name: fullName, email, password, password_confirmation: password }),
    }),

  logout: () =>
    apiRequest<ApiResponse>("/auth/logout", { method: "POST" }),

  getUser: () =>
    apiRequest<ApiResponse & { user: UserData }>("/auth/user"),

  // Courses
  getCourses: () =>
    apiRequest<ApiResponse & { courses: CourseData[] }>("/courses"),

  getCourse: (slug: string) =>
    apiRequest<ApiResponse & { course: CourseData }>(`/courses/${slug}`),

  getCoursesByStack: (stackId: string) =>
    apiRequest<ApiResponse & { courses: CourseData[] }>(`/courses/stack/${stackId}`),

  // Checkout
  checkout: (data: CheckoutRequest) =>
    apiRequest<ApiResponse & { reference: string; authorization_url: string; gateway: string }>("/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Enrollments
  enrollFree: (courseId: string, tierId?: string, billing?: Record<string, unknown>) =>
    apiRequest<ApiResponse & { enrollment_id: string; enrollment: EnrollmentData }>("/enrollments", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId, tier_id: tierId, billing }),
    }),

  getEnrollment: (id: string) =>
    apiRequest<ApiResponse & { enrollment: EnrollmentData; course: CourseData; transaction: TransactionData; invoice: InvoiceData }>(
      `/enrollments?id=${id}`
    ),

  // Payments
  initializePayment: (data: PaymentInitRequest) =>
    apiRequest<ApiResponse & { reference: string; authorization_url: string }>("/payments/initialize", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyPayment: (reference: string, gateway: string) =>
    apiRequest<ApiResponse & { status: string; transaction: TransactionData; enrollment?: EnrollmentData; invoice?: InvoiceData; receipt?: ReceiptData }>(
      `/payments/verify?reference=${reference}&gateway=${gateway}`
    ),

  // Coupons
  validateCoupon: (code: string, courseId?: string, amount?: number) =>
    apiRequest<ApiCouponResponse>("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, course_id: courseId, amount }),
    }),

  // Users / Profile
  getUserProfile: (id: string) =>
    apiRequest<ApiResponse & { profile: ProfileData; enrollments: EnrollmentData[] }>(`/users?id=${id}`),

  updateProfile: (data: Partial<ProfileUpdateData>) =>
    apiRequest<ApiResponse & { profile: ProfileData }>("/users", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getDashboard: () =>
    apiRequest<ApiResponse & { profile: ProfileData; enrollments: EnrollmentData[] }>("/users/dashboard"),

  // Invoice
  getInvoice: (id: string) =>
    apiRequest<ApiResponse & { invoice: InvoiceData }>(`/invoice?id=${id}`),

  downloadInvoicePdf: async (id: string) => {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/invoice/pdf?id=${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    });
    if (!response.ok) throw new ApiError("Failed to download PDF", response.status);
    return response.blob();
  },

  // Receipt
  getReceipt: (id: string) =>
    apiRequest<ApiResponse & { receipt: ReceiptData }>(`/receipt?id=${id}`),

  downloadReceiptPdf: async (id: string) => {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/receipt/pdf?id=${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    });
    if (!response.ok) throw new ApiError("Failed to download PDF", response.status);
    return response.blob();
  },

  // Contact
  sendContact: (data: ContactData) =>
    apiRequest<ApiResponse>("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  sendQuoteRequest: (data: QuoteData) =>
    apiRequest<ApiResponse>("/request-quote", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Services
  getServices: () =>
    apiRequest<ApiResponse & { data: ServiceData[] }>("/services"),

  getService: (slug: string) =>
    apiRequest<ApiResponse & { data: ServiceDetailData }>(`/services/${slug}`),

  getProjectType: (serviceSlug: string, projectSlug: string) =>
    apiRequest<ApiResponse & { data: ProjectDetailData }>(`/services/${serviceSlug}/project-types/${projectSlug}`),

  getAddOns: () =>
    apiRequest<ApiResponse & { data: AddOnCategoryData[] }>("/add-ons"),

  // Service Orders
  createServiceQuote: (data: ServiceQuoteRequest) =>
    apiRequest<ApiResponse & { data: ServiceQuoteResponse }>("/service-orders/quote", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  placeServiceOrder: (data: ServiceOrderRequest) =>
    apiRequest<ApiResponse & { data: ServiceOrderResponse }>("/service-orders/place", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyServicePayment: (reference: string, orderId: string) =>
    apiRequest<ApiResponse & { data: ServicePaymentVerifyResponse }>("/service-orders/verify-payment", {
      method: "POST",
      body: JSON.stringify({ reference, order_id: orderId }),
    }),

  getServiceOrders: () =>
    apiRequest<ApiResponse & { data: ServiceOrderListItem[] }>("/service-orders"),

  getServiceOrder: (id: string) =>
    apiRequest<ApiResponse & { data: ServiceOrderDetailData }>(`/service-orders/${id}`),
};

// Types
export interface ApiResponse {
  success: boolean;
  error?: string;
}

export interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

export interface CourseData {
  id: string;
  slug: string;
  stack_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  short_description: string | null;
  category: string | null;
  icon: string | null;
  thumbnail_url: string | null;
  cover_url: string | null;
  instructor_name: string | null;
  instructor_title: string | null;
  instructor_avatar: string | null;
  instructor_bio: string | null;
  instructor_experience: number;
  instructor_students: number;
  instructor_rating: number;
  duration: string | null;
  skill_level: string | null;
  language: string;
  certificate_included: boolean;
  lifetime_access: boolean;
  price_ngn: number;
  price_usd: number;
  original_price_ngn: number | null;
  original_price_usd: number | null;
  discount_percentage: number;
  currency: string;
  is_free: boolean;
  is_published: boolean;
  average_rating: number;
  total_reviews: number;
  students_enrolled: number;
  what_you_learn: string[];
  includes: string[];
  requirements: string[];
  metadata: Record<string, unknown>;
  modules: CourseModuleData[];
  pricing_tiers: PricingTierData[];
  created_at: string;
}

export interface CourseModuleData {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  lessons: LessonData[];
}

export interface LessonData {
  title: string;
  duration: string;
  is_preview?: boolean;
  is_locked?: boolean;
}

export interface PricingTierData {
  id: string;
  course_id: string;
  name: string;
  price_ngn: number;
  price_usd: number;
  description: string | null;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface EnrollmentData {
  id: string;
  user_id: string;
  course_id: string;
  tier_id: string | null;
  enrollment_number: string;
  status: string;
  progress: number;
  certificate_url: string | null;
  started_at: string;
  completed_at: string | null;
  course?: CourseData;
  created_at: string;
}

export interface TransactionData {
  id: string;
  user_id: string;
  enrollment_id: string | null;
  transaction_reference: string;
  payment_gateway: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface InvoiceData {
  id: string;
  invoice_number: string;
  user_id: string;
  enrollment_id: string | null;
  transaction_id: string | null;
  course_name: string;
  student_name: string;
  student_email: string;
  payment_gateway: string | null;
  payment_method: string | null;
  subtotal: number;
  discount_amount: number;
  discount_code: string | null;
  tax_amount: number;
  tax_rate: number;
  grand_total: number;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
}

export interface ReceiptData {
  id: string;
  receipt_number: string;
  transaction_reference: string;
  user_id: string;
  enrollment_id: string | null;
  invoice_id: string | null;
  course_name: string;
  student_name: string;
  amount: number;
  payment_gateway: string | null;
  payment_method: string | null;
  currency: string;
  status: string;
  created_at: string;
}

export interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  company: string | null;
  tax_id: string | null;
  role: string;
  bio: string | null;
  title: string | null;
}

export interface CheckoutRequest {
  course_id: string;
  tier_id?: string;
  payment_gateway: string;
  coupon_code?: string;
  billing: {
    full_name: string;
    email: string;
    phone?: string;
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    company?: string;
    tax_id?: string;
  };
}

export interface PaymentInitRequest {
  email: string;
  amount: number;
  currency?: string;
  gateway: string;
  course_id?: string;
  metadata?: Record<string, unknown>;
}

export interface ProfileUpdateData {
  full_name?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  company?: string;
  tax_id?: string;
  bio?: string;
  avatar_url?: string;
}

export interface ApiCouponResponse {
  valid: boolean;
  error?: string;
  coupon?: {
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    description?: string;
  };
}

export interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface QuoteData {
  name: string;
  email: string;
  phone: string;
  service: string;
  subService?: string;
  budget: string;
  project: string;
  timeline: string;
}

export interface ServiceData {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  short_description: string | null;
  icon: string;
  image_url: string | null;
  starting_price_ngn: number;
  starting_price_usd: number;
  estimated_delivery: string | null;
  features: string[] | null;
  project_types_count: number;
}

export interface ServiceDetailData extends ServiceData {
  description: string | null;
  cover_url: string | null;
  project_types: ProjectTypeSummaryData[];
}

export interface ProjectTypeSummaryData {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  short_description: string | null;
  icon: string | null;
  image_url: string | null;
  starting_price_ngn: number;
  starting_price_usd: number;
  estimated_timeline: string | null;
  features: string[] | null;
  technologies: string[] | null;
}

export interface ProjectDetailData extends ProjectTypeSummaryData {
  description: string | null;
  cover_url: string | null;
  deliverables: string[] | null;
  faqs: { q: string; a: string }[] | null;
  portfolio_samples: string[] | null;
  packages: PackageData[];
  service: { id: string; slug: string; title: string };
}

export interface PackageData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_ngn: number;
  price_usd: number;
  estimated_timeline: string | null;
  support_period: string | null;
  revision_count: number;
  is_recommended: boolean;
  features: string[] | null;
}

export interface AddOnCategoryData {
  category: string;
  items: AddOnItemData[];
}

export interface AddOnItemData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  price_ngn: number;
  price_usd: number;
}

export interface ServiceQuoteRequest {
  service_id: string;
  project_type_id: string;
  package_id: string;
  add_on_ids?: string[];
}

export interface ServiceQuoteResponse {
  package: { id: string; name: string; price_ngn: number; price_usd: number };
  add_ons: { id: string; name: string; price_ngn: number; price_usd: number }[];
  package_price_ngn: number;
  package_price_usd: number;
  add_ons_total_ngn: number;
  add_ons_total_usd: number;
  total_ngn: number;
  total_usd: number;
}

export interface ServiceOrderRequest {
  service_id: string;
  project_type_id: string;
  package_id: string;
  add_on_ids?: string[];
  payment_gateway: string;
  payment_type: "full" | "deposit";
  billing: {
    full_name: string;
    email: string;
    phone?: string;
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    company?: string;
  };
  project_name: string;
  project_description?: string;
  preferred_start_date?: string;
  reference_links?: string[];
}

export interface ServiceOrderResponse {
  order_id: string;
  order_number: string;
  reference: string;
  authorization_url: string;
  gateway: string;
  amount_ngn: number;
  amount_usd: number;
  payment_type: string;
}

export interface ServicePaymentVerifyResponse {
  order_id: string;
  order_number: string;
  invoice_number: string;
  status: string;
  payment_status: string;
  amount_paid_ngn: number;
  balance_ngn: number;
  total_ngn: number;
  payment_type: string;
  project_name: string;
}

export interface ServiceOrderListItem {
  id: string;
  order_number: string;
  service: string;
  project: string;
  package: string;
  total_ngn: number;
  total_usd: number;
  status: string;
  payment_status: string;
  project_name: string | null;
  created_at: string;
}

export interface ServiceOrderDetailData {
  id: string;
  order_number: string;
  service: { title: string; slug: string };
  projectType: { title: string; slug: string };
  package: { name: string; slug: string };
  total_ngn: number;
  total_usd: number;
  status: string;
  payment_status: string;
  billing_details: Record<string, unknown>;
  metadata: Record<string, unknown>;
  addOns: { id: string; name: string; price_ngn: number }[];
  invoices: unknown[];
  payments: unknown[];
  milestones: unknown[];
  created_at: string;
}
