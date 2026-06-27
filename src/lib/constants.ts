export const ACADEMY_NAME = "CODEMAFIA Academy";
export const ACADEMY_EMAIL = "academy@codemafia.ng";
export const ACADEMY_PHONE = "+234800CODEMAFIA";
export const ACADEMY_ADDRESS = "Lagos, Nigeria";

export const CURRENCIES = {
  NGN: { symbol: "₦", code: "NGN", name: "Nigerian Naira" },
  USD: { symbol: "$", code: "USD", name: "US Dollar" },
  EUR: { symbol: "€", code: "EUR", name: "Euro" },
  GBP: { symbol: "£", code: "GBP", name: "British Pound" },
} as const;

export const TAX_RATES: Record<string, number> = {
  NG: 0.075, // 7.5% VAT
  US: 0.0,
  GB: 0.2,
  default: 0.0,
};

export const PAYMENT_GATEWAYS = {
  paystack: {
    name: "Paystack",
    description: "Pay with card, bank transfer, or USSD",
    supported_cards: "Visa, Mastercard, Verve, American Express",
    processing_speed: "Instant",
    fees: "1.5% + ₦100",
    logo: "/payments/paystack.svg",
  },
  flutterwave: {
    name: "Flutterwave",
    description: "Pay with card, bank transfer, or mobile money",
    supported_cards: "Visa, Mastercard, Verve, Discover",
    processing_speed: "Instant",
    fees: "1.4% + ₦0",
    logo: "/payments/flutterwave.svg",
  },
} as const;

export const ENROLLMENT_NUMBER_PREFIX = "CMA";
export const INVOICE_PREFIX = "INV-CMA";
export const RECEIPT_PREFIX = "RCT-CMA";

export const STACKS: Record<string, { title: string }> = {
  frontend: { title: "Frontend Engineering" },
  backend: { title: "Backend Engineering" },
  fullstack: { title: "Full-Stack Engineering" },
  mobile: { title: "Mobile Development" },
  ai: { title: "AI & Machine Learning" },
};
