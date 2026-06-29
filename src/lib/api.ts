const API_BASE_URL = "/api/v1";

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

function clearAuth() {
  removeToken();
  document.cookie = "auth_token=; path=/; max-age=0";
  localStorage.removeItem("user_role");
}

function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("auth_token");
}

async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  const authToken = token ?? (await getToken());

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new ApiError("You are offline. Please check your internet connection.", 0);
  }

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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
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
      if (response.status === 401) {
        clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
        throw new ApiError("Session expired. Please log in again.", 401);
      }
      throw new ApiError(data.error || data.message || "Request failed", response.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", 408);
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new ApiError("You are offline. Please check your internet connection.", 0);
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
  getToken,
  setToken,
  removeToken,
  clearAuth,
  isAuthenticated,

  // Password Reset
  sendPasswordResetLink: (email: string) =>
    apiRequest<ApiResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, email: string, password: string) =>
    apiRequest<ApiResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, email, password, password_confirmation: password }),
    }),

  // Auth
  login: async (email: string, password: string) => {
    const result = await apiRequest<ApiResponse & { token: string; user: UserData }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    document.cookie = `auth_token=${result.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; ${location.protocol === 'https:' ? 'Secure' : ''}`;
    return result;
  },

  register: (fullName: string, email: string, password: string) =>
    apiRequest<ApiResponse & { token: string; verification_url?: string; requires_verification?: boolean; user: UserData }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name: fullName, email, password, password_confirmation: password }),
    }),

  logout: async () => {
    try {
      await apiRequest<ApiResponse>("/auth/logout", { method: "POST" });
    } finally {
      removeToken();
      document.cookie = "auth_token=; path=/; max-age=0";
      localStorage.removeItem("user_role");
    }
  },

  getUser: () =>
    apiRequest<ApiResponse & { user: UserData }>("/auth/user"),

  sendVerificationEmail: () =>
    apiRequest<ApiResponse & { url?: string }>("/auth/email/verify/send", { method: "POST" }),

  verifyEmail: (id: string, hash: string, expires: string, signature: string) =>
    apiRequest<ApiResponse>(`/auth/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`),

  resendVerificationEmail: () =>
    apiRequest<ApiResponse & { url?: string }>("/auth/email/verify/resend", { method: "POST" }),

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

  // Requirements
  getRequirementQuestions: (serviceSlug: string) =>
    apiRequest<ApiResponse & { data: RequirementQuestionData[] }>(`/services/${serviceSlug}/requirements/questions`),

  saveRequirementResponses: (data: { service_order_id?: string; responses: RequirementResponsePayload[] }) =>
    apiRequest<ApiResponse & { data: { id: string } }>("/requirements/responses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getRequirementResponses: (orderId: string) =>
    apiRequest<ApiResponse & { data: RequirementResponseData[] }>(`/requirements/responses/${orderId}`),

  getProjectTypes: (serviceSlug: string) =>
    apiRequest<ApiResponse & { data: ProjectTypeSummaryData[] }>(`/services/${serviceSlug}/project-types`),

  // Proposals
  getProposals: (status?: string) =>
    apiRequest<ApiResponse & { data: ProposalListItemData[] }>(
      `/proposals${status ? `?status=${status}` : ""}`
    ),

  getProposal: (id: string) =>
    apiRequest<ApiResponse & { data: ProposalDetailData }>(`/proposals/${id}`),

  createProposal: (data: CreateProposalRequest) =>
    apiRequest<ApiResponse & { data: { id: string; proposal_number: string; status: string; total_ngn: number } }>(
      "/proposals/create-from-order",
      { method: "POST", body: JSON.stringify(data) }
    ),

  updateProposalStatus: (id: string, status: string) =>
    apiRequest<ApiResponse & { data: { status: string } }>(`/proposals/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Discovery Calls
  requestDiscoveryCall: (data: RequestDiscoveryCallPayload) =>
    apiRequest<ApiResponse & { data: { id: string; status: string } }>("/discovery-calls", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMyDiscoveryCalls: () =>
    apiRequest<ApiResponse & { data: DiscoveryCallData[] }>("/discovery-calls"),

  // Notifications
  getNotifications: () =>
    apiRequest<ApiResponse & { data: NotificationData[] }>("/notifications"),

  getUnreadNotificationCount: () =>
    apiRequest<ApiResponse & { data: { count: number } }>("/notifications/unread-count"),

  markNotificationRead: (id: string) =>
    apiRequest<ApiResponse>(`/notifications/${id}/read`, { method: "PATCH" }),

  markAllNotificationsRead: () =>
    apiRequest<ApiResponse>("/notifications/mark-all-read", { method: "POST" }),

  // Admin
  getAdminDashboard: () =>
    apiRequest<ApiResponse & { data: AdminDashboardData }>("/admin/dashboard"),

  getAdminOrders: (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    const qs = params.toString();
    return apiRequest<ApiResponse & { data: PaginatedOrdersData }>(`/admin/orders${qs ? `?${qs}` : ""}`);
  },

  updateOrderStatus: (id: string, status: string) =>
    apiRequest<ApiResponse & { data: { status: string } }>(`/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  assignTeamMember: (orderId: string, teamMemberId: string, role: string) =>
    apiRequest<ApiResponse & { data: unknown }>(`/admin/orders/${orderId}/assign-team`, {
      method: "POST",
      body: JSON.stringify({ team_member_id: teamMemberId, role }),
    }),

  unassignTeamMember: (assignmentId: string) =>
    apiRequest<ApiResponse>(`/admin/team-assignments/${assignmentId}/unassign`, { method: "POST" }),

  getTeamMembers: () =>
    apiRequest<ApiResponse & { data: TeamMemberData[] }>("/admin/team-members"),

  createTeamMember: (data: { user_id: string; role_slug: string; title?: string }) =>
    apiRequest<ApiResponse & { data: unknown }>("/admin/team-members", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAdminDiscoveryCalls: () =>
    apiRequest<ApiResponse & { data: DiscoveryCallAdminData[] }>("/admin/discovery-calls"),

  updateDiscoveryCall: (id: string, data: { status: string; meeting_link?: string; admin_notes?: string }) =>
    apiRequest<ApiResponse>(`/admin/discovery-calls/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getRequirementQuestionsAdmin: () =>
    apiRequest<ApiResponse & { data: RequirementQuestionData[] }>("/admin/requirement-questions"),

  createRequirementQuestion: (data: {
    question_key: string;
    question: string;
    type: string;
    options?: string[];
    service_id?: string;
    project_type_id?: string;
  }) =>
    apiRequest<ApiResponse & { data: unknown }>("/admin/requirement-questions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createService: (data: {
    title: string;
    slug: string;
    icon: string;
    short_description: string;
    starting_price_ngn: number;
    starting_price_usd?: number;
  }) =>
    apiRequest<ApiResponse & { data: unknown }>("/admin/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateService: (id: string, data: Partial<{
    title: string;
    slug: string;
    icon: string;
    short_description: string;
    description: string;
    starting_price_ngn: number;
    estimated_delivery: string;
    features: string[];
    is_active: boolean;
  }>) =>
    apiRequest<ApiResponse>(`/admin/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  createProjectType: (data: {
    service_id: string;
    title: string;
    slug: string;
    starting_price_ngn: number;
    icon?: string;
  }) =>
    apiRequest<ApiResponse & { data: unknown }>("/admin/project-types", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createPackage: (data: {
    project_type_id: string;
    name: string;
    price_ngn: number;
    features?: string[];
  }) =>
    apiRequest<ApiResponse & { data: unknown }>("/admin/packages", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createAddOn: (data: {
    name: string;
    slug: string;
    price_ngn: number;
    category?: string;
  }) =>
    apiRequest<ApiResponse & { data: unknown }>("/admin/add-ons", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Types
export interface ApiResponse {
  success: boolean;
  message?: string;
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
  teamAssignments?: { id: string; role: string; teamMember: { id: string; title: string; avatar_url: string | null; user: { profile: { full_name: string | null; avatar_url: string | null } | null } } }[];
  created_at: string;
}

// Phase 2/3 Types
export interface RequirementQuestionData {
  id: string;
  question_key: string;
  question: string;
  type: "text" | "textarea" | "select" | "boolean" | "multi_select" | "number" | "url" | "file";
  options: string[] | null;
  is_required: boolean;
  placeholder: string | null;
  sort_order: number;
  conditional_on: string | null;
  conditional_value: string | null;
  service_id: string | null;
  project_type_id: string | null;
  service?: { title: string } | null;
  projectType?: { title: string } | null;
}

export interface RequirementResponsePayload {
  question_id: string;
  value: string | string[] | boolean | number;
}

export interface RequirementResponseData {
  id: string;
  service_order_id: string;
  question_id: string;
  question: RequirementQuestionData;
  value: string | string[] | boolean | number;
}

export interface ProposalListItemData {
  id: string;
  proposal_number: string;
  service: string;
  project: string;
  status: string;
  total_ngn: number;
  version: number;
  valid_until: string | null;
  created_at: string;
}

export interface ProposalDetailData {
  id: string;
  proposal_number: string;
  service_order_id: string;
  service: { title: string; slug: string };
  projectType: { title: string; slug: string };
  package: { name: string; slug: string; features: string[] | null };
  status: string;
  scope_of_work: string;
  deliverables: string[];
  included_features: string[] | null;
  excluded_items: string[] | null;
  timeline_description: string;
  milestones: { name: string; description: string; due_date?: string; amount_ngn: number }[] | null;
  payment_schedule: { event: string; percentage: number; amount_ngn: number }[] | null;
  total_ngn: number;
  total_usd: number;
  terms_and_conditions: string[] | null;
  valid_until: string | null;
  version: number;
  created_at: string;
  versions: { id: string; version: number; changes_description: string; created_by: number; created_at: string }[];
  serviceOrder?: ServiceOrderDetailData;
  contract?: unknown;
}

export interface CreateProposalRequest {
  service_order_id: string;
  scope_of_work: string;
  deliverables: string[];
  timeline_description: string;
  total_ngn: number;
  valid_until?: string;
  included_features?: string[];
  excluded_items?: string[];
  milestones?: { name: string; description: string; due_date?: string; amount_ngn: number }[];
  payment_schedule?: { event: string; percentage: number; amount_ngn: number }[];
  terms_and_conditions?: string[];
  total_usd?: number;
}

export interface RequestDiscoveryCallPayload {
  service_order_id?: string;
  preferred_date: string;
  preferred_time: string;
  timezone?: string;
  meeting_type: "google_meet" | "zoom" | "phone";
  project_summary?: string;
}

export interface DiscoveryCallData {
  id: string;
  preferred_date: string;
  preferred_time: string;
  meeting_type: string;
  meeting_link: string | null;
  status: string;
  created_at: string;
}

export interface DiscoveryCallAdminData extends DiscoveryCallData {
  client: string;
  email: string;
  project_summary: string | null;
}

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  body: string;
  action_url: string | null;
  action_text: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AdminDashboardData {
  stats: {
    total_orders: number;
    active_projects: number;
    pending_proposals: number;
    pending_calls: number;
    revenue_ngn: number;
    leads: number;
  };
  orders_by_status: Record<string, number>;
  recent_orders: {
    id: string;
    order_number: string;
    service: string;
    project: string;
    status: string;
    payment_status: string;
    total_ngn: number;
    client: string;
    created_at: string;
  }[];
}

export interface PaginatedOrdersData {
  data: {
    id: string;
    order_number: string;
    service: { title: string };
    projectType: { title: string };
    package: { name: string };
    status: string;
    payment_status: string;
    total_ngn: number;
    total_usd: number;
    project_name: string | null;
    user: { profile: { full_name: string | null } | null };
    created_at: string;
  }[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  title: string | null;
  role_slug: string;
  avatar_url: string | null;
  is_available: boolean;
}
