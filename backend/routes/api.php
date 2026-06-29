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
use App\Http\Controllers\Api\VerificationController;

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

Route::post('/payments/webhook/{gateway}', [WebhookController::class, 'handle'])
    ->where('gateway', 'paystack|flutterwave')
    ->withoutMiddleware(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class);

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

    // Requirements
    Route::get('/services/{serviceSlug}/requirements/questions', [RequirementController::class, 'questions']);
    Route::post('/requirements/responses', [RequirementController::class, 'store']);
    Route::get('/requirements/responses/{orderId}', [RequirementController::class, 'getResponses']);

    // Proposals
    Route::get('/proposals', [ProposalController::class, 'index']);
    Route::get('/proposals/{id}', [ProposalController::class, 'show']);
    Route::post('/proposals/create-from-order', [ProposalController::class, 'createFromOrder']);
    Route::patch('/proposals/{id}/status', [ProposalController::class, 'updateStatus']);

    // Discovery Calls
    Route::post('/discovery-calls', [DiscoveryCallController::class, 'store']);
    Route::get('/discovery-calls', [DiscoveryCallController::class, 'myCalls']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);

    // Admin Routes
    Route::prefix('admin')->middleware(['admin', 'throttle:api'])->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/orders', [AdminController::class, 'orders']);
        Route::patch('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);

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
    });
});
