"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CourseHeroSection } from "@/components/checkout/CourseHeroSection";
import { InstructorCard } from "@/components/checkout/InstructorCard";
import { WhatYouLearn } from "@/components/checkout/WhatYouLearn";
import { CourseIncludes } from "@/components/checkout/CourseIncludes";
import { CurriculumPreview } from "@/components/checkout/CurriculumPreview";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CouponInput } from "@/components/checkout/CouponInput";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { BillingForm, type BillingFormData } from "@/components/checkout/BillingForm";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Accordion } from "@/components/ui/Accordion";
import { CheckoutSkeleton } from "@/components/ui/Skeleton";
import { formatCurrency, calculateDiscount, calculateTax } from "@/lib/utils";
import { ACADEMY_EMAIL, ACADEMY_PHONE } from "@/lib/constants";
import { api, type CourseData, type PricingTierData, type CourseModuleData } from "@/lib/api";
import type { CheckoutCoupon, PaymentGateway } from "@/types/database";

const STEPS = ["Course", "Checkout", "Payment", "Success"];

const faqItems = [
  {
    title: "What is your refund policy?",
    content: "We offer a 7-day money-back guarantee. If you're not satisfied with the course, contact us within 7 days of purchase for a full refund.",
  },
  {
    title: "Can I pay in installments?",
    content: "Yes, we offer flexible payment plans. Contact our support team to set up an installment arrangement.",
  },
  {
    title: "Is there a certificate upon completion?",
    content: "Yes, all paid courses include a certificate of completion that you can share on LinkedIn.",
  },
  {
    title: "How long do I have access to the course?",
    content: "You get lifetime access to the course materials, including all future updates.",
  },
  {
    title: "What payment methods do you accept?",
    content: "We accept card payments (Visa, Mastercard, Verve), bank transfers, and USSD via Paystack and Flutterwave.",
  },
  {
    title: "Do I need any prerequisites?",
    content: "Prerequisites vary by course. Check the course description for specific requirements.",
  },
];

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.courseSlug as string;

  const [course, setCourse] = useState<CourseData | null>(null);
  const [modules, setModules] = useState<CourseModuleData[]>([]);
  const [selectedTier, setSelectedTier] = useState<PricingTierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>("paystack");
  const [billing, setBilling] = useState<BillingFormData>({
    full_name: "", email: "", phone: "", country: "NG", state: "", city: "",
    address: "", company: "", tax_id: "",
  });
  const [billingErrors, setBillingErrors] = useState<Partial<Record<keyof BillingFormData, string>>>({});

  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponData, setCouponData] = useState<CheckoutCoupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptRefund, setAcceptRefund] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [courseResult, userResult] = await Promise.allSettled([
          api.getCourse(courseSlug),
          api.getUser().catch(() => null),
        ]);

        if (courseResult.status === "fulfilled") {
          const courseData = courseResult.value.course;
          setCourse(courseData);
          setModules(courseData.modules || []);

          if (courseData.pricing_tiers?.length > 0) {
            setSelectedTier(courseData.pricing_tiers[0]);
          }
        }

        if (userResult.status === "fulfilled" && userResult.value) {
          const u = userResult.value.user;
          setUser({ id: u.id, email: u.email });
          setBilling((prev) => ({
            ...prev,
            full_name: u.full_name || prev.full_name,
            email: u.email || prev.email,
          }));
        }
      } catch {
        setError("Failed to load course");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseSlug]);

  const handleBillingChange = useCallback((field: keyof BillingFormData, value: string) => {
    setBilling((prev) => ({ ...prev, [field]: value }));
    setBillingErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const price = selectedTier?.price_ngn || course?.price_ngn || 0;
  const currency = course?.currency || "NGN";

  let grandTotal = price - discountAmount;
  let taxAmount = 0;
  if (grandTotal > 0 && billing.country) {
    const tax = calculateTax(grandTotal, billing.country);
    taxAmount = tax.amount;
    grandTotal += tax.amount;
  }

  async function handleApplyCoupon(code: string) {
    try {
      const result = await api.validateCoupon(code, course?.id, price);
      if (result.valid && result.coupon) {
        setCouponData(result.coupon);
        setCouponCode(code);
        const discount = calculateDiscount(
          price,
          result.coupon.discount_type,
          result.coupon.discount_value
        );
        setDiscountAmount(discount);
        return { valid: true };
      }
      return { valid: false, error: result.error };
    } catch {
      return { valid: false, error: "Failed to validate coupon" };
    }
  }

  function handleRemoveCoupon() {
    setCouponCode(null);
    setCouponData(null);
    setDiscountAmount(0);
  }

  function validateBilling(): boolean {
    const errors: Partial<Record<keyof BillingFormData, string>> = {};
    if (!billing.full_name.trim()) errors.full_name = "Full name is required";
    if (!billing.email.trim()) errors.email = "Email is required";
    if (!billing.phone.trim()) errors.phone = "Phone number is required";
    if (!billing.country) errors.country = "Country is required";
    if (!billing.state.trim()) errors.state = "State is required";
    if (!billing.city.trim()) errors.city = "City is required";
    setBillingErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validateBilling()) return;

    if (grandTotal > 0) {
      if (!acceptTerms || !acceptPrivacy || !acceptRefund) return;
    }

    if (!user) {
      router.push(`/auth/login?redirect=/academy/checkout/${courseSlug}`);
      return;
    }

    setSubmitting(true);

    try {
      if (grandTotal === 0 && course?.is_free) {
        const result = await api.enrollFree(course.id, selectedTier?.id, billing as unknown as Record<string, string>);
        router.push(`/academy/enrollment/${result.enrollment_id}?success=true`);
        return;
      }

      const result = await api.checkout({
        course_id: course!.id,
        tier_id: selectedTier?.id,
        payment_gateway: paymentGateway,
        billing: {
          full_name: billing.full_name,
          email: billing.email,
          phone: billing.phone,
          country: billing.country,
          state: billing.state,
          city: billing.city,
          address: billing.address,
          company: billing.company,
          tax_id: billing.tax_id,
        },
        coupon_code: couponCode || undefined,
      });

      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        setError("Payment initialization failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <CheckoutSkeleton />;
  if (!course) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Course Not Found</h2>
        <p className="text-muted mb-6">The course you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/academy" className="text-gold hover:underline">Browse Courses</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/academy" className="text-gold font-bold text-lg">CODEMAFIA Academy</Link>
          <div className="hidden sm:flex items-center gap-2">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center">
                <span className="text-xs text-muted">{step}</span>
                {i < STEPS.length - 1 && <span className="text-muted/30 mx-2">→</span>}
              </div>
            ))}
          </div>
          <Link href={`/academy/${course.stack_id}`} className="text-xs text-muted hover:text-white transition-colors">
            ← Back to Course
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <CourseHeroSection course={course as unknown as import("@/types/database").Course} />

              {course.what_you_learn?.length > 0 && (
                <WhatYouLearn items={course.what_you_learn} />
              )}

              {modules.length > 0 && <CurriculumPreview modules={modules as unknown as import("@/types/database").CourseModule[]} />}

              <InstructorCard course={course as unknown as import("@/types/database").Course} />

              {course.includes?.length > 0 && (
                <CourseIncludes items={course.includes} />
              )}

              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Student Reviews</h3>
                {course.average_rating > 0 ? (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gold">{course.average_rating.toFixed(1)}</div>
                      <div className="text-gold text-sm" aria-label={`${course.average_rating} out of 5 stars`}>
                        {Array.from({ length: 5 }, (_, i) => i < Math.round(course.average_rating) ? "★" : "☆").join("")}
                      </div>
                      <div className="text-xs text-muted mt-1">{course.total_reviews} reviews</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted text-sm">No reviews yet. Be the first to review!</p>
                )}
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h3>
                <Accordion items={faqItems} allowMultiple />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-6">
                {selectedTier && (
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-2">{selectedTier.name}</h3>
                    <div className="text-3xl font-bold text-gold">
                      {formatCurrency(selectedTier.price_ngn, "NGN")}
                    </div>
                    {selectedTier.description && (
                      <p className="text-muted text-sm mt-2">{selectedTier.description}</p>
                    )}
                  </div>
                )}

                {!selectedTier && course.is_free && (
                  <div className="glass rounded-2xl p-6">
                    <div className="text-3xl font-bold text-green-400" aria-hidden="true">Free</div>
                    <p className="text-muted text-sm mt-2">No payment required</p>
                  </div>
                )}

                {!course.is_free && (
                  <>
                    <CouponInput
                      onApply={handleApplyCoupon}
                      onRemove={handleRemoveCoupon}
                      applied={!!couponCode}
                    />

                    <OrderSummary
                      data={{
                        course: course as unknown as import("@/types/database").Course,
                        tier: selectedTier as unknown as import("@/types/database").PricingTier | undefined,
                        coupon: couponData,
                        discount_amount: discountAmount,
                        subtotal: price,
                        tax_amount: taxAmount,
                        grand_total: grandTotal,
                        currency,
                      }}
                    />

                    <PaymentMethodSelector
                      selected={paymentGateway}
                      onSelect={setPaymentGateway}
                    />
                  </>
                )}

                <BillingForm
                  data={billing}
                  onChange={handleBillingChange}
                  errors={billingErrors}
                />

                <div className="space-y-3 glass rounded-2xl p-4">
                  <Checkbox
                    label={<>I accept the <Link href="/terms" className="text-gold hover:underline">Terms &amp; Conditions</Link></>}
                    checked={acceptTerms}
                    onChange={setAcceptTerms}
                  />
                  <Checkbox
                    label={<>I accept the <Link href="/privacy" className="text-gold hover:underline">Privacy Policy</Link></>}
                    checked={acceptPrivacy}
                    onChange={setAcceptPrivacy}
                  />
                  <Checkbox
                    label={<>I accept the <Link href="/terms" className="text-gold hover:underline">Refund Policy</Link></>}
                    checked={acceptRefund}
                    onChange={setAcceptRefund}
                  />
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={submitting}
                  disabled={grandTotal > 0 ? !(acceptTerms && acceptPrivacy && acceptRefund) : false}
                >
                  {grandTotal === 0 ? "Complete Enrollment" : `Pay ${formatCurrency(grandTotal, currency)}`}
                </Button>

                <div className="glass rounded-2xl p-4 text-center space-y-2">
                  <div className="flex justify-center gap-4 text-xs text-muted" aria-hidden="true">
                    <span>🔒 SSL Secure</span>
                    <span>✓ PCI Compliant</span>
                    <span>🔐 Encrypted</span>
                  </div>
                  <p className="text-xs text-muted">100% Money-Back Guarantee</p>
                </div>

                <div className="glass rounded-2xl p-4">
                  <p className="text-xs text-muted text-center mb-2">Need help?</p>
                  <div className="flex justify-center gap-3 text-xs">
                    <a href={`mailto:${ACADEMY_EMAIL}`} className="text-gold hover:underline">Email</a>
                    <a href={`tel:${ACADEMY_PHONE}`} className="text-gold hover:underline">Call</a>
                    <a href="https://wa.me/2348000000000" className="text-gold hover:underline">WhatsApp</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-xl shadow-lg text-sm z-50">
          {error}
        </div>
      )}
    </div>
  );
}
