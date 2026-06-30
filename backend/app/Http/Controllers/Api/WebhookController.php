<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceOrder;
use App\Services\CheckoutService;
use App\Services\Payments\PaymentService;
use App\Services\ServiceOrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        private CheckoutService $checkoutService,
        private PaymentService $paymentService,
        private ServiceOrderService $serviceOrderService,
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
            $webhookResult = $this->paymentService->handleWebhook($gateway, $payload, $headers);

            if (!$webhookResult['success']) {
                Log::warning("Webhook validation failed for {$gateway}", [
                    'reason' => $webhookResult['error'] ?? 'unknown',
                ]);
                return response()->json($webhookResult);
            }

            $reference = $webhookResult['reference'];

            if (str_starts_with($reference, 'SVC-')) {
                return $this->handleServiceOrderWebhook($reference, $webhookResult);
            }

            return $this->checkoutService->handleWebhook($gateway, $payload, $headers);

        } catch (\Exception $e) {
            Log::error("Webhook handling error for {$gateway}", [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['received' => true]);
        }
    }

    private function handleServiceOrderWebhook(string $reference, array $webhookResult): \Illuminate\Http\JsonResponse
    {
        Log::info('Webhook processing service order payment', ['reference' => $reference]);

        $order = ServiceOrder::with(['service', 'projectType', 'package'])
            ->where('transaction_reference', $reference)
            ->first();

        if (!$order) {
            Log::warning('Webhook: service order not found', ['reference' => $reference]);
            return response()->json(['received' => true]);
        }

        if ($order->payment_status === 'paid' || $order->payment_status === 'completed') {
            Log::info('Webhook: service order already paid', ['order_id' => $order->id]);
            return response()->json(['received' => true]);
        }

        if ($webhookResult['status'] !== 'completed') {
            Log::warning('Webhook: service order payment not completed', [
                'order_id' => $order->id,
                'status' => $webhookResult['status'],
            ]);
            return response()->json(['received' => true]);
        }

        try {
            $this->serviceOrderService->processVerifiedPayment($order, $reference, $webhookResult);

            Log::info('Webhook: service order payment processed', [
                'order_id' => $order->id,
                'reference' => $reference,
            ]);
        } catch (\Exception $e) {
            Log::error('Webhook: service order processing failed', [
                'order_id' => $order->id,
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json(['received' => true]);
    }
}
