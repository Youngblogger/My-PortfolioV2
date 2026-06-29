import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | CODEMAFIA",
  description:
    "Read CODEMAFIA's terms of service and conditions of use.",
  openGraph: {
    title: "Terms of Service | CODEMAFIA",
    description:
      "Read CODEMAFIA's terms of service and conditions of use.",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
