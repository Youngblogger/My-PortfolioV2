<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\DiscoveryCallController;

/*
|--------------------------------------------------------------------------
| API Routes - CODEMAFIA Portfolio
|--------------------------------------------------------------------------
|
| Public API routes for the portfolio site.
|
*/

Route::get('/services', [\App\Http\Controllers\Api\ServiceController::class, 'index']);
Route::get('/services/{slug}', [\App\Http\Controllers\Api\ServiceController::class, 'show']);
Route::get('/services/{serviceSlug}/project-types/{projectSlug}', [\App\Http\Controllers\Api\ServiceController::class, 'projectType']);
Route::get('/add-ons', [\App\Http\Controllers\Api\ServiceController::class, 'addOns']);
Route::get('/services/{serviceSlug}/project-types', [\App\Http\Controllers\Api\ServiceController::class, 'projectTypes']);

Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact');
Route::post('/request-quote', [QuoteController::class, 'store'])->middleware('throttle:contact');

Route::post('/discovery-calls', [DiscoveryCallController::class, 'store'])->middleware('throttle:api');

Route::get('/health', [\App\Http\Controllers\Api\HealthController::class, 'index']);
