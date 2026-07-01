import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export function formatCurrency(amount: number, currency = "NGN"): string {
  const symbols: Record<string, string> = {
    NGN: "₦",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString()}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function generateReference(prefix = "CMA"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function calculateDiscount(
  price: number,
  couponType?: "percentage" | "fixed",
  couponValue?: number
): number {
  if (!couponType || !couponValue) return 0;
  if (couponType === "percentage") {
    return Math.round(price * (couponValue / 100));
  }
  return Math.min(couponValue, price);
}

export function calculateTax(
  amount: number,
  country = "NG"
): { rate: number; amount: number } {
  const taxRates: Record<string, number> = {
    NG: 0.075,
    US: 0,
    GB: 0.2,
  };
  const rate = taxRates[country] || 0;
  return { rate, amount: Math.round(amount * rate) };
}

export function cnMerger(...inputs: (string | undefined | false | null)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

export function sanitizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "";
  }
  return url;
}

export function formatRelativeTime(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return "just now";
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears}y ago`;
}

export function getDaysRemaining(date: string | Date): number {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
