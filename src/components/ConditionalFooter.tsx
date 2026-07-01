"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/footer";

const HIDE_FOOTER_PREFIXES = [
  "/dashboard",
  "/academy/dashboard",
  "/academy/enrollment",
  "/proposals",
  "/notifications",
  "/messages",
  "/payments",
  "/downloads",
  "/profile",
  "/settings",
  "/auth",
  "/hire/checkout",
  "/admin",
];

export default function ConditionalFooter() {
  const pathname = usePathname();
  const hide = HIDE_FOOTER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (hide) return null;
  return <Footer />;
}
