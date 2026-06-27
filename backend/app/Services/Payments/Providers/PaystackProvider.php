<?php

namespace App\Services\Payments\Providers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackProvider implements PaymentProviderInterface
{
    private string $secretKey;
    private string $publicKey;
    private string $webhookSecret;

    public function __construct()
    {
        $this->secretKey = config('services.paystack.secret_key');
        $this->publicKey = config('services.paystack.public_key');
        $this->webhookSecret = config('services.paystack.webhook_secret');
    }

    public function initialize(array $data): array
    {
        $response = Http::withToken($this->secretKey)
            ->post('https://api.paystack.co/transaction/initialize', [
                'email' => $data['email'],
                'amount' => $data['amount'] * 100,
                'currency' => $data['currency'] ?? 'NGN',
                'reference' => $data['reference'],
                'callback_url' => $data['callback_url'],
                'metadata' => $data['metadata'] ?? [],
            ]);

        if (!$response->successful()) {
            Log::error('Paystack initialization failed', [
                'response' => $response->json(),
                'reference' => $data['reference'],
            ]);
            throw new \RuntimeException('Payment initialization failed: ' . ($response->json()['message'] ?? 'Unknown error'));
        }

        $result = $response->json();

        return [
            'authorization_url' => $result['data']['authorization_url'],
            'reference' => $result['data']['reference'],
            'access_code' => $result['data']['access_code'] ?? null,
        ];
    }

    public function verify(string $reference): array
    {
        $response = Http::withToken($this->secretKey)
            ->get("https://api.paystack.co/transaction/verify/{$reference}");

        if (!$response->successful()) {
            Log::error('Paystack verification failed', [
                'reference' => $reference,
                'response' => $response->json(),
            ]);
            throw new \RuntimeException('Payment verification failed');
        }

        $result = $response->json()['data'];

        return [
            'status' => $result['status'] === 'success' ? 'completed' : ($result['status'] === 'failed' ? 'failed' : 'pending'),
            'amount' => $result['amount'] / 100,
            'currency' => $result['currency'],
            'gateway_response' => $result,
        ];
    }

    public function webhook(array $payload, array $headers): array
    {
        $signature = $headers['x-paystack-signature'] ?? '';

        $computed = hash_hmac('sha512', json_encode($payload), $this->webhookSecret);

        if (!hash_equals($computed, $signature)) {
            Log::warning('Paystack webhook: invalid signature');
            return ['success' => false, 'error' => 'Invalid signature'];
        }

        if (($payload['event'] ?? '') !== 'charge.success') {
            return ['success' => false, 'error' => 'Unhandled event'];
        }

        $data = $payload['data'];

        return [
            'success' => true,
            'reference' => $data['reference'] ?? $data['tx_ref'] ?? '',
            'amount' => ($data['amount'] ?? 0) / 100,
            'currency' => $data['currency'] ?? 'NGN',
            'gateway_response' => $data,
        ];
    }
}
