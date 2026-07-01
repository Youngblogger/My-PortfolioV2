"use client";

interface CopyrightProps {
  startYear?: number;
  brand?: string;
  className?: string;
}

export function Copyright({
  startYear = 2026,
  brand = "CODEMAFIA",
  className,
}: CopyrightProps) {
  const currentYear = new Date().getFullYear();
  const year =
    currentYear > startYear ? `${startYear}\u2013${currentYear}` : `${startYear}`;

  return (
    <span className={className}>
      &copy; {year} {brand}. All rights reserved.
    </span>
  );
}
