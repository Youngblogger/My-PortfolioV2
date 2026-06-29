import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers | CODEMAFIA",
  description:
    "Join CODEMAFIA and build the future of software engineering. Explore career opportunities.",
  openGraph: {
    title: "Careers | CODEMAFIA",
    description:
      "Join CODEMAFIA and build the future of software engineering. Explore career opportunities.",
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
