<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use App\Models\ServiceOrder;
use App\Models\Service;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\CourseCategory;
use App\Models\Enrollment;
use App\Models\Certificate;
use App\Models\PortfolioItem;
use App\Models\BlogPost;
use App\Models\BlogCategory;
use App\Models\Media;
use App\Models\AdminUser;
use App\Models\SiteSetting;
use App\Models\AuditLog;
use App\Models\Notification;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminManagementController extends Controller
{
    private AuditService $auditService;

    public function __construct()
    {
        $this->auditService = new AuditService();
    }

    // ─── CLIENT MANAGEMENT ───────────────────────────────────────────

    public function clients(Request $request)
    {
        $query = User::with('profile');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('email', 'like', "%{$request->search}%")
                  ->orWhereHas('profile', fn ($p) => $p->where('full_name', 'like', "%{$request->search}%")
                      ->orWhere('company', 'like', "%{$request->search}%")
                      ->orWhere('phone', 'like', "%{$request->search}%"));
            });
        }

        if ($request->status) {
            $query->whereHas('profile', fn ($p) => $p->where('status', $request->status));
        }

        $sortField = $request->sort_by ?? 'created_at';
        $sortDir = $request->sort_dir ?? 'desc';
        $allowedSorts = ['created_at', 'email', 'updated_at'];
        if (!in_array($sortField, $allowedSorts)) {
            $sortField = 'created_at';
        }

        $clients = $query->orderBy($sortField, $sortDir)->paginate($request->per_page ?? 20);

        $clients->getCollection()->transform(function ($user) {
            $orders = ServiceOrder::where('user_id', $user->id);
            return [
                'id' => $user->id,
                'email' => $user->email,
                'profile' => $user->profile,
                'total_projects' => (clone $orders)->count(),
                'total_spent' => (float) (clone $orders)->where('payment_status', 'paid')->sum('total_ngn'),
                'active_projects' => (clone $orders)->whereIn('status', ['development', 'testing'])->count(),
                'created_at' => $user->created_at,
            ];
        });

        return response()->json(['success' => true, 'data' => $clients]);
    }

    public function clientShow(string $id)
    {
        $user = User::with('profile')->findOrFail($id);

        $projects = ServiceOrder::with(['service', 'projectType', 'milestones', 'payments'])
            ->where('user_id', $id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'service' => $o->service?->title,
                'project_type' => $o->projectType?->title,
                'status' => $o->status,
                'project_status' => $o->project_status,
                'payment_status' => $o->payment_status,
                'total_ngn' => (float) $o->total_ngn,
                'created_at' => $o->created_at,
                'completed_at' => $o->completed_at,
            ]);

        $payments = $user->payments ?? collect();
        if (method_exists($user, 'payments')) {
            $payments = $user->payments()->orderBy('created_at', 'desc')->get();
        } else {
            $payments = ServiceOrder::where('user_id', $id)
                ->with('payments')
                ->get()
                ->pluck('payments')
                ->flatten()
                ->sortByDesc('created_at')
                ->values();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'profile' => $user->profile,
                    'created_at' => $user->created_at,
                    'email_verified_at' => $user->email_verified_at,
                ],
                'projects' => $projects,
                'payments' => $payments,
                'project_count' => $projects->count(),
                'total_spent' => (float) ServiceOrder::where('user_id', $id)->where('payment_status', 'paid')->sum('total_ngn'),
            ],
        ]);
    }

    public function clientSuspend(string $id)
    {
        $user = User::findOrFail($id);
        $profile = $user->profile;

        if (!$profile) {
            return response()->json(['success' => false, 'error' => 'User profile not found.'], 404);
        }

        $metadata = $profile->metadata ?? [];
        $metadata['suspended_at'] = now()->toIso8601String();
        $metadata['suspended_by'] = request()->user()?->id;
        $profile->update(['metadata' => $metadata]);

        $this->auditService->log('client_suspended', request()->user()?->id, 'user', $id);

        return response()->json(['success' => true, 'data' => ['message' => 'Client suspended successfully.']]);
    }

    public function clientReactivate(string $id)
    {
        $user = User::findOrFail($id);
        $profile = $user->profile;

        if (!$profile) {
            return response()->json(['success' => false, 'error' => 'User profile not found.'], 404);
        }

        $metadata = $profile->metadata ?? [];
        unset($metadata['suspended_at'], $metadata['suspended_by']);
        $profile->update(['metadata' => $metadata]);

        $this->auditService->log('client_reactivated', request()->user()?->id, 'user', $id);

        return response()->json(['success' => true, 'data' => ['message' => 'Client reactivated successfully.']]);
    }

    public function clientSendNotification(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'type' => ['nullable', 'string'],
            'action_url' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $user = User::findOrFail($id);

        Notification::create([
            'user_id' => $user->id,
            'type' => $request->type ?? 'admin_message',
            'title' => $request->title,
            'body' => $request->body,
            'action_url' => $request->action_url,
            'action_text' => 'View',
            'channel' => 'in_app',
        ]);

        $this->auditService->log('client_notification_sent', request()->user()?->id, 'user', $id, [
            'title' => $request->title,
        ]);

        return response()->json(['success' => true, 'data' => ['message' => 'Notification sent successfully.']]);
    }

    public function clientExport()
    {
        $users = User::with('profile')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="clients.csv"',
        ];

        $callback = function () use ($users) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Email', 'Full Name', 'Company', 'Phone', 'Country', 'Role', 'Created At']);

            foreach ($users as $user) {
                fputcsv($file, [
                    $user->id,
                    $user->email,
                    $user->profile?->full_name,
                    $user->profile?->company,
                    $user->profile?->phone,
                    $user->profile?->country,
                    $user->profile?->role,
                    $user->created_at,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    // ─── PORTFOLIO ───────────────────────────────────────────────────

    public function portfolioItems(Request $request)
    {
        $query = PortfolioItem::query();

        if ($request->category) {
            $query->where('category', $request->category);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->featured) {
            $query->where('is_featured', true);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $items = $query->orderBy('sort_order')->orderBy('created_at', 'desc')->paginate($request->per_page ?? 20);

        return response()->json(['success' => true, 'data' => $items]);
    }

    public function portfolioShow(string $id)
    {
        $item = PortfolioItem::findOrFail($id);
        return response()->json(['success' => true, 'data' => $item]);
    }

    public function portfolioStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:portfolio_items,slug'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:255'],
            'technologies' => ['nullable', 'array'],
            'images' => ['nullable', 'array'],
            'video_url' => ['nullable', 'string', 'max:255'],
            'is_featured' => ['boolean'],
            'is_case_study' => ['boolean'],
            'client_name' => ['nullable', 'string', 'max:255'],
            'completion_date' => ['nullable', 'date'],
            'project_url' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:draft,published,archived'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $item = PortfolioItem::create($request->all());

        $this->auditService->log('portfolio_created', $request->user()->id, 'portfolio_item', $item->id);

        return response()->json(['success' => true, 'data' => $item], 201);
    }

    public function portfolioUpdate(Request $request, string $id)
    {
        $item = PortfolioItem::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', 'unique:portfolio_items,slug,' . $id],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:255'],
            'technologies' => ['nullable', 'array'],
            'images' => ['nullable', 'array'],
            'video_url' => ['nullable', 'string', 'max:255'],
            'is_featured' => ['boolean'],
            'is_case_study' => ['boolean'],
            'client_name' => ['nullable', 'string', 'max:255'],
            'completion_date' => ['nullable', 'date'],
            'project_url' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:draft,published,archived'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $item->update($request->all());

        $this->auditService->log('portfolio_updated', $request->user()->id, 'portfolio_item', $id);

        return response()->json(['success' => true, 'data' => $item]);
    }

    public function portfolioDestroy(string $id)
    {
        $item = PortfolioItem::findOrFail($id);
        $item->delete();

        $this->auditService->log('portfolio_deleted', request()->user()?->id, 'portfolio_item', $id);

        return response()->json(['success' => true]);
    }

    // ─── BLOG ────────────────────────────────────────────────────────

    public function blogPosts(Request $request)
    {
        $query = BlogPost::query();

        if ($request->category) {
            $query->where('category', $request->category);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('content', 'like', "%{$request->search}%")
                  ->orWhere('excerpt', 'like', "%{$request->search}%");
            });
        }

        $posts = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 20);

        return response()->json(['success' => true, 'data' => $posts]);
    }

    public function blogShow(string $id)
    {
        $post = BlogPost::findOrFail($id);
        return response()->json(['success' => true, 'data' => $post]);
    }

    public function blogStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:blog_posts,slug'],
            'content' => ['nullable', 'string'],
            'excerpt' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'featured_image' => ['nullable', 'string', 'max:255'],
            'author' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:draft,published,scheduled'],
            'published_at' => ['nullable', 'date'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
            'seo_keywords' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $data = $request->all();
        if ($data['status'] === 'published' && !isset($data['published_at'])) {
            $data['published_at'] = now();
        }

        $post = BlogPost::create($data);

        $this->auditService->log('blog_created', $request->user()->id, 'blog_post', $post->id);

        return response()->json(['success' => true, 'data' => $post], 201);
    }

    public function blogUpdate(Request $request, string $id)
    {
        $post = BlogPost::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', 'unique:blog_posts,slug,' . $id],
            'content' => ['nullable', 'string'],
            'excerpt' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'featured_image' => ['nullable', 'string', 'max:255'],
            'author' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:draft,published,scheduled'],
            'published_at' => ['nullable', 'date'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
            'seo_keywords' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $data = $request->all();
        if (isset($data['status']) && $data['status'] === 'published' && !$post->published_at) {
            $data['published_at'] = now();
        }

        $post->update($data);

        $this->auditService->log('blog_updated', $request->user()->id, 'blog_post', $id);

        return response()->json(['success' => true, 'data' => $post]);
    }

    public function blogDestroy(string $id)
    {
        $post = BlogPost::findOrFail($id);
        $post->delete();

        $this->auditService->log('blog_deleted', request()->user()?->id, 'blog_post', $id);

        return response()->json(['success' => true]);
    }

    public function blogCategories(Request $request)
    {
        $categories = BlogCategory::orderBy('name')->paginate($request->per_page ?? 50);
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function blogCategoryStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:blog_categories,slug'],
            'description' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $category = BlogCategory::create($request->all());

        $this->auditService->log('blog_category_created', $request->user()->id, 'blog_category', $category->id);

        return response()->json(['success' => true, 'data' => $category], 201);
    }

    public function blogCategoryUpdate(Request $request, string $id)
    {
        $category = BlogCategory::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', 'unique:blog_categories,slug,' . $id],
            'description' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $category->update($request->all());

        $this->auditService->log('blog_category_updated', $request->user()->id, 'blog_category', $id);

        return response()->json(['success' => true, 'data' => $category]);
    }

    public function blogCategoryDestroy(string $id)
    {
        $category = BlogCategory::findOrFail($id);
        $category->delete();

        $this->auditService->log('blog_category_deleted', request()->user()?->id, 'blog_category', $id);

        return response()->json(['success' => true]);
    }

    // ─── ACADEMY MANAGEMENT ──────────────────────────────────────────

    public function courses(Request $request)
    {
        $query = Course::with('modules');

        if ($request->category) {
            $query->where('category', $request->category);
        }

        if ($request->has('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $courses = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 20);

        return response()->json(['success' => true, 'data' => $courses]);
    }

    public function courseShow(string $id)
    {
        $course = Course::with(['modules.lessons', 'enrollments', 'reviews'])->findOrFail($id);

        $course->loadCount('enrollments', 'reviews');

        return response()->json(['success' => true, 'data' => $course]);
    }

    public function courseStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:courses,slug'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'string'],
            'thumbnail_url' => ['nullable', 'string'],
            'cover_url' => ['nullable', 'string'],
            'price_ngn' => ['nullable', 'numeric', 'min:0'],
            'price_usd' => ['nullable', 'numeric', 'min:0'],
            'is_free' => ['boolean'],
            'is_published' => ['boolean'],
            'skill_level' => ['nullable', 'string'],
            'duration' => ['nullable', 'string'],
            'what_you_learn' => ['nullable', 'array'],
            'requirements' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $course = Course::create($request->all());

        $this->auditService->log('course_created', $request->user()->id, 'course', $course->id);

        return response()->json(['success' => true, 'data' => $course], 201);
    }

    public function courseUpdate(Request $request, string $id)
    {
        $course = Course::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', 'unique:courses,slug,' . $id],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'string'],
            'thumbnail_url' => ['nullable', 'string'],
            'cover_url' => ['nullable', 'string'],
            'price_ngn' => ['nullable', 'numeric', 'min:0'],
            'price_usd' => ['nullable', 'numeric', 'min:0'],
            'is_free' => ['boolean'],
            'is_published' => ['boolean'],
            'skill_level' => ['nullable', 'string'],
            'duration' => ['nullable', 'string'],
            'what_you_learn' => ['nullable', 'array'],
            'requirements' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $course->update($request->all());

        $this->auditService->log('course_updated', $request->user()->id, 'course', $id);

        return response()->json(['success' => true, 'data' => $course]);
    }

    public function courseDestroy(string $id)
    {
        $course = Course::findOrFail($id);
        $course->delete();

        $this->auditService->log('course_deleted', request()->user()?->id, 'course', $id);

        return response()->json(['success' => true]);
    }

    public function courseCategories(Request $request)
    {
        $categories = CourseCategory::orderBy('name')->paginate($request->per_page ?? 50);
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function courseCategoryStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:course_categories,slug'],
            'description' => ['nullable', 'string'],
            'icon' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $category = CourseCategory::create($request->all());

        $this->auditService->log('course_category_created', $request->user()->id, 'course_category', $category->id);

        return response()->json(['success' => true, 'data' => $category], 201);
    }

    public function courseCategoryUpdate(Request $request, string $id)
    {
        $category = CourseCategory::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', 'unique:course_categories,slug,' . $id],
            'description' => ['nullable', 'string'],
            'icon' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $category->update($request->all());

        $this->auditService->log('course_category_updated', $request->user()->id, 'course_category', $id);

        return response()->json(['success' => true, 'data' => $category]);
    }

    public function courseCategoryDestroy(string $id)
    {
        $category = CourseCategory::findOrFail($id);
        $category->delete();

        $this->auditService->log('course_category_deleted', request()->user()?->id, 'course_category', $id);

        return response()->json(['success' => true]);
    }

    public function modules(Request $request, string $courseId)
    {
        $course = Course::findOrFail($courseId);
        $modules = $course->modules()->with('lessons')->orderBy('sort_order')->paginate($request->per_page ?? 50);
        return response()->json(['success' => true, 'data' => $modules]);
    }

    public function moduleStore(Request $request, string $courseId)
    {
        $course = Course::findOrFail($courseId);

        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $module = $course->modules()->create($request->all());

        $this->auditService->log('module_created', $request->user()->id, 'course_module', $module->id);

        return response()->json(['success' => true, 'data' => $module], 201);
    }

    public function moduleUpdate(Request $request, string $id)
    {
        $module = CourseModule::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $module->update($request->all());

        $this->auditService->log('module_updated', $request->user()->id, 'course_module', $id);

        return response()->json(['success' => true, 'data' => $module]);
    }

    public function moduleDestroy(string $id)
    {
        $module = CourseModule::findOrFail($id);
        $module->delete();

        $this->auditService->log('module_deleted', request()->user()?->id, 'course_module', $id);

        return response()->json(['success' => true]);
    }

    public function lessons(Request $request, string $moduleId)
    {
        $module = CourseModule::findOrFail($moduleId);
        $lessons = $module->lessons()->orderBy('sort_order')->paginate($request->per_page ?? 50);
        return response()->json(['success' => true, 'data' => $lessons]);
    }

    public function lessonStore(Request $request, string $moduleId)
    {
        $module = CourseModule::findOrFail($moduleId);

        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:lessons,slug'],
            'content' => ['nullable', 'string'],
            'video_url' => ['nullable', 'string', 'max:255'],
            'duration_minutes' => ['nullable', 'integer', 'min:0'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'string', 'in:draft,published,archived'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $data = $request->all();
        $data['course_module_id'] = $module->id;
        $lesson = Lesson::create($data);

        $this->auditService->log('lesson_created', $request->user()->id, 'lesson', $lesson->id);

        return response()->json(['success' => true, 'data' => $lesson], 201);
    }

    public function lessonUpdate(Request $request, string $id)
    {
        $lesson = Lesson::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', 'unique:lessons,slug,' . $id],
            'content' => ['nullable', 'string'],
            'video_url' => ['nullable', 'string', 'max:255'],
            'duration_minutes' => ['nullable', 'integer', 'min:0'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'string', 'in:draft,published,archived'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $lesson->update($request->all());

        $this->auditService->log('lesson_updated', $request->user()->id, 'lesson', $id);

        return response()->json(['success' => true, 'data' => $lesson]);
    }

    public function lessonDestroy(string $id)
    {
        $lesson = Lesson::findOrFail($id);
        $lesson->delete();

        $this->auditService->log('lesson_deleted', request()->user()?->id, 'lesson', $id);

        return response()->json(['success' => true]);
    }

    public function enrollments(Request $request)
    {
        $query = Enrollment::with(['user', 'course', 'tier']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->course_id) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->search) {
            $query->whereHas('user.profile', fn ($q) => $q->where('full_name', 'like', "%{$request->search}%"));
        }

        $enrollments = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 20);

        return response()->json(['success' => true, 'data' => $enrollments]);
    }

    public function certificates(Request $request)
    {
        $query = Certificate::with(['user', 'course', 'enrollment']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('certificate_number', 'like', "%{$request->search}%")
                  ->orWhereHas('user', fn ($u) => $u->where('email', 'like', "%{$request->search}%"));
            });
        }

        $certificates = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 20);

        return response()->json(['success' => true, 'data' => $certificates]);
    }

    public function certificateGenerate(Request $request, string $enrollmentId)
    {
        $enrollment = Enrollment::with('user', 'course')->findOrFail($enrollmentId);

        if ($enrollment->status !== 'completed') {
            return response()->json(['success' => false, 'error' => 'Enrollment must be completed to generate a certificate.'], 422);
        }

        $existing = Certificate::where('enrollment_id', $enrollmentId)->first();
        if ($existing) {
            return response()->json(['success' => true, 'data' => $existing]);
        }

        $certNumber = 'CERT-' . strtoupper(Str::random(8)) . '-' . $enrollment->course_id;

        $certificate = Certificate::create([
            'enrollment_id' => $enrollment->id,
            'user_id' => $enrollment->user_id,
            'course_id' => $enrollment->course_id,
            'certificate_number' => $certNumber,
            'issued_at' => now(),
        ]);

        $this->auditService->log('certificate_generated', $request->user()->id, 'certificate', $certificate->id);

        return response()->json(['success' => true, 'data' => $certificate], 201);
    }

    // ─── WEBSITE CMS ─────────────────────────────────────────────────

    public function cmsSections()
    {
        $sections = SiteSetting::all()->groupBy('group');

        return response()->json(['success' => true, 'data' => $sections]);
    }

    public function cmsUpdate(Request $request, string $section)
    {
        $validator = Validator::make($request->all(), [
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string'],
            'settings.*.value' => ['nullable'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        DB::transaction(function () use ($request, $section) {
            foreach ($request->settings as $setting) {
                SiteSetting::updateOrCreate(
                    ['key' => $setting['key'], 'group' => $section],
                    ['value' => is_array($setting['value']) ? json_encode($setting['value']) : $setting['value']]
                );
            }
        });

        $this->auditService->log('cms_updated', $request->user()->id, 'cms_section', $section);

        return response()->json(['success' => true, 'data' => ['message' => "CMS section '{$section}' updated successfully."]]);
    }

    // ─── MEDIA ───────────────────────────────────────────────────────

    public function mediaIndex(Request $request)
    {
        $query = Media::with('uploader');

        if ($request->folder) {
            $query->where('folder', $request->folder);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('original_filename', 'like', "%{$request->search}%")
                  ->orWhere('alt_text', 'like', "%{$request->search}%");
            });
        }

        $media = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 30);

        return response()->json(['success' => true, 'data' => $media]);
    }

    public function mediaUpload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => ['required', 'file', 'mimes:jpeg,jpg,png,gif,webp,svg,pdf,doc,docx,xls,xlsx,csv,zip,mp4,mp3,mpga,wav,ogg', 'max:102400'],
            'folder' => ['nullable', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $file = $request->file('file');
        $folder = $request->folder ?? 'uploads';
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        $path = $file->storeAs($folder, $filename, 'public');

        $media = Media::create([
            'filename' => $filename,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'url' => Storage::url($path),
            'folder' => $folder,
            'alt_text' => $request->alt_text,
            'uploaded_by' => $request->user()->id,
        ]);

        $this->auditService->log('media_uploaded', $request->user()->id, 'media', $media->id);

        return response()->json(['success' => true, 'data' => $media], 201);
    }

    public function mediaUpdate(Request $request, string $id)
    {
        $media = Media::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'alt_text' => ['nullable', 'string', 'max:255'],
            'folder' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $media->update($request->only(['alt_text', 'folder']));

        $this->auditService->log('media_updated', $request->user()->id, 'media', $id);

        return response()->json(['success' => true, 'data' => $media]);
    }

    public function mediaDestroy(string $id)
    {
        $media = Media::findOrFail($id);

        Storage::disk('public')->delete($media->folder . '/' . $media->filename);
        $media->delete();

        $this->auditService->log('media_deleted', request()->user()?->id, 'media', $id);

        return response()->json(['success' => true]);
    }

    // ─── ANALYTICS ───────────────────────────────────────────────────

    public function analytics()
    {
        $totalRevenue = (float) ServiceOrder::where('payment_status', 'paid')->sum('total_ngn');
        $pendingRevenue = (float) ServiceOrder::where('payment_status', 'pending')->sum('total_ngn');

        $projectsTotal = ServiceOrder::count();
        $activeProjects = ServiceOrder::whereIn('status', ['development', 'testing'])->count();
        $completedProjects = ServiceOrder::where('status', 'completed')->count();

        $clientsTotal = User::count();
        $newClientsThisMonth = User::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $studentsTotal = Enrollment::count();
        $activeStudents = Enrollment::where('status', 'active')->count();

        $totalCalls = \App\Models\DiscoveryCall::count();
        $completedCalls = \App\Models\DiscoveryCall::where('status', 'completed')->count();

        $conversionRate = $totalCalls > 0
            ? round(($completedCalls / $totalCalls) * 100, 2)
            : 0;

        $popularServices = Service::withCount('orders')
            ->orderBy('orders_count', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($s) => [
                'title' => $s->title,
                'orders_count' => $s->orders_count,
            ]);

        $coursePerformance = Course::withCount('enrollments', 'reviews')
            ->orderBy('enrollments_count', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($c) => [
                'title' => $c->title,
                'enrollments_count' => $c->enrollments_count,
                'reviews_count' => $c->reviews_count,
                'average_rating' => $c->average_rating,
                'students_enrolled' => $c->students_enrolled,
            ]);

        $monthlyRevenue = ServiceOrder::where('payment_status', 'paid')
            ->select(DB::raw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(total_ngn) as revenue'))
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'revenue' => [
                    'total' => $totalRevenue,
                    'pending' => $pendingRevenue,
                    'monthly' => $monthlyRevenue,
                ],
                'projects' => [
                    'total' => $projectsTotal,
                    'active' => $activeProjects,
                    'completed' => $completedProjects,
                ],
                'clients' => [
                    'total' => $clientsTotal,
                    'new_this_month' => $newClientsThisMonth,
                ],
                'students' => [
                    'total' => $studentsTotal,
                    'active' => $activeStudents,
                ],
                'conversion' => [
                    'rate' => $conversionRate,
                    'total_calls' => $totalCalls,
                    'completed_calls' => $completedCalls,
                ],
                'popular_services' => $popularServices,
                'course_performance' => $coursePerformance,
            ],
        ]);
    }

    // ─── ADMIN USERS ─────────────────────────────────────────────────

    public function adminUsers(Request $request)
    {
        $query = AdminUser::with('user.profile');

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $admins = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 20);

        return response()->json(['success' => true, 'data' => $admins]);
    }

    public function adminUserStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => ['required', 'string', 'exists:users,id', 'unique:admin_users,user_id'],
            'role' => ['required', 'string', 'in:super_admin,project_manager,content_manager,academy_manager,finance_manager,support_staff'],
            'permissions' => ['nullable', 'array'],
            'is_active' => ['boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $admin = AdminUser::create($request->all());

        $this->auditService->log('admin_user_created', $request->user()->id, 'admin_user', $admin->id);

        return response()->json(['success' => true, 'data' => $admin->load('user.profile')], 201);
    }

    public function adminUserUpdate(Request $request, string $id)
    {
        $admin = AdminUser::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'role' => ['sometimes', 'required', 'string', 'in:super_admin,project_manager,content_manager,academy_manager,finance_manager,support_staff'],
            'permissions' => ['nullable', 'array'],
            'is_active' => ['boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $admin->update($request->all());

        $this->auditService->log('admin_user_updated', $request->user()->id, 'admin_user', $id);

        return response()->json(['success' => true, 'data' => $admin->load('user.profile')]);
    }

    public function adminUserDestroy(string $id)
    {
        $admin = AdminUser::findOrFail($id);
        $admin->delete();

        $this->auditService->log('admin_user_deleted', request()->user()?->id, 'admin_user', $id);

        return response()->json(['success' => true]);
    }

    // ─── AUDIT LOGS ──────────────────────────────────────────────────

    public function auditLogs(Request $request)
    {
        $query = AuditLog::with('user');

        if ($request->action) {
            $query->where('action', $request->action);
        }

        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->entity_type) {
            $query->where('entity_type', $request->entity_type);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 50);

        return response()->json(['success' => true, 'data' => $logs]);
    }

    // ─── SETTINGS ────────────────────────────────────────────────────

    public function settings()
    {
        $settings = SiteSetting::all()->groupBy('group');
        return response()->json(['success' => true, 'data' => $settings]);
    }

    public function settingsUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string'],
            'settings.*.value' => ['nullable'],
            'settings.*.group' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        DB::transaction(function () use ($request) {
            foreach ($request->settings as $setting) {
                SiteSetting::updateOrCreate(
                    ['key' => $setting['key']],
                    [
                        'value' => is_array($setting['value']) ? json_encode($setting['value']) : $setting['value'],
                        'group' => $setting['group'] ?? 'general',
                    ]
                );
            }
        });

        $this->auditService->log('settings_updated', $request->user()->id, 'settings');

        return response()->json(['success' => true, 'data' => ['message' => 'Settings updated successfully.']]);
    }

    // ─── NOTIFICATIONS MANAGEMENT ────────────────────────────────────

    public function notifications(Request $request)
    {
        $query = Notification::with('user.profile');

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->has('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        $notifications = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 30);

        return response()->json(['success' => true, 'data' => $notifications]);
    }

    public function sendNotification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'type' => ['nullable', 'string'],
            'action_url' => ['nullable', 'string'],
            'action_text' => ['nullable', 'string'],
            'user_ids' => ['nullable', 'array'],
            'user_ids.*' => ['string', 'exists:users,id'],
            'broadcast' => ['boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $data = [
            'type' => $request->type ?? 'admin_broadcast',
            'title' => $request->title,
            'body' => $request->body,
            'action_url' => $request->action_url,
            'action_text' => $request->action_text ?? 'View',
            'channel' => 'in_app',
        ];

        if ($request->broadcast) {
            $users = User::pluck('id');
            $notifications = [];
            foreach ($users as $userId) {
                $notifications[] = array_merge($data, [
                    'id' => Str::uuid(),
                    'user_id' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            foreach (array_chunk($notifications, 100) as $chunk) {
                Notification::insert($chunk);
            }

            $count = $users->count();
        } elseif ($request->user_ids) {
            $notifications = [];
            foreach ($request->user_ids as $userId) {
                $notifications[] = array_merge($data, [
                    'id' => Str::uuid(),
                    'user_id' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            Notification::insert($notifications);
            $count = count($request->user_ids);
        } else {
            return response()->json(['success' => false, 'error' => 'Specify user_ids or set broadcast to true.'], 422);
        }

        $this->auditService->log('notification_broadcast', $request->user()->id, 'notification', null, [
            'count' => $count,
            'broadcast' => $request->broadcast ?? false,
        ]);

        return response()->json([
            'success' => true,
            'data' => ['message' => "Notification sent to {$count} users."],
        ]);
    }
}
