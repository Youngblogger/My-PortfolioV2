import type { Metadata } from "next";
import ClientPortalLayout from "@/components/ClientPortalLayout";

export const metadata: Metadata = {
  title: "Notifications | CODEMAFIA",
  description:
    "View your CODEMAFIA notifications and updates.",
  openGraph: {
    title: "Notifications | CODEMAFIA",
    description:
      "View your CODEMAFIA notifications and updates.",
  },
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientPortalLayout>{children}</ClientPortalLayout>;
}
