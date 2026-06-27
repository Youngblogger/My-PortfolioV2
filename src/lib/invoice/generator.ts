import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { ACADEMY_NAME, ACADEMY_ADDRESS, ACADEMY_EMAIL, ACADEMY_PHONE } from "@/lib/constants";

export interface InvoiceData {
  invoice_number: string;
  student_name: string;
  student_email: string;
  course_name: string;
  payment_gateway?: string;
  payment_method?: string;
  subtotal: number;
  discount_amount: number;
  discount_code?: string;
  tax_amount: number;
  tax_rate: number;
  grand_total: number;
  currency: string;
  status: string;
  paid_at?: string;
  created_at: string;
}

export function generateInvoicePDF(data: InvoiceData): ArrayBuffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, 297, "F");

  doc.setTextColor(212, 175, 55);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(ACADEMY_NAME, 20, 30);

  doc.setTextColor(161, 161, 170);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(ACADEMY_ADDRESS, 20, 38);
  doc.text(ACADEMY_EMAIL, 20, 44);
  doc.text(ACADEMY_PHONE, 20, 50);

  doc.setTextColor(212, 175, 55);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - 20, 30, { align: "right" });

  doc.setTextColor(161, 161, 170);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`#${data.invoice_number}`, pageWidth - 20, 38, { align: "right" });
  doc.text(`Date: ${new Date(data.created_at).toLocaleDateString()}`, pageWidth - 20, 44, { align: "right" });
  doc.text(`Status: ${data.status.toUpperCase()}`, pageWidth - 20, 50, { align: "right" });

  doc.setDrawColor(212, 175, 55, 0.3);
  doc.line(20, 58, pageWidth - 20, 58);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 20, 70);

  doc.setTextColor(161, 161, 170);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.student_name, 20, 78);
  doc.text(data.student_email, 20, 84);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Course:", pageWidth - 20, 70, { align: "right" });

  doc.setTextColor(161, 161, 170);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.course_name, pageWidth - 20, 78, { align: "right" });

  doc.setDrawColor(212, 175, 55, 0.3);
  doc.line(20, 92, pageWidth - 20, 92);

  const tableBody = [
    ["Course Enrollment", data.course_name, data.currency === "NGN" ? "NGN" : "USD", (data.subtotal).toLocaleString()],
  ];

  if (data.discount_amount > 0) {
    tableBody.push(["Discount", data.discount_code || "Coupon", "", `-${data.discount_amount.toLocaleString()}`]);
  }

  tableBody.push(["Tax", `${(data.tax_rate * 100).toFixed(1)}%`, "", data.tax_amount.toLocaleString()]);

  (doc as any).autoTable({
    startY: 98,
    head: [["Description", "Details", "Currency", "Amount"]],
    body: tableBody,
    headStyles: {
      fillColor: [212, 175, 55],
      textColor: [10, 10, 10],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fillColor: [17, 24, 39],
      textColor: [255, 255, 255],
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [26, 26, 46],
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 60 },
      2: { cellWidth: 30, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
    },
    margin: { left: 20, right: 20 },
    theme: "grid",
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFillColor(212, 175, 55, 0.1);
  doc.roundedRect(20, finalY, pageWidth - 40, 20, 4, 4, "F");

  doc.setTextColor(212, 175, 55);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Total: ${data.currency === "NGN" ? "NGN " : "$"}${data.grand_total.toLocaleString()}`, pageWidth - 20, finalY + 14, { align: "right" });

  if (data.paid_at) {
    doc.setTextColor(0, 200, 150);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Paid on: ${new Date(data.paid_at).toLocaleDateString()}`, 20, finalY + 14);
  }

  doc.setTextColor(82, 82, 91);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for choosing CODEMAFIA Academy", pageWidth / 2, 280, { align: "center" });

  return doc.output("arraybuffer");
}
