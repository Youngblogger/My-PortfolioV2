import type { Metadata } from "next";
import AdminLayoutClient from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: "Admin | CODEMAFIA",
  description:
    "CODEMAFIA admin panel - manage orders, proposals, services, and more.",
  openGraph: {
    title: "Admin | CODEMAFIA",
    description:
      "CODEMAFIA admin panel - manage orders, proposals, services, and more.",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
