import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | CODEMAFIA",
  description:
    "Explore CODEMAFIA's pricing plans for software development services and academy programs.",
  openGraph: {
    title: "Pricing | CODEMAFIA",
    description:
      "Explore CODEMAFIA's pricing plans for software development services and academy programs.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
