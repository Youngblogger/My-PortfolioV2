import type { Metadata } from "next";
import ClientPortalLayout from "@/components/ClientPortalLayout";

export const metadata: Metadata = {
  title: "Checkout | CODEMAFIA",
  description:
    "Complete your CODEMAFIA service order.",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientPortalLayout>{children}</ClientPortalLayout>;
}
