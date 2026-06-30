import type { Metadata } from "next";
import ClientPortalLayout from "@/components/ClientPortalLayout";

export const metadata: Metadata = {
  title: "Enrollment | CODEMAFIA",
  description:
    "Your CODEMAFIA course enrollment details.",
};

export default function EnrollmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientPortalLayout>{children}</ClientPortalLayout>;
}
