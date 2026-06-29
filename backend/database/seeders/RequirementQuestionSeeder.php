<?php

namespace Database\Seeders;

use App\Models\RequirementQuestion;
use App\Models\Service;
use App\Models\ProjectType;
use Illuminate\Database\Seeder;

class RequirementQuestionSeeder extends Seeder
{
    public function run(): void
    {
        $services = Service::where('is_active', true)->get()->keyBy('slug');
        $webDev = $services->get('web-development');
        $business = ProjectType::where('slug', 'business-website')->first();
        $ecommerce = ProjectType::where('slug', 'e-commerce-store')->first();

        $commonQuestions = [
            ['question_key' => 'industry', 'question' => 'What industry is your business in?', 'type' => 'select', 'sort_order' => 1, 'is_required' => true],
            ['question_key' => 'pages_count', 'question' => 'How many pages do you need?', 'type' => 'select', 'sort_order' => 2, 'is_required' => true],
            ['question_key' => 'need_blog', 'question' => 'Do you need a blog?', 'type' => 'boolean', 'sort_order' => 3],
            ['question_key' => 'need_auth', 'question' => 'Do you need user authentication/login?', 'type' => 'boolean', 'sort_order' => 4],
            ['question_key' => 'need_payments', 'question' => 'Do you need payment integration?', 'type' => 'boolean', 'sort_order' => 5],
            ['question_key' => 'need_booking', 'question' => 'Do you need booking/reservation system?', 'type' => 'boolean', 'sort_order' => 6],
            ['question_key' => 'need_multilingual', 'question' => 'Do you need multilingual support?', 'type' => 'boolean', 'sort_order' => 7],
            ['question_key' => 'need_admin', 'question' => 'Do you need an admin dashboard?', 'type' => 'boolean', 'sort_order' => 8],
            ['question_key' => 'need_cms', 'question' => 'Do you need a content management system?', 'type' => 'boolean', 'sort_order' => 9],
            ['question_key' => 'need_seo', 'question' => 'Do you need SEO optimization?', 'type' => 'boolean', 'sort_order' => 10],
            ['question_key' => 'need_hosting', 'question' => 'Do you need hosting setup?', 'type' => 'boolean', 'sort_order' => 11],
            ['question_key' => 'need_maintenance', 'question' => 'Do you need ongoing maintenance?', 'type' => 'boolean', 'sort_order' => 12],
            ['question_key' => 'reference_websites', 'question' => 'Any reference websites you like?', 'type' => 'text', 'sort_order' => 13],
            ['question_key' => 'additional_notes', 'question' => 'Any additional notes or requirements?', 'type' => 'textarea', 'sort_order' => 14],
        ];

        foreach ($commonQuestions as $q) {
            if ($q['question_key'] === 'industry') {
                $q['options'] = ['Restaurant', 'Healthcare', 'Education', 'Real Estate', 'Corporate', 'NGO', 'E-commerce', 'Other'];
            }
            if ($q['question_key'] === 'pages_count') {
                $q['options'] = ['1-3 pages', '4-6 pages', '7-10 pages', '10+ pages'];
            }

            RequirementQuestion::create(array_merge($q, [
                'service_id' => $webDev?->id,
                'project_type_id' => null,
                'description' => null,
            ]));
        }

        if ($ecommerce) {
            RequirementQuestion::create([
                'service_id' => $webDev?->id,
                'project_type_id' => $ecommerce->id,
                'question_key' => 'product_count',
                'question' => 'How many products do you plan to sell?',
                'type' => 'select',
                'options' => ['Less than 50', '50-200', '200-1000', '1000+'],
                'sort_order' => 3,
                'is_required' => true,
            ]);

            RequirementQuestion::create([
                'service_id' => $webDev?->id,
                'project_type_id' => $ecommerce->id,
                'question_key' => 'need_multi_vendor',
                'question' => 'Do you need multi-vendor marketplace support?',
                'type' => 'boolean',
                'sort_order' => 10,
            ]);
        }
    }
}
