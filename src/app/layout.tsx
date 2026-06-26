import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CODEMAFIA | Building Africa's Next Generation of Software Engineers",
  description:
    "Learn modern software development, build real-world products, and work with industry professionals at CODEMAFIA Academy.",
  keywords: [
    "CODEMAFIA",
    "software engineering",
    "coding academy",
    "Africa tech",
    "web development",
    "software development",
  ],
  icons: {
    icon: "/CodemafiaLogo.png",
  },
  openGraph: {
    title: "CODEMAFIA | Software Engineering Academy",
    description:
      "Building Africa's Next Generation of Software Engineers. Master modern software development, build real-world products.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
