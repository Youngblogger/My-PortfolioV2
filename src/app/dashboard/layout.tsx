import type { Metadata } from "next";
import ClientPortalLayout from "@/components/ClientPortalLayout";

export const metadata: Metadata = {
  title: "Dashboard | CODEMAFIA",
  description:
    "Your CODEMAFIA dashboard - manage your projects, billing, and account.",
  openGraph: {
    title: "Dashboard | CODEMAFIA",
    description:
      "Your CODEMAFIA dashboard - manage your projects, billing, and account.",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientPortalLayout>{children}</ClientPortalLayout>;
}
