"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ACADEMY_NAME, ACADEMY_ADDRESS, ACADEMY_EMAIL, ACADEMY_PHONE } from "@/lib/constants";
import { api, type InvoiceData } from "@/lib/api";

function InvoiceDetail() {
  const params = useParams();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await api.getInvoice(id);
        if (mounted) setInvoice(data.invoice);
      } catch (err) {
        console.error("Invoice fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await api.downloadInvoicePdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice?.invoice_number || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <PageLoader />;
  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Invoice not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="glass rounded-2xl p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-gold">{ACADEMY_NAME}</h1>
              <p className="text-xs text-muted">{ACADEMY_ADDRESS}</p>
              <p className="text-xs text-muted">{ACADEMY_EMAIL} | {ACADEMY_PHONE}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gold">INVOICE</h2>
              <p className="text-xs text-muted font-mono">#{invoice.invoice_number}</p>
              <p className="text-xs text-muted">{formatDate(invoice.created_at)}</p>
              <Badge variant={invoice.status === "completed" ? "success" : "info"}>{invoice.status}</Badge>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted text-xs">Bill To:</p>
                <p className="text-white">{invoice.student_name}</p>
                <p className="text-muted">{invoice.student_email}</p>
              </div>
              <div className="text-right">
                <p className="text-muted text-xs">Course:</p>
                <p className="text-white">{invoice.course_name}</p>
              </div>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-muted font-medium">Description</th>
                <th className="text-right py-2 text-muted font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-3 text-white">Course Enrollment - {invoice.course_name}</td>
                <td className="py-3 text-right text-white">{formatCurrency(invoice.subtotal, invoice.currency)}</td>
              </tr>
              {invoice.discount_amount > 0 && (
                <tr className="border-b border-white/5">
                  <td className="py-3 text-white">Discount {invoice.discount_code ? `(${invoice.discount_code})` : ""}</td>
                  <td className="py-3 text-right text-red-400">-{formatCurrency(invoice.discount_amount, invoice.currency)}</td>
                </tr>
              )}
              <tr className="border-b border-white/5">
                <td className="py-3 text-white">Tax ({(invoice.tax_rate * 100).toFixed(1)}%)</td>
                <td className="py-3 text-right text-white">{formatCurrency(invoice.tax_amount, invoice.currency)}</td>
              </tr>
            </tbody>
          </table>

          <div className="bg-gold/10 rounded-xl p-4 text-right">
            <p className="text-xs text-muted">Total</p>
            <p className="text-2xl font-bold text-gold">{formatCurrency(invoice.grand_total, invoice.currency)}</p>
          </div>

          {invoice.paid_at && (
            <p className="text-xs text-green-400">Paid on: {formatDate(invoice.paid_at)}</p>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleDownload} loading={downloading}>Download PDF</Button>
            <Button variant="secondary" onClick={() => window.print()}>Print</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <InvoiceDetail />
    </Suspense>
  );
}
