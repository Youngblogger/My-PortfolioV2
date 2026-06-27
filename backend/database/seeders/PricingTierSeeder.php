<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\PricingTier;
use Illuminate\Database\Seeder;

class PricingTierSeeder extends Seeder
{
    public function run(): void
    {
        $tiers = [
            'frontend' => [
                ['name' => 'Starter', 'price_ngn' => 150000, 'price_usd' => 900, 'description' => 'Self-paced learning with full course access', 'features' => ['Full course access', 'Self-paced learning', 'Community support', 'Downloadable resources'], 'is_popular' => false, 'sort_order' => 1],
                ['name' => 'Standard', 'price_ngn' => 250000, 'price_usd' => 1500, 'description' => 'Everything in Starter plus live sessions and mentorship', 'features' => ['Everything in Starter', 'Live weekly sessions', '1-on-1 mentorship', 'Code reviews', 'Career coaching'], 'is_popular' => true, 'sort_order' => 2],
                ['name' => 'Pro Mentorship', 'price_ngn' => 350000, 'price_usd' => 2000, 'description' => 'Everything in Standard plus dedicated mentor and job placement', 'features' => ['Everything in Standard', 'Dedicated mentor', 'Job placement assistance', 'Interview preparation', 'Resume review', 'LinkedIn optimization'], 'is_popular' => false, 'sort_order' => 3],
            ],
            'backend' => [
                ['name' => 'Starter', 'price_ngn' => 150000, 'price_usd' => 900, 'description' => 'Self-paced learning with full course access', 'features' => ['Full course access', 'Self-paced learning', 'Community support', 'Downloadable resources'], 'is_popular' => false, 'sort_order' => 1],
                ['name' => 'Standard', 'price_ngn' => 250000, 'price_usd' => 1500, 'description' => 'Everything in Starter plus live sessions and mentorship', 'features' => ['Everything in Starter', 'Live weekly sessions', '1-on-1 mentorship', 'Code reviews', 'Career coaching'], 'is_popular' => true, 'sort_order' => 2],
                ['name' => 'Pro Mentorship', 'price_ngn' => 350000, 'price_usd' => 2000, 'description' => 'Everything in Standard plus dedicated mentor and job placement', 'features' => ['Everything in Standard', 'Dedicated mentor', 'Job placement assistance', 'Interview preparation', 'Resume review', 'LinkedIn optimization'], 'is_popular' => false, 'sort_order' => 3],
            ],
            'fullstack' => [
                ['name' => 'Starter', 'price_ngn' => 200000, 'price_usd' => 1200, 'description' => 'Self-paced learning with full course access', 'features' => ['Full course access', 'Self-paced learning', 'Community support', 'Downloadable resources'], 'is_popular' => false, 'sort_order' => 1],
                ['name' => 'Standard', 'price_ngn' => 350000, 'price_usd' => 2000, 'description' => 'Everything in Starter plus live sessions and mentorship', 'features' => ['Everything in Starter', 'Live weekly sessions', '1-on-1 mentorship', 'Code reviews', 'Career coaching'], 'is_popular' => true, 'sort_order' => 2],
                ['name' => 'Pro Mentorship', 'price_ngn' => 500000, 'price_usd' => 3000, 'description' => 'Everything in Standard plus dedicated mentor and job placement', 'features' => ['Everything in Standard', 'Dedicated mentor', 'Job placement assistance', 'Interview preparation', 'Resume review', 'LinkedIn optimization'], 'is_popular' => false, 'sort_order' => 3],
            ],
            'mobile' => [
                ['name' => 'Starter', 'price_ngn' => 150000, 'price_usd' => 900, 'description' => 'Self-paced learning with full course access', 'features' => ['Full course access', 'Self-paced learning', 'Community support', 'Downloadable resources'], 'is_popular' => false, 'sort_order' => 1],
                ['name' => 'Standard', 'price_ngn' => 250000, 'price_usd' => 1500, 'description' => 'Everything in Starter plus live sessions and mentorship', 'features' => ['Everything in Starter', 'Live weekly sessions', '1-on-1 mentorship', 'Code reviews', 'Career coaching'], 'is_popular' => true, 'sort_order' => 2],
                ['name' => 'Pro Mentorship', 'price_ngn' => 350000, 'price_usd' => 2000, 'description' => 'Everything in Standard plus dedicated mentor and job placement', 'features' => ['Everything in Standard', 'Dedicated mentor', 'Job placement assistance', 'Interview preparation', 'Resume review', 'LinkedIn optimization'], 'is_popular' => false, 'sort_order' => 3],
            ],
            'ai' => [
                ['name' => 'Starter', 'price_ngn' => 150000, 'price_usd' => 900, 'description' => 'Self-paced learning with full course access', 'features' => ['Full course access', 'Self-paced learning', 'Community support', 'Downloadable resources'], 'is_popular' => false, 'sort_order' => 1],
                ['name' => 'Standard', 'price_ngn' => 300000, 'price_usd' => 1800, 'description' => 'Everything in Starter plus live sessions and mentorship', 'features' => ['Everything in Starter', 'Live weekly sessions', '1-on-1 mentorship', 'Code reviews', 'Career coaching'], 'is_popular' => true, 'sort_order' => 2],
                ['name' => 'Pro Mentorship', 'price_ngn' => 400000, 'price_usd' => 2400, 'description' => 'Everything in Standard plus dedicated mentor and job placement', 'features' => ['Everything in Standard', 'Dedicated mentor', 'Job placement assistance', 'Interview preparation', 'Resume review', 'LinkedIn optimization'], 'is_popular' => false, 'sort_order' => 3],
            ],
        ];

        foreach ($tiers as $slug => $courseTiers) {
            $course = Course::where('slug', $slug)->first();
            if (!$course) continue;

            foreach ($courseTiers as $data) {
                PricingTier::updateOrCreate(
                    ['course_id' => $course->id, 'name' => $data['name']],
                    array_merge($data, ['course_id' => $course->id, 'is_active' => true])
                );
            }
        }
    }
}
