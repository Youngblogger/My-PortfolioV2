<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            'frontend' => [
                ['title' => 'Web Fundamentals', 'description' => 'Learn HTML5, CSS3, and modern CSS frameworks', 'sort_order' => 1, 'lessons' => [
                    ['title' => 'HTML5 Semantic Markup', 'duration' => '2 hours', 'is_preview' => true],
                    ['title' => 'CSS3 Layouts: Flexbox & Grid', 'duration' => '3 hours', 'is_preview' => true],
                    ['title' => 'Responsive Design & Media Queries', 'duration' => '2 hours'],
                    ['title' => 'Tailwind CSS Fundamentals', 'duration' => '3 hours'],
                    ['title' => 'CSS Animations & Transitions', 'duration' => '2 hours'],
                ]],
                ['title' => 'JavaScript Deep Dive', 'description' => 'Master modern JavaScript (ES6+)', 'sort_order' => 2, 'lessons' => [
                    ['title' => 'Variables, Scope & Hoisting', 'duration' => '2 hours', 'is_preview' => true],
                    ['title' => 'Closures & Higher-Order Functions', 'duration' => '2 hours'],
                    ['title' => 'Async JavaScript: Promises & Async/Await', 'duration' => '3 hours'],
                    ['title' => 'DOM Manipulation & Events', 'duration' => '2 hours'],
                    ['title' => 'Modules & Bundlers (Webpack, Vite)', 'duration' => '2 hours'],
                ]],
                ['title' => 'React Fundamentals', 'description' => 'Build component-driven UIs with React', 'sort_order' => 3, 'lessons' => [
                    ['title' => 'JSX & Component Architecture', 'duration' => '2 hours', 'is_preview' => true],
                    ['title' => 'State & Props', 'duration' => '3 hours'],
                    ['title' => 'Hooks Deep Dive', 'duration' => '4 hours'],
                    ['title' => 'Context API & State Management', 'duration' => '2 hours'],
                    ['title' => 'Custom Hooks & Patterns', 'duration' => '2 hours'],
                ]],
                ['title' => 'Next.js & Production', 'description' => 'Build full-stack apps with Next.js', 'sort_order' => 4, 'lessons' => [
                    ['title' => 'App Router & Layouts', 'duration' => '2 hours'],
                    ['title' => 'Server & Client Components', 'duration' => '2 hours'],
                    ['title' => 'Data Fetching & Caching', 'duration' => '3 hours'],
                    ['title' => 'Authentication & Middleware', 'duration' => '2 hours'],
                    ['title' => 'Deployment & CI/CD', 'duration' => '2 hours'],
                ]],
            ],
            'backend' => [
                ['title' => 'Node.js & Express', 'description' => 'Build APIs with Node.js and Express', 'sort_order' => 1, 'lessons' => [
                    ['title' => 'Node.js Runtime & NPM', 'duration' => '2 hours', 'is_preview' => true],
                    ['title' => 'Express.js REST API Design', 'duration' => '3 hours', 'is_preview' => true],
                    ['title' => 'Middleware & Error Handling', 'duration' => '2 hours'],
                    ['title' => 'Input Validation & Security', 'duration' => '2 hours'],
                ]],
                ['title' => 'Databases & ORMs', 'description' => 'PostgreSQL, Prisma, and data modeling', 'sort_order' => 2, 'lessons' => [
                    ['title' => 'SQL & PostgreSQL Fundamentals', 'duration' => '3 hours', 'is_preview' => true],
                    ['title' => 'Prisma ORM & Migrations', 'duration' => '2 hours'],
                    ['title' => 'Database Relationships & Indexing', 'duration' => '2 hours'],
                    ['title' => 'Query Optimization', 'duration' => '2 hours'],
                ]],
                ['title' => 'Authentication & Security', 'description' => 'Implement secure authentication', 'sort_order' => 3, 'lessons' => [
                    ['title' => 'JWT & Session-based Auth', 'duration' => '2 hours'],
                    ['title' => 'OAuth2 & Social Login', 'duration' => '2 hours'],
                    ['title' => 'RBAC & Permissions', 'duration' => '2 hours'],
                    ['title' => 'Security Best Practices', 'duration' => '2 hours'],
                ]],
                ['title' => 'DevOps & Deployment', 'description' => 'Docker, CI/CD, and cloud deployment', 'sort_order' => 4, 'lessons' => [
                    ['title' => 'Docker & Containerization', 'duration' => '3 hours'],
                    ['title' => 'CI/CD with GitHub Actions', 'duration' => '2 hours'],
                    ['title' => 'Cloud Deployment (AWS/GCP)', 'duration' => '3 hours'],
                    ['title' => 'Monitoring & Logging', 'duration' => '2 hours'],
                ]],
            ],
            'fullstack' => [
                ['title' => 'Frontend Foundations', 'description' => 'HTML, CSS, JavaScript, and React', 'sort_order' => 1, 'lessons' => [
                    ['title' => 'HTML5 & CSS3 Modern Development', 'duration' => '3 hours', 'is_preview' => true],
                    ['title' => 'JavaScript Deep Dive', 'duration' => '4 hours', 'is_preview' => true],
                    ['title' => 'React & TypeScript', 'duration' => '4 hours'],
                    ['title' => 'State Management & Routing', 'duration' => '3 hours'],
                ]],
                ['title' => 'Backend Foundations', 'description' => 'Node.js, Express, and databases', 'sort_order' => 2, 'lessons' => [
                    ['title' => 'Node.js & Express API Design', 'duration' => '3 hours', 'is_preview' => true],
                    ['title' => 'PostgreSQL & Prisma ORM', 'duration' => '3 hours'],
                    ['title' => 'Authentication & Authorization', 'duration' => '3 hours'],
                    ['title' => 'File Uploads & Storage', 'duration' => '2 hours'],
                ]],
                ['title' => 'Full-Stack Features', 'description' => 'Real-time, payments, and more', 'sort_order' => 3, 'lessons' => [
                    ['title' => 'Real-time Features with WebSockets', 'duration' => '3 hours'],
                    ['title' => 'Payment Integration (Paystack/Flutterwave)', 'duration' => '3 hours'],
                    ['title' => 'Email & Notifications', 'duration' => '2 hours'],
                    ['title' => 'Caching & Performance', 'duration' => '2 hours'],
                ]],
                ['title' => 'Production & Deployment', 'description' => 'Testing, CI/CD, and monitoring', 'sort_order' => 4, 'lessons' => [
                    ['title' => 'Testing Strategy (Unit, Integration, E2E)', 'duration' => '4 hours'],
                    ['title' => 'Docker & Containerization', 'duration' => '3 hours'],
                    ['title' => 'CI/CD Pipeline', 'duration' => '2 hours'],
                    ['title' => 'Monitoring & Incident Response', 'duration' => '2 hours'],
                ]],
            ],
            'mobile' => [
                ['title' => 'React Native Fundamentals', 'description' => 'Build your first cross-platform app', 'sort_order' => 1, 'lessons' => [
                    ['title' => 'React Native & Expo Setup', 'duration' => '2 hours', 'is_preview' => true],
                    ['title' => 'Components & Styling', 'duration' => '3 hours', 'is_preview' => true],
                    ['title' => 'Navigation & Routing', 'duration' => '2 hours'],
                    ['title' => 'State Management', 'duration' => '3 hours'],
                ]],
                ['title' => 'Flutter & Dart', 'description' => 'Build beautiful apps with Flutter', 'sort_order' => 2, 'lessons' => [
                    ['title' => 'Dart Language Fundamentals', 'duration' => '2 hours', 'is_preview' => true],
                    ['title' => 'Flutter Widgets & Layouts', 'duration' => '3 hours'],
                    ['title' => 'State Management with Riverpod', 'duration' => '3 hours'],
                    ['title' => 'Animations & Custom Painters', 'duration' => '2 hours'],
                ]],
                ['title' => 'Native Features & APIs', 'description' => 'Camera, GPS, biometrics, and more', 'sort_order' => 3, 'lessons' => [
                    ['title' => 'Device APIs (Camera, Gallery, Location)', 'duration' => '3 hours'],
                    ['title' => 'Biometric Authentication', 'duration' => '2 hours'],
                    ['title' => 'Push Notifications', 'duration' => '2 hours'],
                    ['title' => 'Offline Support & Data Sync', 'duration' => '2 hours'],
                ]],
                ['title' => 'App Store Deployment', 'description' => 'Deploy to iOS and Android stores', 'sort_order' => 4, 'lessons' => [
                    ['title' => 'App Store Connect Setup', 'duration' => '2 hours'],
                    ['title' => 'Google Play Console Setup', 'duration' => '2 hours'],
                    ['title' => 'Testing & TestFlight', 'duration' => '2 hours'],
                    ['title' => 'Production Release & Monitoring', 'duration' => '1 hour'],
                ]],
            ],
            'ai' => [
                ['title' => 'Python for AI', 'description' => 'Python data science and ML ecosystem', 'sort_order' => 1, 'lessons' => [
                    ['title' => 'NumPy & Pandas Fundamentals', 'duration' => '3 hours', 'is_preview' => true],
                    ['title' => 'Data Visualization (Matplotlib, Seaborn)', 'duration' => '2 hours', 'is_preview' => true],
                    ['title' => 'Scikit-learn & Classical ML', 'duration' => '4 hours'],
                    ['title' => 'Feature Engineering & Pipeline', 'duration' => '2 hours'],
                ]],
                ['title' => 'Deep Learning', 'description' => 'Neural networks with PyTorch and TensorFlow', 'sort_order' => 2, 'lessons' => [
                    ['title' => 'Neural Network Fundamentals', 'duration' => '3 hours', 'is_preview' => true],
                    ['title' => 'CNNs for Computer Vision', 'duration' => '4 hours'],
                    ['title' => 'RNNs & Transformers for NLP', 'duration' => '4 hours'],
                    ['title' => 'Transfer Learning & Fine-tuning', 'duration' => '3 hours'],
                ]],
                ['title' => 'LLMs & Generative AI', 'description' => 'Large language models and RAG systems', 'sort_order' => 3, 'lessons' => [
                    ['title' => 'Transformer Architecture Deep Dive', 'duration' => '3 hours'],
                    ['title' => 'Prompt Engineering & API Integration', 'duration' => '2 hours'],
                    ['title' => 'RAG Systems with LangChain', 'duration' => '4 hours'],
                    ['title' => 'Fine-tuning LLMs (LoRA, QLoRA)', 'duration' => '4 hours'],
                ]],
                ['title' => 'MLOps & Production', 'description' => 'Deploy and monitor AI systems', 'sort_order' => 4, 'lessons' => [
                    ['title' => 'MLflow & Experiment Tracking', 'duration' => '2 hours'],
                    ['title' => 'Model Serving (FastAPI, Docker)', 'duration' => '3 hours'],
                    ['title' => 'CI/CD for ML Pipelines', 'duration' => '2 hours'],
                    ['title' => 'Monitoring & Drift Detection', 'duration' => '2 hours'],
                ]],
            ],
        ];

        foreach ($modules as $slug => $courseModules) {
            $course = Course::where('slug', $slug)->first();
            if (!$course) continue;

            foreach ($courseModules as $data) {
                CourseModule::updateOrCreate(
                    ['course_id' => $course->id, 'sort_order' => $data['sort_order']],
                    [
                        'course_id' => $course->id,
                        'title' => $data['title'],
                        'description' => $data['description'],
                        'sort_order' => $data['sort_order'],
                        'lessons' => $data['lessons'],
                    ]
                );
            }
        }
    }
}
