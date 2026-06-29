import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights | CODEMAFIA",
  description:
    "Read the latest insights, articles, and tutorials from CODEMAFIA on software engineering and technology.",
  openGraph: {
    title: "Insights | CODEMAFIA",
    description:
      "Read the latest insights, articles, and tutorials from CODEMAFIA on software engineering and technology.",
  },
};

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
