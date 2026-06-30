import type { Metadata } from "next";
import ClientPortalLayout from "@/components/ClientPortalLayout";

export const metadata: Metadata = {
  title: "Proposals | CODEMAFIA",
  description:
    "Manage your CODEMAFIA project proposals.",
  openGraph: {
    title: "Proposals | CODEMAFIA",
    description:
      "Manage your CODEMAFIA project proposals.",
  },
};

export default function ProposalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientPortalLayout>{children}</ClientPortalLayout>;
}
