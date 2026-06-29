"use client";

import dynamic from "next/dynamic";

const HireProgressBar = dynamic(
  () => import("@/components/hire/HireProgressBar"),
  { ssr: false }
);

export default function HireProgressBarWrapper() {
  return <HireProgressBar />;
}
