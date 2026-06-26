import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "uthmanabdulwahab2019@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "admin@codemafia.ng";

const categoryLabel: Record<string, string> = {
  "business-website": "Business Website",
  "e-commerce": "E-commerce Website",
  saas: "SaaS Platform",
  lms: "Educational / LMS Platform",
  marketplace: "Marketplace Website",
  portfolio: "Portfolio Website",
  blog: "Blog / News Website",
  mobile: "Mobile App System",
  custom: "Custom Web Application",
  "not-sure": "Not sure — recommend for me",
};

const subServiceLabel: Record<string, string> = {
  corporate: "Corporate Website",
  "company-profile": "Company Profile Website",
  startup: "Startup Website",
  "landing-page": "Landing Page Website",
  "personal-brand": "Personal Brand Website",
  "single-vendor": "Single Vendor Store",
  "multi-vendor": "Multi-vendor Marketplace",
  dropshipping: "Dropshipping Store",
  "digital-products": "Digital Products Store",
  "product-showcase": "Product Showcase Website",
  "subscription-saas": "Subscription SaaS",
  "ai-saas": "AI SaaS Tool",
  crm: "CRM System",
  dashboard: "Dashboard Platform",
  automation: "Automation Tool",
  "online-course": "Online Course Platform",
  coaching: "Coaching Website",
  "school-management": "School Management System",
  elearning: "E-learning Academy",
  "membership-learning": "Membership Learning Platform",
  "service-marketplace": "Service Marketplace",
  "job-marketplace": "Job Marketplace",
  "rental-marketplace": "Rental Marketplace",
  "product-marketplace": "Product Marketplace",
  freelance: "Freelance Platform",
  "dev-portfolio": "Developer Portfolio",
  "designer-portfolio": "Designer Portfolio",
  "freelancer-portfolio": "Freelancer Portfolio",
  "personal-cv": "Personal CV Website",
  "personal-blog": "Personal Blog",
  "tech-blog": "Tech Blog",
  "news-platform": "News Platform",
  magazine: "Magazine Website",
  "app-backend": "App Backend System",
  "api-dev": "API Development",
  "mobile-backend": "Mobile Backend Integration",
  "full-app": "Full App + Web Admin Panel",
  "ai-app": "AI Application",
  fintech: "Fintech System",
  "admin-dashboard": "Admin Dashboard System",
  "custom-automation": "Custom Automation Tool",
  enterprise: "Enterprise Solution",
};

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, service, subService, budget, project, timeline } = await req.json();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const html = `
      <h2>New Quote Request from CODEMAFIA.NG</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #ddd;">${name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Phone</td><td style="padding:8px;border:1px solid #ddd;">${phone}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Service</td><td style="padding:8px;border:1px solid #ddd;">${categoryLabel[service] || service}${subService ? ` — ${subServiceLabel[subService] || subService}` : ""}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Budget</td><td style="padding:8px;border:1px solid #ddd;">${budget}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Timeline</td><td style="padding:8px;border:1px solid #ddd;">${timeline}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Project Details</td><td style="padding:8px;border:1px solid #ddd;">${project}</td></tr>
      </table>
    `;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: CONTACT_EMAIL,
      subject: `New Quote Request from ${name} — ${categoryLabel[service] || service}${subService ? ` (${subServiceLabel[subService] || subService})` : ""}`,
      html,
      replyTo: email,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}
