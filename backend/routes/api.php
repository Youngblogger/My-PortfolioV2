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

Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{slug}', [CourseController::class, 'show']);
Route::get('/courses/stack/{stackId}', [CourseController::class, 'byStack']);

// Services - Public
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{slug}', [ServiceController::class, 'show']);
Route::get('/services/{serviceSlug}/project-types/{projectSlug}', [ServiceController::class, 'projectType']);
Route::get('/add-ons', [ServiceController::class, 'addOns']);

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
});
