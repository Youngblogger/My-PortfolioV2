import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | CODEMAFIA",
  description:
    "Browse CODEMAFIA's portfolio of software engineering projects and case studies.",
  openGraph: {
    title: "Projects | CODEMAFIA",
    description:
      "Browse CODEMAFIA's portfolio of software engineering projects and case studies.",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
