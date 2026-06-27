import type {
  PaymentProvider,
  PaymentInitializationData,
  PaymentInitializationResult,
  PaymentVerificationResult,
  WebhookResult,
  GatewayConfig,
} from "./types";

export function createPaystackProvider(config: GatewayConfig): PaymentProvider {
  const apiBase = "https://api.paystack.co";

  async function apiRequest(endpoint: string, options?: RequestInit) {
    const res = await fetch(`${apiBase}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    return res.json();
  }

  return {
    name: "paystack",

    async initialize(
      data: PaymentInitializationData
    ): Promise<PaymentInitializationResult> {
      try {
        const response = await apiRequest("/transaction/initialize", {
          method: "POST",
          body: JSON.stringify({
            email: data.email,
            amount: Math.round(data.amount * 100),
            currency: data.currency || "NGN",
            reference: data.reference,
            callback_url: data.callback_url,
            metadata: data.metadata,
          }),
        });

        if (!response.status) {
          return {
            success: false,
            reference: data.reference,
            authorization_url: "",
            error: response.message || "Payment initialization failed",
          };
        }

        return {
          success: true,
          reference: response.data.reference,
          authorization_url: response.data.authorization_url,
          access_code: response.data.access_code,
          gateway_response: response,
        };
      } catch (error) {
        return {
          success: false,
          reference: data.reference,
          authorization_url: "",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },

    async verify(reference: string): Promise<PaymentVerificationResult> {
      try {
        const response = await apiRequest(
          `/transaction/verify/${encodeURIComponent(reference)}`
        );

        if (!response.status) {
          return {
            success: false,
            status: "failed",
            amount: 0,
            currency: "NGN",
            gateway_response: response,
            error: response.message || "Verification failed",
          };
        }

        return {
          success: response.data.status === "success",
          status: response.data.status,
          amount: response.data.amount / 100,
          currency: response.data.currency,
          gateway_response: response,
        };
      } catch (error) {
        return {
          success: false,
          status: "failed",
          amount: 0,
          currency: "NGN",
          gateway_response: {},
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },

    async webhook(body: Record<string, unknown>): Promise<WebhookResult> {
      try {
        const event = body.event;
        const data = body.data as Record<string, unknown> | undefined;

        return {
          success: event === "charge.success",
          event: (event as string) || "",
          reference: (data?.reference as string) || "",
          status: (data?.status as string) || "unknown",
          gateway_response: body,
        };
      } catch (error) {
        return {
          success: false,
          event: "error",
          reference: "",
          status: "failed",
          gateway_response: {},
        };
      }
    },
  };
}
