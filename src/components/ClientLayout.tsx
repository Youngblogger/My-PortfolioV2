"use client";

import { BookingProvider } from "@/contexts/BookingContext";
import { type ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <BookingProvider>{children}</BookingProvider>;
}
