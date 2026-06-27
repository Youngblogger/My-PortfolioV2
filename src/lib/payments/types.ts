export interface PaymentProvider {
  name: string;
  initialize(data: PaymentInitializationData): Promise<PaymentInitializationResult>;
  verify(reference: string): Promise<PaymentVerificationResult>;
  webhook(data: Record<string, unknown>): Promise<WebhookResult>;
}

export interface WebhookPayload {
  body: string;
  headers: Record<string, string>;
  gateway: "paystack" | "flutterwave";
}

export interface PaymentInitializationData {
  email: string;
  amount: number;
  currency: string;
  reference: string;
  metadata?: Record<string, unknown>;
  callback_url: string;
}

export interface PaymentInitializationResult {
  success: boolean;
  reference: string;
  authorization_url: string;
  access_code?: string;
  gateway_response?: Record<string, unknown>;
  error?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  status: string;
  amount: number;
  currency: string;
  gateway_response: Record<string, unknown>;
  error?: string;
}

export interface WebhookResult {
  success: boolean;
  event: string;
  reference: string;
  status: string;
  gateway_response: Record<string, unknown>;
}

export interface GatewayConfig {
  publicKey: string;
  secretKey: string;
  webhookSecret?: string;
}
