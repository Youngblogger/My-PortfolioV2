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

/*
|--------------------------------------------------------------------------
| API Routes - CODEMAFIA Ecosystem
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api/v1
| Authentication: Laravel Sanctum (token-based)
|
*/

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{slug}', [CourseController::class, 'show']);
Route::get('/courses/stack/{stackId}', [CourseController::class, 'byStack']);

Route::post('/contact', [ContactController::class, 'store']);
Route::post('/request-quote', [QuoteController::class, 'store']);

Route::post('/payments/webhook/{gateway}', [WebhookController::class, 'handle'])
    ->where('gateway', 'paystack|flutterwave')
    ->withoutMiddleware(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::post('/checkout', [CheckoutController::class, 'store']);

    Route::post('/enrollments', [EnrollmentController::class, 'store']);
    Route::get('/enrollments', [EnrollmentController::class, 'show']);

    Route::post('/payments/initialize', [PaymentController::class, 'initialize']);
    Route::get('/payments/verify', [PaymentController::class, 'verify']);

    Route::post('/coupons/validate', [CouponController::class, 'validate']);

    Route::get('/users', [UserController::class, 'show']);
    Route::patch('/users', [UserController::class, 'update']);
    Route::get('/users/dashboard', [UserController::class, 'dashboard']);

    Route::get('/invoice', [InvoiceController::class, 'show']);
    Route::get('/invoice/pdf', [InvoiceController::class, 'pdf']);

    Route::get('/receipt', [ReceiptController::class, 'show']);
});
