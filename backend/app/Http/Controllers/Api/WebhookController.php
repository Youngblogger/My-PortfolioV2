<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        private CheckoutService $checkoutService,
    ) {}

    public function handle(Request $request, string $gateway)
    {
        $payload = $request->all();
        $headers = [];

        foreach ($request->headers as $key => $values) {
            $headers[$key] = is_array($values) ? ($values[0] ?? '') : $values;
        }

        Log::info("Webhook received from {$gateway}", [
            'event' => $payload['event'] ?? 'unknown',
        ]);

        try {
            $result = $this->checkoutService->handleWebhook($gateway, $payload, $headers);
            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Webhook handling error for {$gateway}", [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['received' => true]);
        }
    }
}
