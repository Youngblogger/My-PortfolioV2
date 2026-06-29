import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academy | CODEMAFIA",
  description:
    "Learn modern software development at CODEMAFIA Academy. Master coding skills with industry experts.",
  openGraph: {
    title: "Academy | CODEMAFIA",
    description:
      "Learn modern software development at CODEMAFIA Academy. Master coding skills with industry experts.",
  },
};

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
