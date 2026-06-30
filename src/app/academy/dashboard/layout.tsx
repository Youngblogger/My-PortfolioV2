import type { Metadata } from "next";
import ClientPortalLayout from "@/components/ClientPortalLayout";

export const metadata: Metadata = {
  title: "My Academy | CODEMAFIA",
  description:
    "Your CODEMAFIA Academy dashboard - track your courses and progress.",
};

export default function AcademyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientPortalLayout>{children}</ClientPortalLayout>;
}
