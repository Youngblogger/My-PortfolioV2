import type {
  PaymentProvider,
  PaymentInitializationData,
  PaymentInitializationResult,
  PaymentVerificationResult,
  WebhookResult,
  GatewayConfig,
} from "./types";

export function createFlutterwaveProvider(config: GatewayConfig): PaymentProvider {
  const apiBase = "https://api.flutterwave.com/v3";

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
    name: "flutterwave",

    async initialize(
      data: PaymentInitializationData
    ): Promise<PaymentInitializationResult> {
      try {
        const response = await apiRequest("/payments", {
          method: "POST",
          body: JSON.stringify({
            tx_ref: data.reference,
            amount: data.amount,
            currency: data.currency || "NGN",
            redirect_url: data.callback_url,
            customer: {
              email: data.email,
            },
            meta: data.metadata,
            customizations: {
              title: "CODEMAFIA Academy",
              description: "Course Enrollment Payment",
            },
          }),
        });

        if (response.status !== "success") {
          return {
            success: false,
            reference: data.reference,
            authorization_url: "",
            error: response.message || "Payment initialization failed",
          };
        }

        return {
          success: true,
          reference: data.reference,
          authorization_url: response.data.link,
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
          `/transactions/${encodeURIComponent(reference)}/verify`
        );

        if (response.status !== "success") {
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
          success: response.data.status === "successful",
          status: response.data.status,
          amount: response.data.amount,
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
          success: event === "charge.completed" && (data?.status as string) === "successful",
          event: (event as string) || "",
          reference: (data?.tx_ref as string) || "",
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
