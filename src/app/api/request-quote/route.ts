import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "uthmanabdulwahab2019@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "admin@codemafia.ng";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const serviceStructure: Record<string, { label: string; options: string[] }> = {
  "business-website": { label: "Business Website", options: ["Corporate Website", "Company Profile Website", "Startup Website", "Landing Page Website", "Personal Brand Website"] },
  "ecommerce-store": { label: "E-commerce Store", options: ["Single Vendor Store", "Multi-vendor Marketplace", "Dropshipping Store", "Digital Products Store", "Product Catalog Website"] },
  "saas-platform": { label: "SaaS Platform", options: ["Subscription SaaS", "AI SaaS Tool", "CRM System", "Admin Dashboard System", "Automation Tool"] },
  "educational-website": { label: "Educational Website", options: ["Online Learning Platform (LMS)", "School Website", "Coaching / Mentorship Platform", "Course Marketplace", "Exam / Quiz Platform", "Membership Learning System"] },
  "marketplace-platform": { label: "Marketplace Platform", options: ["Service Marketplace", "Freelance Marketplace", "Job Marketplace", "Rental Marketplace", "Product Marketplace"] },
  "portfolio-website": { label: "Portfolio Website", options: ["Developer Portfolio", "Designer Portfolio", "Freelancer Portfolio", "Personal CV Website"] },
  "blog-news": { label: "Blog / News Website", options: ["Personal Blog", "Tech Blog", "News Platform", "Online Magazine", "Content Publishing Platform"] },
  "mobile-app-system": { label: "Mobile App System", options: ["App Backend System", "API Development", "Mobile Backend Integration", "Full App + Web Admin Panel"] },
  "custom-web-app": { label: "Custom Web Application", options: ["AI Application", "Fintech System", "Admin Dashboard System", "Custom Automation Tool", "Enterprise Solution"] },
  "booking-system": { label: "Booking System", options: ["Appointment Booking System", "Hotel Booking System", "Restaurant Reservation System", "Event Booking Platform"] },
  "social-platform": { label: "Social Platform", options: ["Community Platform", "Social Network Website", "Forum Platform", "Messaging Platform"] },
  "real-estate": { label: "Real Estate Website", options: ["Property Listing Website", "Rental Marketplace", "Real Estate Agency Website"] },
  "restaurant-food": { label: "Restaurant / Food Website", options: ["Restaurant Website", "Online Food Ordering System", "Menu Showcase Website"] },
  "nonprofit-ngo": { label: "NGO / Non-Profit Website", options: ["Charity Website", "Church Website", "Donation Platform", "Community Outreach Website"] },
  "landing-page": { label: "Landing Page", options: ["Product Landing Page", "Marketing Funnel Page", "Event Landing Page", "Sales Page"] },
  "erp-system": { label: "ERP / Business System", options: ["Business Management System", "Inventory System", "HR Management System", "Finance Management System"] },
  "ai-system": { label: "AI System", options: ["AI Chatbot System", "AI Content Generator", "AI Automation System", "AI SaaS Product"] },
  "gaming-entertainment": { label: "Entertainment Website", options: ["Streaming Platform", "Video Platform", "Music Platform", "Gaming Platform"] },
};

const categoryLabel: Record<string, string> = {};
const subServiceLabel: Record<string, string> = {};
for (const [catValue, cat] of Object.entries(serviceStructure)) {
  categoryLabel[catValue] = cat.label;
  for (const opt of cat.options) {
    subServiceLabel[slugify(opt)] = opt;
  }
}
categoryLabel["not-sure"] = "Not sure — recommend for me";

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
