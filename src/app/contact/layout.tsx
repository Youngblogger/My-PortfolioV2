import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | CODEMAFIA",
  description:
    "Get in touch with CODEMAFIA for software engineering, consulting, and partnership inquiries.",
  openGraph: {
    title: "Contact | CODEMAFIA",
    description:
      "Get in touch with CODEMAFIA for software engineering, consulting, and partnership inquiries.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
