<?php

namespace App\Services\Payments;

use App\Services\Payments\Providers\PaystackProvider;
use App\Services\Payments\Providers\FlutterwaveProvider;
use App\Services\Payments\Providers\PaymentProviderInterface;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    private array $providers = [];

    public function provider(string $gateway): PaymentProviderInterface
    {
        if (!isset($this->providers[$gateway])) {
            $this->providers[$gateway] = match ($gateway) {
                'paystack' => new PaystackProvider(),
                'flutterwave' => new FlutterwaveProvider(),
                default => throw new \InvalidArgumentException("Unsupported payment gateway: {$gateway}"),
            };
        }

        return $this->providers[$gateway];
    }

    public function initializePayment(string $gateway, array $data): array
    {
        $this->validateConfig($gateway);
        return $this->provider($gateway)->initialize($data);
    }

    public function verifyPayment(string $gateway, string $reference): array
    {
        $this->validateConfig($gateway);
        return $this->provider($gateway)->verify($reference);
    }

    public function handleWebhook(string $gateway, array $payload, array $headers): array
    {
        $this->validateConfig($gateway);
        return $this->provider($gateway)->webhook($payload, $headers);
    }

    private function validateConfig(string $gateway): void
    {
        $gatewayConfig = config("services.{$gateway}");

        if (!$gatewayConfig || empty($gatewayConfig['secret_key'])) {
            Log::error("Payment gateway '{$gateway}' is not configured");
            throw new \RuntimeException("Payment gateway '{$gateway}' is not configured");
        }
    }
}
