import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://codemafia.ng"),
  title: "CODEMAFIA | Learn the Skill. Build the Future.",
  description:
    "Learn modern software development, build real-world products, and work with industry professionals at CODEMAFIA.",
  keywords: [
    "CODEMAFIA",
    "software engineering",
    "coding academy",
    "Africa tech",
    "web development",
    "software development",
  ],
  icons: {
    icon: "/iconLogo.png",
  },
  openGraph: {
    title: "CODEMAFIA | Engineering Excellence. Inspiring Innovation.",
    description:
      "Engineering Excellence. Inspiring Innovation. Master modern software development, build real-world products.",
    url: "https://codemafia.ng",
    siteName: "CODEMAFIA",
    images: [
      {
        url: "/iconLogo.png",
        width: 800,
        height: 600,
        alt: "CODEMAFIA",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CODEMAFIA | Engineering Excellence. Inspiring Innovation.",
    description:
      "Engineering Excellence. Inspiring Innovation. Master modern software development, build real-world products.",
    images: ["/iconLogo.png"],
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
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-gold focus:text-background focus:rounded-lg focus:font-bold focus:outline-none">
          Skip to content
        </a>
        <Nav />
        <main id="main-content">
          <ClientLayout>{children}</ClientLayout>
        </main>
        <Footer />
      </body>
    </html>
  );
}
