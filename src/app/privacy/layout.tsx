import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CODEMAFIA",
  description:
    "Read CODEMAFIA's privacy policy to understand how we handle your data.",
  openGraph: {
    title: "Privacy Policy | CODEMAFIA",
    description:
      "Read CODEMAFIA's privacy policy to understand how we handle your data.",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
