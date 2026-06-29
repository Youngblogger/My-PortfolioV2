import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hire Us | CODEMAFIA",
  description:
    "Hire CODEMAFIA for premium software development, consulting, and design services.",
  openGraph: {
    title: "Hire Us | CODEMAFIA",
    description:
      "Hire CODEMAFIA for premium software development, consulting, and design services.",
  },
};

export default function HireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
