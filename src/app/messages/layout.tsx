import ClientPortalLayout from "@/components/ClientPortalLayout";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientPortalLayout>{children}</ClientPortalLayout>;
}
