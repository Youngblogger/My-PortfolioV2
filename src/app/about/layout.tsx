import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | CODEMAFIA",
  description:
    "Learn about CODEMAFIA - a premium software engineering company building innovative solutions.",
  openGraph: {
    title: "About | CODEMAFIA",
    description:
      "Learn about CODEMAFIA - a premium software engineering company building innovative solutions.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
