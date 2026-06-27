<?php

namespace Database\Factories;

use App\Models\PricingTier;
use Illuminate\Database\Eloquent\Factories\Factory;

class PricingTierFactory extends Factory
{
    protected $model = PricingTier::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Basic', 'Standard', 'Premium', 'Enterprise', 'Starter', 'Pro']),
            'price_ngn' => fake()->randomFloat(2, 10000, 150000),
            'price_usd' => fake()->randomFloat(2, 10, 150),
            'description' => fake()->sentence(),
            'features' => [fake()->sentence(), fake()->sentence(), fake()->sentence()],
            'is_popular' => false,
            'is_active' => true,
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }

    public function popular(): static
    {
        return $this->state(fn() => ['is_popular' => true]);
    }
}
