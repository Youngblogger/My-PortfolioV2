<?php

namespace App\Services\Payments\Providers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FlutterwaveProvider implements PaymentProviderInterface
{
    private string $secretKey;
    private string $publicKey;
    private string $webhookSecret;
    private string $encryptionKey;

    public function __construct()
    {
        $this->secretKey = config('services.flutterwave.secret_key');
        $this->publicKey = config('services.flutterwave.public_key');
        $this->webhookSecret = config('services.flutterwave.webhook_secret');
        $this->encryptionKey = config('services.flutterwave.encryption_key');
    }

    public function initialize(array $data): array
    {
        $response = Http::withToken($this->secretKey)
            ->post('https://api.flutterwave.com/v3/payments', [
                'tx_ref' => $data['reference'],
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'NGN',
                'redirect_url' => $data['callback_url'],
                'customer' => [
                    'email' => $data['email'],
                    'name' => $data['customer_name'] ?? '',
                    'phone_number' => $data['customer_phone'] ?? '',
                ],
                'customizations' => [
                    'title' => 'CODEMAFIA Academy',
                    'description' => 'Course Enrollment',
                    'logo' => $data['logo'] ?? '',
                ],
                'meta' => $data['metadata'] ?? [],
            ]);

        if (!$response->successful()) {
            Log::error('Flutterwave initialization failed', [
                'response' => $response->json(),
                'reference' => $data['reference'],
            ]);
            throw new \RuntimeException('Payment initialization failed: ' . ($response->json()['message'] ?? 'Unknown error'));
        }

        $result = $response->json();

        return [
            'authorization_url' => $result['data']['link'],
            'reference' => $result['data']['tx_ref'],
        ];
    }

    public function verify(string $reference): array
    {
        $response = Http::withToken($this->secretKey)
            ->get("https://api.flutterwave.com/v3/transactions/{$reference}/verify");

        if (!$response->successful()) {
            Log::error('Flutterwave verification failed', [
                'reference' => $reference,
                'response' => $response->json(),
            ]);
            throw new \RuntimeException('Payment verification failed');
        }

        $result = $response->json()['data'];

        return [
            'status' => ($result['status'] === 'successful') ? 'completed' : ($result['status'] === 'failed' ? 'failed' : 'pending'),
            'amount' => $result['amount'],
            'currency' => $result['currency'],
            'gateway_response' => $result,
        ];
    }

    public function webhook(array $payload, array $headers): array
    {
        $signature = $headers['verif-hash'] ?? '';

        if ($signature !== $this->webhookSecret) {
            Log::warning('Flutterwave webhook: invalid signature');
            return ['success' => false, 'error' => 'Invalid signature'];
        }

        if (($payload['event'] ?? '') !== 'charge.completed') {
            return ['success' => false, 'error' => 'Unhandled event'];
        }

        $data = $payload['data'];

        if (($data['status'] ?? '') !== 'successful') {
            return ['success' => false, 'error' => 'Payment not successful'];
        }

        return [
            'success' => true,
            'reference' => $data['tx_ref'] ?? '',
            'amount' => $data['amount'] ?? 0,
            'currency' => $data['currency'] ?? 'NGN',
            'gateway_response' => $data,
        ];
    }
}
