import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community | CODEMAFIA",
  description:
    "Join the CODEMAFIA community of developers, engineers, and tech enthusiasts.",
  openGraph: {
    title: "Community | CODEMAFIA",
    description:
      "Join the CODEMAFIA community of developers, engineers, and tech enthusiasts.",
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
