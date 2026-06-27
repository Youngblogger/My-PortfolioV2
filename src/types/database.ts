export type UserRole = "student" | "instructor" | "admin";
export type EnrollmentStatus = "active" | "completed" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded" | "cancelled";
export type PaymentGateway = "paystack" | "flutterwave";
export type DiscountType = "percentage" | "fixed";

export interface Profile {
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
  role: UserRole;
  bio: string | null;
  title: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Course {
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
  instructor_id: string | null;
  instructor_name: string | null;
  instructor_title: string | null;
  instructor_avatar: string | null;
  instructor_bio: string | null;
  instructor_experience: number;
  instructor_students: number;
  instructor_courses: number;
  instructor_rating: number;
  duration: string | null;
  skill_level: string | null;
  language: string;
  last_updated: string | null;
  certificate_included: boolean;
  lifetime_access: boolean;
  mobile_access: boolean;
  downloadable_resources: boolean;
  projects_included: boolean;
  community_access: boolean;
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
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  lessons: Lesson[];
  created_at: string;
}

export interface Lesson {
  title: string;
  duration: string;
  is_preview?: boolean;
  is_locked?: boolean;
}

export interface PricingTier {
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
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  tier_id: string | null;
  enrollment_number: string;
  status: EnrollmentStatus;
  progress: number;
  certificate_url: string | null;
  started_at: string;
  completed_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  enrollment_id: string | null;
  transaction_reference: string;
  payment_gateway: PaymentGateway;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway_response: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  enrollment_id: string | null;
  transaction_id: string | null;
  course_name: string;
  student_name: string;
  student_email: string;
  payment_gateway: PaymentGateway | null;
  payment_method: string | null;
  subtotal: number;
  discount_amount: number;
  discount_code: string | null;
  tax_amount: number;
  tax_rate: number;
  grand_total: number;
  currency: string;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}

export interface Receipt {
  id: string;
  receipt_number: string;
  transaction_reference: string;
  user_id: string;
  enrollment_id: string | null;
  invoice_id: string | null;
  course_name: string;
  student_name: string;
  amount: number;
  payment_gateway: PaymentGateway | null;
  payment_method: string | null;
  currency: string;
  status: PaymentStatus;
  receipt_data: Record<string, unknown>;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_purchase: number;
  max_uses: number;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  course_id: string | null;
  user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CourseReview {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  review: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface PaymentIntent {
  reference: string;
  gateway: PaymentGateway;
  authorization_url: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentVerification {
  status: PaymentStatus;
  amount: number;
  currency: string;
  gateway_response: Record<string, unknown>;
}

export interface CheckoutCoupon {
  code?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  description?: string;
}

export interface CheckoutData {
  course: Course;
  tier?: PricingTier;
  coupon?: CheckoutCoupon | null;
  discount_amount: number;
  subtotal: number;
  tax_amount: number;
  grand_total: number;
  currency: string;
}

export interface EnrollmentResult {
  enrollment: Enrollment;
  transaction: Transaction;
  invoice: Invoice;
  receipt: Receipt;
}

export interface StackData {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  level: string;
  students: string;
  gradient: string;
  skills: string[];
  outcomes: string[];
}

export interface StudentDashboardData {
  profile: Profile;
  enrollments: (Enrollment & { course: Course })[];
  recent_activity: AuditLog[];
}
