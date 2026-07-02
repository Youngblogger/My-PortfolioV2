"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { api, type EnrollmentData, type CourseData, type TransactionData, type InvoiceData } from "@/lib/api";

function EnrollmentDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const justCompleted = searchParams.get("success") === "true";

  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await api.getEnrollment(id);
        if (!mounted) return;
        setEnrollment(data.enrollment);
        setCourse(data.course);
        setTransaction(data.transaction);
        setInvoice(data.invoice);
      } catch (err) {
        console.error("Enrollment fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <PageLoader />;
  if (!enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#101828] mb-2">Enrollment Not Found</h2>
          <Link href="/academy/dashboard" className="text-[#5B4CF0] hover:underline">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {justCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-8 text-center border-[#5B4CF0]/20"
          >
            <div className="text-6xl mb-4" aria-hidden="true">🎉</div>
            <h1 className="text-3xl font-bold text-[#101828] mb-2">Congratulations!</h1>
            <p className="text-[#98A2B3]">You have successfully enrolled in the course.</p>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-[#101828]">Enrollment Details</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#98A2B3] text-xs">Enrollment ID</p>
              <p className="text-[#101828] font-mono text-xs">{enrollment.enrollment_number}</p>
            </div>
            <div>
              <p className="text-[#98A2B3] text-xs">Status</p>
              <Badge variant={enrollment.status === "active" ? "success" : "info"}>{enrollment.status}</Badge>
            </div>
            <div>
              <p className="text-[#98A2B3] text-xs">Course</p>
              <p className="text-[#101828]">{course?.title || "N/A"}</p>
            </div>
            <div>
              <p className="text-[#98A2B3] text-xs">Enrolled</p>
              <p className="text-[#101828]">{formatDate(enrollment.created_at)}</p>
            </div>
          </div>

          <div>
            <p className="text-[#98A2B3] text-xs mb-1">Progress</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-[#ECEFF5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5B4CF0] rounded-full transition-all duration-500"
                  style={{ width: `${enrollment.progress}%` }}
                />
              </div>
              <span className="text-[#101828] text-xs">{enrollment.progress}%</span>
            </div>
          </div>

          <div>
            <p className="text-[#98A2B3] text-xs">Certificate</p>
            <p className="text-[#101828] font-medium">
              {enrollment.certificate_url ? "Issued" : "In Progress"}
            </p>
          </div>
        </div>

        {transaction && (
          <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(16,24,40,0.06)] border border-[#ECEFF5] rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#101828]">Payment Information</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#98A2B3] text-xs">Transaction Ref</p>
                <p className="text-[#101828] font-mono text-xs">{transaction.transaction_reference}</p>
              </div>
              <div>
                <p className="text-[#98A2B3] text-xs">Amount</p>
                <p className="text-[#5B4CF0] font-bold">{formatCurrency(transaction.amount, transaction.currency)}</p>
              </div>
              <div>
                <p className="text-[#98A2B3] text-xs">Payment Method</p>
                <p className="text-[#101828] capitalize">{transaction.payment_gateway}</p>
              </div>
              <div>
                <p className="text-[#98A2B3] text-xs">Status</p>
                <Badge variant={transaction.status === "completed" ? "success" : "info"}>{transaction.status}</Badge>
              </div>
            </div>
          </div>
        )}

        {invoice && (
          <Link href={`/academy/invoice/${invoice.id}`}>
            <Button variant="secondary">View Invoice</Button>
          </Link>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href={`/academy/${course?.stack_id || ""}`}>
            <Button>Continue Learning</Button>
          </Link>
          <Link href="/academy/dashboard">
            <Button variant="secondary">Student Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EnrollmentPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <EnrollmentDetail />
    </Suspense>
  );
}
