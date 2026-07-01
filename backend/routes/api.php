<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\ReceiptController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ServiceOrderController;
use App\Http\Controllers\Api\RequirementController;
use App\Http\Controllers\Api\ProposalController;
use App\Http\Controllers\Api\DiscoveryCallController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AdminManagementController;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\ProjectFileController;
use App\Http\Controllers\Api\ProjectMessageController;
use App\Http\Controllers\Api\ProjectReviewController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\UserPaymentsController;
use App\Http\Controllers\Api\UserDownloadsController;
use App\Http\Controllers\Api\UserSettingsController;

/*
|--------------------------------------------------------------------------
| API Routes - CODEMAFIA Ecosystem
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api/v1
| Authentication: Laravel Sanctum (token-based)
| Rate limiting: applied via throttle middleware
|
*/

Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:api');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:api');
Route::post('/auth/forgot-password', [PasswordResetController::class, 'sendResetLink'])->middleware('throttle:password-reset');
Route::post('/auth/reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:password-reset');
Route::post('/admin/login', [AdminAuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/auth/email/verify/send', [VerificationController::class, 'sendVerificationEmail'])->middleware('auth:sanctum');
Route::get('/auth/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])->name('verification.verify');
Route::post('/auth/email/verify/resend', [VerificationController::class, 'resend'])->middleware('auth:sanctum');

Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{slug}', [CourseController::class, 'show']);
Route::get('/courses/stack/{stackId}', [CourseController::class, 'byStack']);

// Services - Public
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{slug}', [ServiceController::class, 'show']);
Route::get('/services/{serviceSlug}/project-types/{projectSlug}', [ServiceController::class, 'projectType']);
Route::get('/add-ons', [ServiceController::class, 'addOns']);
Route::get('/services/{serviceSlug}/project-types', [ServiceController::class, 'projectTypes']);

Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact');
Route::post('/request-quote', [QuoteController::class, 'store'])->middleware('throttle:contact');

// Payment webhook (public - called by payment gateway)
Route::post('/payments/webhook/{gateway}', [WebhookController::class, 'handle'])
    ->where('gateway', 'paystack|flutterwave')
    ->withoutMiddleware(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class);

// Payment callback (public - called by payment gateway redirect)
Route::get('/service-orders/{id}/payment/callback', [ServiceOrderController::class, 'paymentCallback']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/user', [AuthController::class, 'user'])->middleware('throttle:api');
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('throttle:api');

    Route::post('/checkout', [CheckoutController::class, 'store'])->middleware('throttle:payments');

    Route::post('/enrollments', [EnrollmentController::class, 'store'])->middleware('throttle:api');
    Route::get('/enrollments', [EnrollmentController::class, 'show'])->middleware('throttle:api');

    Route::post('/payments/initialize', [PaymentController::class, 'initialize'])->middleware('throttle:payments');
    Route::get('/payments/verify', [PaymentController::class, 'verify'])->middleware('throttle:payments');

    Route::post('/coupons/validate', [CouponController::class, 'validate'])->middleware('throttle:api');

    Route::get('/users', [UserController::class, 'show'])->middleware('throttle:api');
    Route::patch('/users', [UserController::class, 'update'])->middleware('throttle:api');
    Route::get('/users/dashboard', [UserController::class, 'dashboard'])->middleware('throttle:api');

    Route::get('/invoice', [InvoiceController::class, 'show'])->middleware('throttle:api');
    Route::get('/invoice/pdf', [InvoiceController::class, 'pdf'])->middleware('throttle:api');

    Route::get('/receipt', [ReceiptController::class, 'show'])->middleware('throttle:api');
    Route::get('/receipt/pdf', [ReceiptController::class, 'pdf'])->middleware('throttle:api');

    // Service Orders
    Route::post('/service-orders/quote', [ServiceOrderController::class, 'createQuote'])->middleware('throttle:api');
    Route::post('/service-orders/place', [ServiceOrderController::class, 'placeOrder'])->middleware('throttle:payments');
    Route::post('/service-orders/verify-payment', [ServiceOrderController::class, 'verifyPayment'])->middleware('throttle:payments');
    Route::get('/service-orders', [ServiceOrderController::class, 'myOrders'])->middleware('throttle:api');
    Route::get('/service-orders/{id}', [ServiceOrderController::class, 'showOrder'])->middleware('throttle:api');

    // Workspace endpoints
    Route::get('/service-orders/{id}/workspace', [ServiceOrderController::class, 'workspace'])->middleware('throttle:api');
    Route::get('/service-orders/{id}/milestones', [ServiceOrderController::class, 'milestones'])->middleware('throttle:api');
    Route::get('/service-orders/{id}/activity', [ServiceOrderController::class, 'activityLog'])->middleware('throttle:api');
    Route::get('/service-orders/{id}/invoice/{invoiceId}', [ServiceOrderController::class, 'downloadInvoice'])->middleware('throttle:api');
    Route::get('/service-orders/{id}/receipt/{receiptId}', [ServiceOrderController::class, 'downloadReceipt'])->middleware('throttle:api');

    // Requirements
    Route::get('/health', [\App\Http\Controllers\Api\HealthController::class, 'index']);

Route::get('/services/{serviceSlug}/requirements/questions', [RequirementController::class, 'questions']);
    Route::post('/requirements/responses', [RequirementController::class, 'saveResponses']);
    Route::get('/requirements/responses/{orderId}', [RequirementController::class, 'getResponses']);

    // Proposals
    Route::get('/proposals', [ProposalController::class, 'index']);
    Route::get('/proposals/{id}', [ProposalController::class, 'show']);
    Route::post('/proposals/create-from-order', [ProposalController::class, 'createFromOrder']);
    Route::patch('/proposals/{id}/status', [ProposalController::class, 'updateStatus']);

    // Discovery Calls
    Route::post('/discovery-calls', [DiscoveryCallController::class, 'store']);
    Route::get('/discovery-calls', [DiscoveryCallController::class, 'myCalls']);

    // Project Collaboration — Files
    Route::get('/service-orders/{id}/files', [ProjectFileController::class, 'index']);
    Route::post('/service-orders/{id}/files', [ProjectFileController::class, 'upload']);
    Route::get('/service-orders/{id}/files/{fileId}/download', [ProjectFileController::class, 'download']);
    Route::delete('/service-orders/{id}/files/{fileId}', [ProjectFileController::class, 'destroy']);

    // Project Collaboration — Messages
    Route::get('/service-orders/{id}/messages', [ProjectMessageController::class, 'index']);
    Route::post('/service-orders/{id}/messages', [ProjectMessageController::class, 'store']);

    // Project Collaboration — Milestone Review
    Route::post('/service-orders/{id}/milestones/{milestoneId}/approve', [ProjectReviewController::class, 'milestoneApprove']);
    Route::post('/service-orders/{id}/milestones/{milestoneId}/request-changes', [ProjectReviewController::class, 'milestoneRequestChanges']);

    // Project Collaboration — Delivery
    Route::get('/service-orders/{id}/delivery', [ProjectFileController::class, 'deliveryIndex']);

    // Project Collaboration — Review / Rating
    Route::get('/service-orders/{id}/review', [ProjectReviewController::class, 'show']);
    Route::post('/service-orders/{id}/review', [ProjectReviewController::class, 'submit']);

    // Conversations (Unified Messaging)
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::get('/conversations/{orderId}/messages', [ConversationController::class, 'messages']);
    Route::get('/conversations/{orderId}/messages/recent', [ConversationController::class, 'recentMessages']);
    Route::post('/conversations/{orderId}/messages', [ConversationController::class, 'storeMessage']);
    Route::get('/conversations/unread-counts', [ConversationController::class, 'unreadCounts']);

    // Payments (Aggregated)
    Route::get('/payments', [UserPaymentsController::class, 'index']);

    // Downloads (Aggregated Files)
    Route::get('/downloads', [UserDownloadsController::class, 'index']);
    Route::get('/downloads/{fileId}/download', [UserDownloadsController::class, 'download']);

    // User Settings
    Route::get('/settings', [UserSettingsController::class, 'show']);
    Route::put('/settings', [UserSettingsController::class, 'update']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);

    // Admin Auth Routes (authenticated session check)
    Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
        Route::get('/me', [AdminAuthController::class, 'me']);
        Route::post('/logout', [AdminAuthController::class, 'logout']);
    });

    // Admin Routes
    Route::prefix('admin')->middleware(['auth:sanctum', 'admin', 'throttle:api'])->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/orders', [AdminController::class, 'orders']);
        Route::patch('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
        Route::get('/payments', [AdminController::class, 'payments']);
        Route::get('/payments/analytics', [AdminController::class, 'paymentsAnalytics']);

        Route::post('/orders/{orderId}/review-requirements', [AdminController::class, 'reviewRequirements']);
        Route::post('/orders/{orderId}/kickoff', [AdminController::class, 'kickoffProject']);
        Route::patch('/milestones/{milestoneId}', [AdminController::class, 'updateMilestone']);

        Route::post('/orders/{orderId}/assign-team', [AdminController::class, 'assignTeam']);
        Route::post('/team-assignments/{assignmentId}/unassign', [AdminController::class, 'unassignTeam']);

        Route::get('/team-members', [AdminController::class, 'teamMembers']);
        Route::post('/team-members', [AdminController::class, 'createTeamMember']);

        Route::get('/discovery-calls', [AdminController::class, 'manageDiscoveryCalls']);
        Route::patch('/discovery-calls/{id}', [AdminController::class, 'updateDiscoveryCall']);

        Route::get('/requirement-questions', [AdminController::class, 'requirementQuestions']);
        Route::post('/requirement-questions', [AdminController::class, 'createRequirementQuestion']);

        Route::post('/services', [AdminController::class, 'createService']);
        Route::patch('/services/{id}', [AdminController::class, 'updateService']);
        Route::post('/project-types', [AdminController::class, 'createProjectType']);
        Route::post('/packages', [AdminController::class, 'createPackage']);
        Route::post('/add-ons', [AdminController::class, 'createAddOn']);

        // ─── Project Workspace ───────────────────────────────────
        Route::get('/projects', [AdminController::class, 'projects']);
        Route::get('/projects/{id}', [AdminController::class, 'projectShow']);
        Route::put('/projects/{id}', [AdminController::class, 'projectUpdate']);
        Route::patch('/projects/{id}/status', [AdminController::class, 'projectChangeStatus']);
        Route::get('/projects/{id}/activity', [AdminController::class, 'projectActivity']);

        // Milestone actions
        Route::post('/milestones/{milestoneId}/{action}', [AdminController::class, 'milestoneAction']);

        // Internal Notes
        Route::get('/projects/{projectId}/notes', [AdminController::class, 'listNotes']);
        Route::post('/projects/{projectId}/notes', [AdminController::class, 'createNote']);
        Route::put('/notes/{noteId}', [AdminController::class, 'updateNote']);
        Route::delete('/notes/{noteId}', [AdminController::class, 'deleteNote']);

        // Collaboration — Admin Files
        Route::get('/projects/{id}/files', [ProjectFileController::class, 'index']);
        Route::post('/projects/{id}/files', [ProjectFileController::class, 'upload']);
        Route::delete('/projects/{id}/files/{fileId}', [ProjectFileController::class, 'destroy']);
        Route::patch('/files/{fileId}', [ProjectFileController::class, 'update']);

        // Messages — Admin Conversations List
        Route::get('/conversations', [ConversationController::class, 'adminIndex']);

        // Collaboration — Admin Messages
        Route::get('/projects/{id}/messages', [ProjectMessageController::class, 'index']);
        Route::post('/projects/{id}/messages', [ProjectMessageController::class, 'store']);
        Route::patch('/messages/{messageId}/pin', [ProjectMessageController::class, 'markImportant']);

        // Collaboration — Milestone Review Request
        Route::post('/milestones/{milestoneId}/request-review', [ProjectReviewController::class, 'requestReview']);

        // Collaboration — Delivery Management
        Route::get('/projects/{id}/delivery', [ProjectFileController::class, 'deliveryIndex']);
        Route::post('/projects/{id}/delivery', [AdminController::class, 'addDeliveryItem']);
        Route::delete('/projects/{id}/delivery/{fileId}', [AdminController::class, 'removeDeliveryItem']);

        // Collaboration — Review Moderation
        Route::get('/reviews', [ProjectReviewController::class, 'adminList']);
        Route::patch('/reviews/{reviewId}', [ProjectReviewController::class, 'moderate']);

        // ─── Admin Management ────────────────────────────────────
        Route::get('/clients', [AdminManagementController::class, 'clients']);
        Route::get('/clients/{id}', [AdminManagementController::class, 'clientShow']);
        Route::post('/clients/{id}/suspend', [AdminManagementController::class, 'clientSuspend']);
        Route::post('/clients/{id}/reactivate', [AdminManagementController::class, 'clientReactivate']);
        Route::post('/clients/{id}/notify', [AdminManagementController::class, 'clientSendNotification']);
        Route::get('/clients/export/csv', [AdminManagementController::class, 'clientExport']);

        // Portfolio
        Route::get('/portfolio', [AdminManagementController::class, 'portfolioItems']);
        Route::get('/portfolio/{id}', [AdminManagementController::class, 'portfolioShow']);
        Route::post('/portfolio', [AdminManagementController::class, 'portfolioStore']);
        Route::put('/portfolio/{id}', [AdminManagementController::class, 'portfolioUpdate']);
        Route::delete('/portfolio/{id}', [AdminManagementController::class, 'portfolioDestroy']);

        // Blog
        Route::get('/blog/posts', [AdminManagementController::class, 'blogPosts']);
        Route::get('/blog/posts/{id}', [AdminManagementController::class, 'blogShow']);
        Route::post('/blog/posts', [AdminManagementController::class, 'blogStore']);
        Route::put('/blog/posts/{id}', [AdminManagementController::class, 'blogUpdate']);
        Route::delete('/blog/posts/{id}', [AdminManagementController::class, 'blogDestroy']);
        Route::get('/blog/categories', [AdminManagementController::class, 'blogCategories']);
        Route::post('/blog/categories', [AdminManagementController::class, 'blogCategoryStore']);
        Route::put('/blog/categories/{id}', [AdminManagementController::class, 'blogCategoryUpdate']);
        Route::delete('/blog/categories/{id}', [AdminManagementController::class, 'blogCategoryDestroy']);

        // Academy - Courses
        Route::get('/academy/courses', [AdminManagementController::class, 'courses']);
        Route::get('/academy/courses/{id}', [AdminManagementController::class, 'courseShow']);
        Route::post('/academy/courses', [AdminManagementController::class, 'courseStore']);
        Route::put('/academy/courses/{id}', [AdminManagementController::class, 'courseUpdate']);
        Route::delete('/academy/courses/{id}', [AdminManagementController::class, 'courseDestroy']);
        Route::get('/academy/course-categories', [AdminManagementController::class, 'courseCategories']);
        Route::post('/academy/course-categories', [AdminManagementController::class, 'courseCategoryStore']);
        Route::put('/academy/course-categories/{id}', [AdminManagementController::class, 'courseCategoryUpdate']);
        Route::delete('/academy/course-categories/{id}', [AdminManagementController::class, 'courseCategoryDestroy']);

        // Academy - Modules & Lessons
        Route::get('/academy/courses/{courseId}/modules', [AdminManagementController::class, 'modules']);
        Route::post('/academy/courses/{courseId}/modules', [AdminManagementController::class, 'moduleStore']);
        Route::put('/academy/modules/{id}', [AdminManagementController::class, 'moduleUpdate']);
        Route::delete('/academy/modules/{id}', [AdminManagementController::class, 'moduleDestroy']);
        Route::get('/academy/modules/{moduleId}/lessons', [AdminManagementController::class, 'lessons']);
        Route::post('/academy/modules/{moduleId}/lessons', [AdminManagementController::class, 'lessonStore']);
        Route::put('/academy/lessons/{id}', [AdminManagementController::class, 'lessonUpdate']);
        Route::delete('/academy/lessons/{id}', [AdminManagementController::class, 'lessonDestroy']);

        // Academy - Enrollments & Certificates
        Route::get('/academy/enrollments', [AdminManagementController::class, 'enrollments']);
        Route::get('/academy/certificates', [AdminManagementController::class, 'certificates']);
        Route::post('/academy/enrollments/{enrollmentId}/certificate', [AdminManagementController::class, 'certificateGenerate']);

        // CMS
        Route::get('/cms/sections', [AdminManagementController::class, 'cmsSections']);
        Route::put('/cms/sections/{section}', [AdminManagementController::class, 'cmsUpdate']);

        // Media
        Route::get('/media', [AdminManagementController::class, 'mediaIndex']);
        Route::post('/media/upload', [AdminManagementController::class, 'mediaUpload']);
        Route::put('/media/{id}', [AdminManagementController::class, 'mediaUpdate']);
        Route::delete('/media/{id}', [AdminManagementController::class, 'mediaDestroy']);

        // Analytics
        Route::get('/analytics', [AdminManagementController::class, 'analytics']);

        // Admin Users
        Route::get('/admin-users', [AdminManagementController::class, 'adminUsers']);
        Route::post('/admin-users', [AdminManagementController::class, 'adminUserStore']);
        Route::put('/admin-users/{id}', [AdminManagementController::class, 'adminUserUpdate']);
        Route::delete('/admin-users/{id}', [AdminManagementController::class, 'adminUserDestroy']);

        // Audit Logs
        Route::get('/audit-logs', [AdminManagementController::class, 'auditLogs']);

        // Settings
        Route::get('/settings', [AdminManagementController::class, 'settings']);
        Route::put('/settings', [AdminManagementController::class, 'settingsUpdate']);

        // Notifications
        Route::get('/notifications/manage', [AdminManagementController::class, 'notifications']);
        Route::post('/notifications/send', [AdminManagementController::class, 'sendNotification']);
    });
});
