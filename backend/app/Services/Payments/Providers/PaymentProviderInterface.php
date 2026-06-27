<?php

namespace App\Services\Payments\Providers;

interface PaymentProviderInterface
{
    public function initialize(array $data): array;
    public function verify(string $reference): array;
    public function webhook(array $payload, array $headers): array;
}
