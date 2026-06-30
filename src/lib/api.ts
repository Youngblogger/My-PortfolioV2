const API_BASE_URL = "/api/v1";

const CSRF_COOKIE = "XSRF-TOKEN";

// Fetches the CSRF cookie required by Sanctum for state-changing requests
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
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new ApiError("You are offline. Please check your internet connection.", 0);
  }

  const method = (options.method || "GET").toUpperCase();

  // Ensure CSRF cookie for state-changing requests
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

  // Add CSRF token header for state-changing requests (required by Sanctum SPA auth)
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
      if (response.status === 401 && typeof window !== "undefined") {
        if (!window.location.pathname.startsWith("/auth/login")) {
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

function isAuthenticated(): boolean {
  // Session-based auth — cookies are HttpOnly, so we can't check JS storage.
  // The auth state is verified server-side via /auth/user endpoint.
  return true; // optimistic; real check happens in layout/page guards
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
  isAuthenticated,

  ensureCsrfCookie,

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
  login: async (email: string, password: string, remember = false) => {
    await ensureCsrfCookie();
    const result = await apiRequest<ApiResponse & { user: UserData }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, remember }),
    });
    return result;
  },

  register: (fullName: string, email: string, password: string) =>
    apiRequest<ApiResponse & { verification_url?: string; requires_verification?: boolean; user: UserData }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name: fullName, email, password, password_confirmation: password }),
    }),

  logout: async () => {
    await apiRequest<ApiResponse>("/auth/logout", { method: "POST" });
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
    const response = await fetch(`${API_BASE_URL}/invoice/pdf?id=${id}`, {
      credentials: "include",
    });
    if (!response.ok) throw new ApiError("Failed to download PDF", response.status);
    return response.blob();
  },

  // Receipt
  getReceipt: (id: string) =>
    apiRequest<ApiResponse & { receipt: ReceiptData }>(`/receipt?id=${id}`),

  downloadReceiptPdf: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/receipt/pdf?id=${id}`, {
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

  // Workspace
  getServiceOrderWorkspace: (id: string) =>
    apiRequest<ApiResponse & { data: WorkspaceDataResponse }>(`/service-orders/${id}/workspace`),

  getServiceOrderMilestones: (id: string) =>
    apiRequest<ApiResponse & { data: MilestonesResponseData }>(`/service-orders/${id}/milestones`),

  getServiceOrderActivity: (id: string) =>
    apiRequest<ApiResponse & { data: PaginatedActivityData }>(`/service-orders/${id}/activity`),

  downloadServiceInvoice: (id: string, invoiceId: string) =>
    apiRequest<ApiResponse & { data: InvoiceDownloadData }>(`/service-orders/${id}/invoice/${invoiceId}`),

  downloadServiceReceipt: (id: string, receiptId: string) =>
    apiRequest<ApiResponse & { data: ReceiptDownloadData }>(`/service-orders/${id}/receipt/${receiptId}`),

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

  reviewRequirements: (orderId: string) =>
    apiRequest<ApiResponse & { data: { project_status: string } }>(`/admin/orders/${orderId}/review-requirements`, {
      method: "POST",
    }),

  kickoffProject: (orderId: string) =>
    apiRequest<ApiResponse & { data: { project_status: string } }>(`/admin/orders/${orderId}/kickoff`, {
      method: "POST",
    }),

  updateMilestone: (milestoneId: string, status: string, completionNotes?: string) =>
    apiRequest<ApiResponse & { data: unknown }>(`/admin/milestones/${milestoneId}`, {
      method: "PATCH",
      body: JSON.stringify({ status, completion_notes: completionNotes }),
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

  // ─── Project Workspace API ───────────────────────────────────

  getAdminProjects: (params?: {
    status?: string;
    priority?: string;
    search?: string;
    sort?: string;
    order?: string;
    per_page?: number;
    page?: number;
    date_from?: string;
    date_to?: string;
  }) => {
    const p = new URLSearchParams();
    if (params?.status) p.set("status", params.status);
    if (params?.priority) p.set("priority", params.priority);
    if (params?.search) p.set("search", params.search);
    if (params?.sort) p.set("sort", params.sort);
    if (params?.order) p.set("order", params.order);
    if (params?.per_page) p.set("per_page", String(params.per_page));
    if (params?.page) p.set("page", String(params.page));
    if (params?.date_from) p.set("date_from", params.date_from);
    if (params?.date_to) p.set("date_to", params.date_to);
    const qs = p.toString();
    return apiRequest<ApiResponse & { data: AdminProjectListData }>(
      `/admin/projects${qs ? `?${qs}` : ""}`
    );
  },

  getAdminProject: (id: string) =>
    apiRequest<ApiResponse & { data: AdminProjectDetailData }>(`/admin/projects/${id}`),

  updateAdminProject: (id: string, data: {
    priority?: string;
    internal_due_date?: string;
    estimated_completion?: string;
    notes?: string;
  }) =>
    apiRequest<ApiResponse & { data: { project_status: string } }>(`/admin/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  changeProjectStatus: (id: string, status: string, reason?: string) =>
    apiRequest<ApiResponse & { data: { project_status: string } }>(
      `/admin/projects/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status, reason }) }
    ),

  milestoneAction: (milestoneId: string, action: string, notes?: string) =>
    apiRequest<ApiResponse & { data: unknown }>(
      `/admin/milestones/${milestoneId}/${action}`,
      { method: "POST", body: JSON.stringify({ notes }) }
    ),

  getProjectActivity: (id: string) =>
    apiRequest<ApiResponse & { data: { data: WorkspaceActivityLogData[]; current_page: number; last_page: number; total: number } }>(
      `/admin/projects/${id}/activity`
    ),

  getProjectNotes: (projectId: string) =>
    apiRequest<ApiResponse & { data: AdminNoteData[] }>(`/admin/projects/${projectId}/notes`),

  createProjectNote: (projectId: string, content: string) =>
    apiRequest<ApiResponse & { data: AdminNoteData }>(`/admin/projects/${projectId}/notes`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  updateProjectNote: (noteId: string, content: string) =>
    apiRequest<ApiResponse & { data: AdminNoteData }>(`/admin/notes/${noteId}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    }),

  deleteProjectNote: (noteId: string) =>
    apiRequest<ApiResponse>(`/admin/notes/${noteId}`, { method: "DELETE" }),

  // ─── Collaboration — Files ─────────────────────────────────
  getProjectFiles: (id: string, category?: string, sort?: string) => {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (sort) p.set("sort", sort);
    const qs = p.toString();
    return apiRequest<ApiResponse & { data: ServiceFileData[] }>(
      `/service-orders/${id}/files${qs ? `?${qs}` : ""}`
    );
  },

  uploadProjectFile: (id: string, file: File, category?: string, description?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (category) formData.append("category", category);
    if (description) formData.append("description", description);
    return apiRequest<ApiResponse & { data: ServiceFileData }>(
      `/service-orders/${id}/files`,
      { method: "POST", body: formData }
    );
  },

  downloadProjectFile: async (id: string, fileId: string) => {
    const response = await fetch(`${API_BASE_URL}/service-orders/${id}/files/${fileId}/download`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new ApiError(errData.error || "Download failed", response.status);
    }
    return response;
  },

  deleteProjectFile: (id: string, fileId: string) =>
    apiRequest<ApiResponse>(`/service-orders/${id}/files/${fileId}`, { method: "DELETE" }),

  updateFileDescription: (fileId: string, description: string) =>
    apiRequest<ApiResponse & { data: ServiceFileData }>(`/admin/files/${fileId}`, {
      method: "PATCH",
      body: JSON.stringify({ description }),
    }),

  // Admin file upload (separate endpoint under admin group)
  adminUploadProjectFile: (id: string, file: File, category?: string, description?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (category) formData.append("category", category);
    if (description) formData.append("description", description);
    return apiRequest<ApiResponse & { data: ServiceFileData }>(
      `/admin/projects/${id}/files`,
      { method: "POST", body: formData }
    );
  },

  adminDeleteProjectFile: (id: string, fileId: string) =>
    apiRequest<ApiResponse>(`/admin/projects/${id}/files/${fileId}`, { method: "DELETE" }),

  adminGetProjectFiles: (id: string, category?: string, sort?: string) => {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (sort) p.set("sort", sort);
    const qs = p.toString();
    return apiRequest<ApiResponse & { data: ServiceFileData[] }>(
      `/admin/projects/${id}/files${qs ? `?${qs}` : ""}`
    );
  },

  // ─── Collaboration — Messages ──────────────────────────────
  getProjectMessages: (id: string) =>
    apiRequest<ApiResponse & { data: ServiceMessageData[] }>(
      `/service-orders/${id}/messages`
    ),

  sendProjectMessage: (id: string, message: string, attachments?: string[]) =>
    apiRequest<ApiResponse & { data: ServiceMessageData }>(
      `/service-orders/${id}/messages`,
      { method: "POST", body: JSON.stringify({ message, attachments }) }
    ),

  adminSendProjectMessage: (id: string, message: string, attachments?: string[]) =>
    apiRequest<ApiResponse & { data: ServiceMessageData }>(
      `/admin/projects/${id}/messages`,
      { method: "POST", body: JSON.stringify({ message, attachments }) }
    ),

  adminGetProjectMessages: (id: string) =>
    apiRequest<ApiResponse & { data: ServiceMessageData[] }>(
      `/admin/projects/${id}/messages`
    ),

  pinMessage: (messageId: string) =>
    apiRequest<ApiResponse & { data: { is_important: boolean } }>(
      `/admin/messages/${messageId}/pin`,
      { method: "PATCH" }
    ),

  // ─── Collaboration — Milestone Review ──────────────────────
  approveMilestone: (orderId: string, milestoneId: string) =>
    apiRequest<ApiResponse & { data: { review_status: string; project_status: string } }>(
      `/service-orders/${orderId}/milestones/${milestoneId}/approve`,
      { method: "POST" }
    ),

  requestMilestoneChanges: (orderId: string, milestoneId: string, feedback: string) =>
    apiRequest<ApiResponse & { data: { review_status: string } }>(
      `/service-orders/${orderId}/milestones/${milestoneId}/request-changes`,
      { method: "POST", body: JSON.stringify({ feedback }) }
    ),

  requestMilestoneReview: (milestoneId: string) =>
    apiRequest<ApiResponse & { data: { review_status: string; review_requested_at: string } }>(
      `/admin/milestones/${milestoneId}/request-review`,
      { method: "POST" }
    ),

  // ─── Collaboration — Delivery ──────────────────────────────
  getProjectDeliveryItems: (id: string) =>
    apiRequest<ApiResponse & { data: ServiceFileData[] }>(
      `/service-orders/${id}/delivery`
    ),

  adminGetProjectDeliveryItems: (id: string) =>
    apiRequest<ApiResponse & { data: ServiceFileData[] }>(
      `/admin/projects/${id}/delivery`
    ),

  addDeliveryItem: (id: string, data: { name: string; type: string; description?: string; file?: File }) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("type", data.type);
    if (data.description) formData.append("description", data.description);
    if (data.file) formData.append("file", data.file);
    return apiRequest<ApiResponse & { data: ServiceFileData }>(
      `/admin/projects/${id}/delivery`,
      { method: "POST", body: formData }
    );
  },

  removeDeliveryItem: (id: string, fileId: string) =>
    apiRequest<ApiResponse>(`/admin/projects/${id}/delivery/${fileId}`, { method: "DELETE" }),

  // ─── Collaboration — Review/Rating ─────────────────────────
  getProjectReview: (orderId: string) =>
    apiRequest<ApiResponse & { data: ProjectReviewData }>(
      `/service-orders/${orderId}/review`
    ),

  submitProjectReview: (orderId: string, data: { rating: number; review?: string; allow_showcase?: boolean }) =>
    apiRequest<ApiResponse & { data: ProjectReviewData }>(
      `/service-orders/${orderId}/review`,
      { method: "POST", body: JSON.stringify(data) }
    ),

  adminGetReviews: () =>
    apiRequest<ApiResponse & { data: { data: ProjectReviewData[] } }>("/admin/reviews"),

  moderateReview: (reviewId: string, data: { is_visible: boolean; is_featured?: boolean }) =>
    apiRequest<ApiResponse & { data: ProjectReviewData }>(`/admin/reviews/${reviewId}`, {
      method: "PATCH",
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
  project_number: string;
  project_status: string;
  invoice_number: string;
  receipt_number: string;
  status: string;
  payment_status: string;
  amount_paid_ngn: number;
  balance_ngn: number;
  total_ngn: number;
  payment_type: string;
  project_name: string;
  created_at: string;
}

export interface ServiceOrderListItem {
  id: string;
  order_number: string;
  project_number: string | null;
  service: string;
  project: string;
  package: string;
  total_ngn: number;
  total_usd: number;
  status: string;
  project_status: string | null;
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

// Workspace Types
export interface WorkspaceMilestoneData {
  id: string;
  service_order_id: string;
  title: string;
  description: string | null;
  milestone_type: string | null;
  status: string;
  is_automatic: boolean;
  sort_order: number;
  due_date: string | null;
  completed_at: string | null;
  deliverables: string[] | null;
  completion_notes: string | null;
  created_at: string;
  review_requested_at: string | null;
  review_status: string | null;
  review_feedback: string | null;
}

export interface WorkspaceInvoiceData {
  id: string;
  invoice_number: string;
  status: string;
  total_ngn: number;
  amount_paid_ngn: number;
  balance_ngn: number;
  payment_type: string;
  paid_at: string | null;
  created_at: string;
}

export interface WorkspacePaymentData {
  id: string;
  reference: string;
  gateway: string;
  amount_ngn: number;
  status: string;
  payment_type: string;
  paid_at: string;
  created_at: string;
}

export interface WorkspaceReceiptData {
  id: string;
  receipt_number: string;
  amount_ngn: number;
  currency: string;
  payment_gateway: string;
  status: string;
  created_at: string;
}

export interface WorkspaceActivityLogData {
  id: string;
  user_id: string | null;
  action: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user?: { profile: { full_name: string | null; avatar_url: string | null } | null } | null;
}

export interface WorkspaceProjectManagerData {
  id: string;
  profile: { full_name: string | null; avatar_url: string | null } | null;
}

export interface WorkspaceDataResponse {
  id: string;
  order_number: string;
  project_number: string | null;
  project_name: string;
  status: string;
  project_status: string;
  payment_status: string;
  total_ngn: number;
  amount_paid_ngn: number;
  balance_ngn: number;
  service: { title: string; slug: string };
  projectType: { title: string; slug: string };
  package: { name: string; slug: string };
  addOns: { id: string; name: string; price_ngn: number }[];
  billing_details: Record<string, unknown>;
  project_created_at: string | null;
  kickoff_at: string | null;
  completed_at: string | null;
  created_at: string;
  milestones: WorkspaceMilestoneData[];
  invoices: WorkspaceInvoiceData[];
  payments: WorkspacePaymentData[];
  receipts: WorkspaceReceiptData[];
  activityLogs: WorkspaceActivityLogData[];
  projectManager: WorkspaceProjectManagerData | null;
  messages: ServiceMessageData[];
  files: ServiceFileData[];
}

export interface MilestonesResponseData {
  milestones: WorkspaceMilestoneData[];
  progress: number;
  completed: number;
  total: number;
}

export interface PaginatedActivityData {
  data: WorkspaceActivityLogData[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface InvoiceDownloadData {
  invoice: WorkspaceInvoiceData;
  order: {
    order_number: string;
    project_number: string | null;
    service: string;
    project_type: string;
    package: string;
    billing_details: Record<string, unknown>;
    metadata: Record<string, unknown>;
  };
}

export interface ReceiptDownloadData {
  receipt: WorkspaceReceiptData;
  order: {
    order_number: string;
    project_number: string | null;
    service: string;
    project_type: string;
    package: string;
    billing_details: Record<string, unknown>;
  };
}

// ─── Admin Project Workspace Types ─────────────────────────────────

export interface AdminProjectListItem {
  id: string;
  order_number: string;
  project_number: string | null;
  project_name: string;
  client: string;
  service: string;
  project_type: string;
  package_name: string;
  status: string;
  project_status: string;
  payment_status: string;
  priority: string;
  current_milestone: string | null;
  progress: number;
  total_ngn: number;
  amount_paid_ngn: number;
  created_at: string;
  updated_at: string;
  project_created_at: string | null;
  kickoff_at: string | null;
  completed_at: string | null;
}

export interface AdminProjectListData {
  data: AdminProjectListItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AdminNoteData {
  id: string;
  content: string;
  edit_history: { content: string; edited_at: string; edited_by: string }[] | null;
  created_at: string;
  updated_at: string;
  user: { full_name: string } | null;
}

export interface AdminMilestoneData {
  id: string;
  title: string;
  description: string | null;
  milestone_type: string | null;
  status: string;
  sort_order: number;
  due_date: string | null;
  completed_at: string | null;
  deliverables: string[] | null;
  completion_notes: string | null;
  review_requested_at: string | null;
  review_status: string | null;
  review_feedback: string | null;
}

export interface AdminClientData {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  company: string | null;
}

export interface AdminProjectDetailData {
  id: string;
  order_number: string;
  project_number: string | null;
  project_name: string;
  status: string;
  project_status: string;
  payment_status: string;
  priority: string;
  total_ngn: number;
  amount_paid_ngn: number;
  balance_ngn: number;
  created_at: string;
  project_created_at: string | null;
  kickoff_at: string | null;
  completed_at: string | null;
  estimated_completion: string | null;
  notes: string | null;
  client: AdminClientData | null;
  service: { id: string; title: string; slug: string } | null;
  projectType: { id: string; title: string } | null;
  package: { id: string; name: string } | null;
  addOns: { id: string; name: string; price_ngn: number }[];
  milestones: AdminMilestoneData[];
  progress: { progress: number; completed: number; total: number; current_milestone: string | null; current_milestone_id: string | null };
  invoices: WorkspaceInvoiceData[];
  payments: WorkspacePaymentData[];
  receipts: WorkspaceReceiptData[];
  activityLogs: WorkspaceActivityLogData[];
  projectManager: { full_name: string } | null;
  internalNotes: AdminNoteData[];
  team_assignments: unknown[];
}

// ─── Collaboration Types ────────────────────────────────────────────

export interface ServiceFileData {
  id: string;
  name: string;
  type: string | null;
  size: number;
  category: string;
  description: string | null;
  is_delivery: boolean;
  has_file?: boolean;
  created_at: string;
  user: { full_name: string | null; avatar_url: string | null } | null;
}

export interface ServiceMessageData {
  id: string;
  message: string;
  type: string;
  is_important: boolean;
  attachments: string[] | null;
  created_at: string;
  user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    is_admin: boolean;
  } | null;
}

export interface ProjectReviewData {
  id: string;
  rating: number;
  review: string | null;
  is_visible: boolean;
  is_featured: boolean;
  created_at: string;
  user?: { full_name: string | null } | null;
}

export interface DeliveryItemData {
  id: string;
  name: string;
  type: string;
  size: number;
  description: string | null;
  has_file: boolean;
  created_at: string;
  user: { full_name: string | null } | null;
}

// Extend AdminMilestoneData with review fields
export interface AdminMilestoneReviewData extends AdminMilestoneData {
  review_requested_at: string | null;
  review_status: string | null;
  review_feedback: string | null;
}
