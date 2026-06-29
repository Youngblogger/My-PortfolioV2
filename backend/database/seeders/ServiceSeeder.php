<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ProjectType;
use App\Models\Package;
use App\Models\AddOn;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        // ---- Services ----
        $webDev = Service::updateOrCreate(
            ['slug' => 'web-development'],
            [
            'title' => 'Web Development',
            'subtitle' => 'Professional websites and web applications',
            'short_description' => 'Custom websites, e-commerce stores, and web applications built with modern technologies.',
            'description' => 'We build high-performance websites and web applications tailored to your business needs. From simple landing pages to complex enterprise platforms, our team delivers pixel-perfect, responsive, and scalable solutions.',
            'icon' => '🌐',
            'image_url' => '/images/services/web-dev.jpg',
            'starting_price_ngn' => 250000,
            'starting_price_usd' => 350,
            'estimated_delivery' => '2-4 weeks',
            'sort_order' => 1,
            'is_active' => true,
            'features' => ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'CMS Integration', 'Analytics'],
        ]);

        $saas = Service::updateOrCreate(
            ['slug' => 'saas-development'],
            [
            'title' => 'SaaS Development',
            'subtitle' => 'Scalable software as a service platforms',
            'short_description' => 'Full-featured SaaS platforms with subscription management, multi-tenancy, and more.',
            'description' => 'We design and build scalable SaaS platforms from the ground up. Our solutions include multi-tenant architecture, subscription billing, user management, and enterprise-grade security.',
            'icon' => '☁',
            'image_url' => '/images/services/saas.jpg',
            'starting_price_ngn' => 1500000,
            'starting_price_usd' => 2000,
            'estimated_delivery' => '6-12 weeks',
            'sort_order' => 2,
            'is_active' => true,
            'features' => ['Multi-Tenant', 'Subscription Billing', 'API-First', 'Scalable', 'Analytics Dashboard'],
        ]);

        $mobile = Service::updateOrCreate(
            ['slug' => 'mobile-development'],
            [
            'title' => 'Mobile Development',
            'subtitle' => 'Native and cross-platform mobile apps',
            'short_description' => 'iOS, Android, and cross-platform mobile applications with exceptional user experiences.',
            'description' => 'We create powerful mobile applications that engage users and drive business growth. Using React Native, Flutter, and native technologies, we deliver apps that perform flawlessly across all devices.',
            'icon' => '📱',
            'image_url' => '/images/services/mobile.jpg',
            'starting_price_ngn' => 800000,
            'starting_price_usd' => 1000,
            'estimated_delivery' => '4-8 weeks',
            'sort_order' => 3,
            'is_active' => true,
            'features' => ['iOS & Android', 'Offline Support', 'Push Notifications', 'Real-Time Sync', 'App Store Deployment'],
        ]);

        $uiux = Service::updateOrCreate(
            ['slug' => 'ui-ux-design'],
            [
            'title' => 'UI/UX Design',
            'subtitle' => 'Beautiful and intuitive user experiences',
            'short_description' => 'User-centered design solutions that delight users and drive conversions.',
            'description' => 'Our design team creates intuitive, accessible, and visually stunning interfaces. We follow a human-centered design process to ensure every pixel serves a purpose and every interaction feels natural.',
            'icon' => '🎨',
            'image_url' => '/images/services/uiux.jpg',
            'starting_price_ngn' => 350000,
            'starting_price_usd' => 500,
            'estimated_delivery' => '2-4 weeks',
            'sort_order' => 4,
            'is_active' => true,
            'features' => ['User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Usability Testing'],
        ]);

        $ai = Service::updateOrCreate(
            ['slug' => 'ai-solutions'],
            [
            'title' => 'AI Solutions',
            'subtitle' => 'Intelligent automation and AI-powered tools',
            'short_description' => 'Machine learning models, chatbots, and AI-powered solutions for your business.',
            'description' => 'We integrate cutting-edge artificial intelligence into your business processes. From intelligent chatbots to predictive analytics, our AI solutions help you automate, optimize, and innovate.',
            'icon' => '🤖',
            'image_url' => '/images/services/ai.jpg',
            'starting_price_ngn' => 1200000,
            'starting_price_usd' => 1500,
            'estimated_delivery' => '4-10 weeks',
            'sort_order' => 5,
            'is_active' => true,
            'features' => ['Machine Learning', 'NLP', 'Computer Vision', 'Chatbots', 'Predictive Analytics'],
        ]);

        // ---- Project Types for Web Development ----
        $portfolio = ProjectType::updateOrCreate(
            ['slug' => 'portfolio-website', 'service_id' => $webDev->id],
            [
            'title' => 'Personal Portfolio Website',
            'short_description' => 'A stunning personal portfolio to showcase your work and attract clients.',
            'description' => 'A professional portfolio website that highlights your skills, projects, and experience. Perfect for freelancers, creatives, and professionals who want to make a lasting impression online.',
            'icon' => '👤',
            'image_url' => '/images/projects/portfolio.jpg',
            'starting_price_ngn' => 250000,
            'starting_price_usd' => 350,
            'estimated_timeline' => '1-2 weeks',
            'features' => ['Custom Design', 'Project Gallery', 'Contact Form', 'Social Links', 'Responsive', 'Blog Ready'],
            'technologies' => ['Next.js', 'Tailwind CSS', 'Framer Motion', 'Sanity CMS'],
            'deliverables' => ['Design Mockups', 'Developed Website', 'Source Code', 'Deployment Guide'],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $business = ProjectType::updateOrCreate(
            ['slug' => 'business-website', 'service_id' => $webDev->id],
            [
            'title' => 'Business Website',
            'short_description' => 'A professional business website that builds credibility and generates leads.',
            'description' => 'A complete business website with all the pages and features you need to establish your online presence. Includes service pages, about section, contact forms, and more.',
            'icon' => '🏢',
            'image_url' => '/images/projects/business.jpg',
            'starting_price_ngn' => 350000,
            'starting_price_usd' => 500,
            'estimated_timeline' => '2-3 weeks',
            'features' => ['5+ Pages', 'Contact Form', 'Google Maps', 'Testimonials', 'Blog', 'Analytics'],
            'technologies' => ['Next.js', 'Tailwind CSS', 'TypeScript', 'Paystack'],
            'deliverables' => ['Design Mockups', 'Developed Website', 'Source Code', 'Admin Access'],
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $ecommerce = ProjectType::updateOrCreate(
            ['slug' => 'e-commerce-store', 'service_id' => $webDev->id],
            [
            'title' => 'E-Commerce Store',
            'short_description' => 'A fully functional online store with payment integration and inventory management.',
            'description' => 'A powerful e-commerce platform that lets you sell products online. Features include product management, shopping cart, secure checkout, payment integration, and order tracking.',
            'icon' => '🛒',
            'image_url' => '/images/projects/ecommerce.jpg',
            'starting_price_ngn' => 800000,
            'starting_price_usd' => 1000,
            'estimated_timeline' => '4-6 weeks',
            'features' => ['Product Management', 'Shopping Cart', 'Payment Gateway', 'Order Tracking', 'Inventory', 'Multi-Currency'],
            'technologies' => ['Next.js', 'Medusa/Shopify', 'Paystack', 'Flutterwave', 'PostgreSQL'],
            'deliverables' => ['Design Mockups', 'Developed Store', 'Admin Dashboard', 'Payment Integration'],
            'sort_order' => 3,
            'is_active' => true,
        ]);

        $corporate = ProjectType::updateOrCreate(
            ['slug' => 'corporate-website', 'service_id' => $webDev->id],
            [
            'title' => 'Corporate Website',
            'short_description' => 'An enterprise-level corporate website with advanced features.',
            'description' => 'A comprehensive corporate website that represents your brand at the highest level. Includes multiple departments, investor relations, newsroom, career portal, and more.',
            'icon' => '🏛',
            'image_url' => '/images/projects/corporate.jpg',
            'starting_price_ngn' => 500000,
            'starting_price_usd' => 700,
            'estimated_timeline' => '3-5 weeks',
            'features' => ['Multi-Department Pages', 'News/Blog', 'Career Portal', 'Investor Relations', 'Multi-Language'],
            'technologies' => ['Next.js', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'AWS'],
            'deliverables' => ['Design System', 'All Pages', 'CMS Access', 'Documentation'],
            'sort_order' => 4,
            'is_active' => true,
        ]);

        $school = ProjectType::updateOrCreate(
            ['slug' => 'school-website', 'service_id' => $webDev->id],
            [
            'title' => 'School Website',
            'short_description' => 'A modern website for schools with portals for students, parents, and staff.',
            'description' => 'A complete school management website with student portals, parent dashboards, admission management, event calendars, and academic resources.',
            'icon' => '📚',
            'image_url' => '/images/projects/school.jpg',
            'starting_price_ngn' => 400000,
            'starting_price_usd' => 550,
            'estimated_timeline' => '3-4 weeks',
            'features' => ['Student Portal', 'Parent Dashboard', 'Admission System', 'Event Calendar', 'Result Portal'],
            'technologies' => ['Next.js', 'Tailwind CSS', 'Node.js', 'MySQL'],
            'deliverables' => ['Design Mockups', 'Developed Website', 'Admin Panel', 'User Training'],
            'sort_order' => 5,
            'is_active' => true,
        ]);

        // ---- Packages for Business Website ----
        $businessPackages = [
            [
                'slug' => 'starter',
                'name' => 'Starter',
                'description' => 'Essential online presence for small businesses.',
                'price_ngn' => 350000,
                'price_usd' => 500,
                'estimated_timeline' => '2 weeks',
                'support_period' => '1 month',
                'revision_count' => 2,
                'is_recommended' => false,
                'sort_order' => 1,
                'features' => ['5 Pages', 'Contact Form', 'Responsive Design', 'Basic SEO', 'CMS Integration'],
            ],
            [
                'slug' => 'business',
                'name' => 'Business',
                'description' => 'Complete business website with advanced features.',
                'price_ngn' => 600000,
                'price_usd' => 800,
                'estimated_timeline' => '3 weeks',
                'support_period' => '3 months',
                'revision_count' => 4,
                'is_recommended' => true,
                'sort_order' => 2,
                'features' => ['Everything in Starter', 'Blog with CMS', 'Google Analytics', 'Performance Optimization', 'Advanced SEO', 'Priority Support'],
            ],
            [
                'slug' => 'premium',
                'name' => 'Premium',
                'description' => 'Full-featured business platform with advanced integrations.',
                'price_ngn' => 800000,
                'price_usd' => 1100,
                'estimated_timeline' => '4 weeks',
                'support_period' => '6 months',
                'revision_count' => 6,
                'is_recommended' => false,
                'sort_order' => 3,
                'features' => ['Everything in Business', 'Booking System', 'Payment Integration', 'Admin Dashboard', 'Advanced Security', 'Training Session'],
            ],
        ];

        foreach ($businessPackages as $pkg) {
            $pkg['project_type_id'] = $business->id;
            Package::updateOrCreate(
                ['slug' => $pkg['slug'], 'project_type_id' => $pkg['project_type_id']],
                $pkg
            );
        }

        // ---- Packages for E-Commerce ----
        $ecomPackages = [
            [
                'slug' => 'starter',
                'name' => 'Starter',
                'description' => 'Basic online store to start selling.',
                'price_ngn' => 800000,
                'price_usd' => 1000,
                'estimated_timeline' => '4 weeks',
                'support_period' => '1 month',
                'revision_count' => 2,
                'is_recommended' => false,
                'sort_order' => 1,
                'features' => ['50 Products', 'Payment Gateway', 'Shopping Cart', 'Order Management', 'Basic Analytics'],
            ],
            [
                'slug' => 'business',
                'name' => 'Business',
                'description' => 'Professional e-commerce with advanced features.',
                'price_ngn' => 1500000,
                'price_usd' => 2000,
                'estimated_timeline' => '6 weeks',
                'support_period' => '3 months',
                'revision_count' => 4,
                'is_recommended' => true,
                'sort_order' => 2,
                'features' => ['Unlimited Products', 'Multi-Currency', 'Inventory Management', 'Email Marketing', 'Advanced Analytics', 'Priority Support'],
            ],
            [
                'slug' => 'premium',
                'name' => 'Premium',
                'description' => 'Enterprise e-commerce platform.',
                'price_ngn' => 3000000,
                'price_usd' => 4000,
                'estimated_timeline' => '8 weeks',
                'support_period' => '6 months',
                'revision_count' => 6,
                'is_recommended' => false,
                'sort_order' => 3,
                'features' => ['Everything in Business', 'Multi-Vendor', 'Mobile App', 'AI Recommendations', 'Dedicated Account Manager', 'Training'],
            ],
        ];

        foreach ($ecomPackages as $pkg) {
            $pkg['project_type_id'] = $ecommerce->id;
            Package::updateOrCreate(
                ['slug' => $pkg['slug'], 'project_type_id' => $pkg['project_type_id']],
                $pkg
            );
        }

        // ---- Packages for Portfolio ----
        $portfolioPackages = [
            [
                'slug' => 'starter',
                'name' => 'Starter',
                'description' => 'Simple single-page portfolio.',
                'price_ngn' => 250000,
                'price_usd' => 350,
                'estimated_timeline' => '1 week',
                'support_period' => '1 month',
                'revision_count' => 2,
                'is_recommended' => false,
                'sort_order' => 1,
                'features' => ['Single Page', 'Project Gallery', 'Contact Form', 'Responsive', 'Social Links'],
            ],
            [
                'slug' => 'pro',
                'name' => 'Professional',
                'description' => 'Multi-page portfolio with blog and CMS.',
                'price_ngn' => 450000,
                'price_usd' => 600,
                'estimated_timeline' => '2 weeks',
                'support_period' => '3 months',
                'revision_count' => 4,
                'is_recommended' => true,
                'sort_order' => 2,
                'features' => ['Multiple Pages', 'Blog with CMS', 'Testimonials', 'SEO Optimized', 'Analytics', 'Priority Support'],
            ],
        ];

        foreach ($portfolioPackages as $pkg) {
            $pkg['project_type_id'] = $portfolio->id;
            Package::updateOrCreate(
                ['slug' => $pkg['slug'], 'project_type_id' => $pkg['project_type_id']],
                $pkg
            );
        }

        // ---- Packages for Corporate ----
        $corpPackages = [
            [
                'slug' => 'starter',
                'name' => 'Starter',
                'price_ngn' => 500000,
                'price_usd' => 700,
                'estimated_timeline' => '3 weeks',
                'support_period' => '1 month',
                'revision_count' => 2,
                'is_recommended' => false,
                'sort_order' => 1,
                'features' => ['10 Pages', 'Contact Forms', 'Responsive', 'Basic SEO', 'CMS'],
            ],
            [
                'slug' => 'enterprise',
                'name' => 'Enterprise',
                'price_ngn' => 1000000,
                'price_usd' => 1400,
                'estimated_timeline' => '5 weeks',
                'support_period' => '3 months',
                'revision_count' => 4,
                'is_recommended' => true,
                'sort_order' => 2,
                'features' => ['Everything in Starter', 'Career Portal', 'News/Blog', 'Multi-Language', 'Advanced Analytics', 'Priority Support'],
            ],
        ];

        foreach ($corpPackages as $pkg) {
            $pkg['project_type_id'] = $corporate->id;
            Package::updateOrCreate(
                ['slug' => $pkg['slug'], 'project_type_id' => $pkg['project_type_id']],
                $pkg
            );
        }

        // ---- Packages for School ----
        $schoolPackages = [
            [
                'slug' => 'starter',
                'name' => 'Starter',
                'price_ngn' => 400000,
                'price_usd' => 550,
                'estimated_timeline' => '3 weeks',
                'support_period' => '1 month',
                'revision_count' => 2,
                'is_recommended' => false,
                'sort_order' => 1,
                'features' => ['School Info Pages', 'Event Calendar', 'Contact Forms', 'Photo Gallery', 'Responsive'],
            ],
            [
                'slug' => 'premium',
                'name' => 'Premium',
                'price_ngn' => 750000,
                'price_usd' => 1000,
                'estimated_timeline' => '4 weeks',
                'support_period' => '3 months',
                'revision_count' => 4,
                'is_recommended' => true,
                'sort_order' => 2,
                'features' => ['Everything in Starter', 'Student Portal', 'Parent Dashboard', 'Result Portal', 'Admission System', 'Training'],
            ],
        ];

        foreach ($schoolPackages as $pkg) {
            $pkg['project_type_id'] = $school->id;
            Package::updateOrCreate(
                ['slug' => $pkg['slug'], 'project_type_id' => $pkg['project_type_id']],
                $pkg
            );
        }

        // ---- Project Types for SaaS ----
        $crm = ProjectType::updateOrCreate(
            ['slug' => 'crm-platform', 'service_id' => $saas->id],
            [
            'title' => 'CRM Platform',
            'short_description' => 'Customer relationship management system.',
            'starting_price_ngn' => 1500000,
            'starting_price_usd' => 2000,
            'estimated_timeline' => '6-10 weeks',
            'features' => ['Contact Management', 'Deal Pipeline', 'Task Management', 'Email Integration', 'Reports'],
            'technologies' => ['React', 'Node.js', 'PostgreSQL', 'Redis', 'AWS'],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $saasPackages = [
            [
                'slug' => 'starter',
                'name' => 'Starter',
                'price_ngn' => 1500000,
                'price_usd' => 2000,
                'estimated_timeline' => '6 weeks',
                'support_period' => '1 month',
                'revision_count' => 2,
                'is_recommended' => false,
                'sort_order' => 1,
                'features' => ['Core Features', 'Up to 100 Users', 'Basic Analytics', 'Email Support'],
            ],
            [
                'slug' => 'business',
                'name' => 'Business',
                'price_ngn' => 3000000,
                'price_usd' => 4000,
                'estimated_timeline' => '8 weeks',
                'support_period' => '3 months',
                'revision_count' => 4,
                'is_recommended' => true,
                'sort_order' => 2,
                'features' => ['Everything in Starter', 'Unlimited Users', 'Advanced Analytics', 'API Access', 'Priority Support'],
            ],
            [
                'slug' => 'enterprise',
                'name' => 'Enterprise',
                'price_ngn' => 6000000,
                'price_usd' => 8000,
                'estimated_timeline' => '10 weeks',
                'support_period' => '6 months',
                'revision_count' => 6,
                'is_recommended' => false,
                'sort_order' => 3,
                'features' => ['Everything in Business', 'Custom Modules', 'White Label', 'Dedicated Server', 'Dedicated Team'],
            ],
        ];

        foreach ($saasPackages as $pkg) {
            $pkg['project_type_id'] = $crm->id;
            Package::updateOrCreate(
                ['slug' => $pkg['slug'], 'project_type_id' => $pkg['project_type_id']],
                $pkg
            );
        }

        // ---- Add-Ons ----
        $addOns = [
            ['name' => 'Logo Design', 'slug' => 'logo-design', 'price_ngn' => 100000, 'price_usd' => 150, 'category' => 'Branding', 'sort_order' => 1],
            ['name' => 'Brand Identity', 'slug' => 'brand-identity', 'price_ngn' => 200000, 'price_usd' => 300, 'category' => 'Branding', 'sort_order' => 2],
            ['name' => 'Copywriting', 'slug' => 'copywriting', 'price_ngn' => 100000, 'price_usd' => 150, 'category' => 'Content', 'sort_order' => 3],
            ['name' => 'Content Writing (per page)', 'slug' => 'content-writing', 'price_ngn' => 25000, 'price_usd' => 35, 'category' => 'Content', 'sort_order' => 4],
            ['name' => 'Hosting Setup (1 year)', 'slug' => 'hosting-setup', 'price_ngn' => 100000, 'price_usd' => 150, 'category' => 'Infrastructure', 'sort_order' => 5],
            ['name' => 'Domain Registration (1 year)', 'slug' => 'domain-registration', 'price_ngn' => 25000, 'price_usd' => 15, 'category' => 'Infrastructure', 'sort_order' => 6],
            ['name' => 'SEO Package', 'slug' => 'seo-package', 'price_ngn' => 150000, 'price_usd' => 200, 'category' => 'Marketing', 'sort_order' => 7],
            ['name' => 'Google Analytics Setup', 'slug' => 'google-analytics', 'price_ngn' => 50000, 'price_usd' => 75, 'category' => 'Marketing', 'sort_order' => 8],
            ['name' => 'Email Setup (Google Workspace)', 'slug' => 'email-setup', 'price_ngn' => 50000, 'price_usd' => 75, 'category' => 'Infrastructure', 'sort_order' => 9],
            ['name' => 'Monthly Maintenance', 'slug' => 'monthly-maintenance', 'price_ngn' => 100000, 'price_usd' => 150, 'category' => 'Maintenance', 'sort_order' => 10],
            ['name' => 'CMS Training (2 hours)', 'slug' => 'cms-training', 'price_ngn' => 75000, 'price_usd' => 100, 'category' => 'Training', 'sort_order' => 11],
            ['name' => 'Payment Gateway Integration', 'slug' => 'payment-gateway', 'price_ngn' => 150000, 'price_usd' => 200, 'category' => 'Integrations', 'sort_order' => 12],
            ['name' => 'Live Chat Integration', 'slug' => 'live-chat', 'price_ngn' => 75000, 'price_usd' => 100, 'category' => 'Integrations', 'sort_order' => 13],
            ['name' => 'Blog/News System', 'slug' => 'blog-system', 'price_ngn' => 150000, 'price_usd' => 200, 'category' => 'Features', 'sort_order' => 14],
            ['name' => 'CRM Integration', 'slug' => 'crm-integration', 'price_ngn' => 250000, 'price_usd' => 350, 'category' => 'Integrations', 'sort_order' => 15],
            ['name' => 'SMS Notifications', 'slug' => 'sms-notifications', 'price_ngn' => 100000, 'price_usd' => 150, 'category' => 'Features', 'sort_order' => 16],
            ['name' => 'Push Notifications', 'slug' => 'push-notifications', 'price_ngn' => 100000, 'price_usd' => 150, 'category' => 'Features', 'sort_order' => 17],
        ];

        foreach ($addOns as $addOn) {
            AddOn::updateOrCreate(
                ['slug' => $addOn['slug']],
                $addOn
            );
        }
    }
}
