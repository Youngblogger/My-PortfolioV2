<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class HealthController extends Controller
{
    public function index()
    {
        $checks = [];

        $checks['app_env'] = app()->environment();
        $checks['app_debug'] = config('app.debug');
        $checks['app_url'] = config('app.url');

        try {
            DB::connection()->getPdo();
            $checks['database'] = 'connected';
        } catch (\Throwable $e) {
            $checks['database'] = 'error: ' . $e->getMessage();
        }

        $checks['storage_symlink'] = is_dir(public_path('storage')) ? 'exists' : 'missing';

        try {
            $cacheTest = Cache::store(config('cache.default'))->get('health_test');
            $checks['cache'] = 'reachable';
        } catch (\Throwable $e) {
            $checks['cache'] = 'error: ' . $e->getMessage();
        }

        $checks['queue_driver'] = config('queue.default');

        $responseCode = $checks['database'] === 'connected' ? 200 : 503;

        return response()->json([
            'success' => $responseCode === 200,
            'status' => $responseCode === 200 ? 'healthy' : 'degraded',
            'timestamp' => now()->toIso8601String(),
            'checks' => $checks,
        ], $responseCode);
    }
}
