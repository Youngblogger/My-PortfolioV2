<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            NumberSequenceSeeder::class,
            CourseSeeder::class,
            PricingTierSeeder::class,
            ModuleSeeder::class,
            ServiceSeeder::class,
        ]);
    }
}
