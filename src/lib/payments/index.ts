import { createPaystackProvider } from "./paystack";
import { createFlutterwaveProvider } from "./flutterwave";
import type {
  PaymentProvider,
  GatewayConfig,
  PaymentInitializationData,
  PaymentInitializationResult,
  PaymentVerificationResult,
} from "./types";

export type { PaymentProvider, GatewayConfig } from "./types";

const providers = new Map<string, PaymentProvider>();

export function getPaymentProvider(
  gateway: "paystack" | "flutterwave"
): PaymentProvider {
  const existing = providers.get(gateway);
  if (existing) return existing;

  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;

  if (gateway === "paystack" && !paystackSecretKey) {
    throw new Error("PAYSTACK_SECRET_KEY environment variable is not set");
  }
  if (gateway === "flutterwave" && !flutterwaveSecretKey) {
    throw new Error("FLUTTERWAVE_SECRET_KEY environment variable is not set");
  }

  const configs: Record<string, GatewayConfig> = {
    paystack: {
      publicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
      secretKey: paystackSecretKey || "",
    },
    flutterwave: {
      publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || "",
      secretKey: flutterwaveSecretKey || "",
    },
  };

  const config = configs[gateway];

  const provider =
    gateway === "paystack"
      ? createPaystackProvider(config)
      : createFlutterwaveProvider(config);

  providers.set(gateway, provider);
  return provider;
}

export async function initializePayment(
  gateway: "paystack" | "flutterwave",
  data: PaymentInitializationData
): Promise<PaymentInitializationResult> {
  const provider = getPaymentProvider(gateway);
  return provider.initialize(data);
}

export async function verifyPayment(
  gateway: "paystack" | "flutterwave",
  reference: string
): Promise<PaymentVerificationResult> {
  const provider = getPaymentProvider(gateway);
  return provider.verify(reference);
}

export { createPaystackProvider } from "./paystack";
export { createFlutterwaveProvider } from "./flutterwave";
