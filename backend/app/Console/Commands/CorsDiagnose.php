<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\Response;

class CorsDiagnose extends Command
{
    protected $signature = 'cors:diagnose
        {--origin=http://localhost:3000 : The origin to test against}
        {--endpoint=/api/v1/courses : The endpoint to test}';

    protected $description = 'Diagnose CORS configuration at runtime';

    public function handle(): int
    {
        $origin = $this->option('origin');
        $endpoint = $this->option('endpoint');

        $this->newLine();
        $this->info('═══════════════════════════════════════════');
        $this->info('  CODEMAFIA CORS Runtime Diagnostic');
        $this->info('═══════════════════════════════════════════');
        $this->newLine();

        // ─── Phase 1: Runtime Config ───
        $this->section('Phase 1: Runtime Configuration');

        $corsConfig = config('cors');
        $this->line('config/cors.php (RUNTIME):');

        $this->table(
            ['Key', 'Runtime Value'],
            [
                ['paths', json_encode($corsConfig['paths'] ?? [])],
                ['allowed_methods', json_encode($corsConfig['allowed_methods'] ?? [])],
                ['allowed_origins', json_encode($corsConfig['allowed_origins'] ?? [])],
                ['allowed_origins_patterns', json_encode($corsConfig['allowed_origins_patterns'] ?? [])],
                ['allowed_headers', json_encode($corsConfig['allowed_headers'] ?? [])],
                ['exposed_headers', json_encode($corsConfig['exposed_headers'] ?? [])],
                ['max_age', json_encode($corsConfig['max_age'] ?? 0)],
                ['supports_credentials', json_encode($corsConfig['supports_credentials'] ?? false)],
            ]
        );

        $inList = in_array($origin, $corsConfig['allowed_origins'] ?? []);
        $this->line(sprintf(
            'Origin "%s" in allowed_origins: %s',
            $origin,
            $inList ? '<fg=green>YES</>' : '<fg=red>NO</>'
        ));

        if (!$inList) {
            $this->error('>>> ROOT CAUSE: ' . $origin . ' is NOT in allowed_origins at runtime.');
            $this->error('>>> HandleCors::isAllowedOrigin() will return FALSE.');
            $this->error('>>> Access-Control-Allow-Origin will NOT be sent.');
        }

        $this->newLine();

        // ─── Phase 2: Environment ───
        $this->section('Phase 2: Environment');

        $envVars = [
            'APP_ENV' => env('APP_ENV'),
            'APP_URL' => env('APP_URL'),
            'APP_KEY' => env('APP_KEY') ? substr(env('APP_KEY'), 0, 10) . '...' : 'NOT SET',
            'FRONTEND_URL' => env('FRONTEND_URL'),
            'SESSION_DRIVER' => env('SESSION_DRIVER'),
            'SESSION_DOMAIN' => env('SESSION_DOMAIN'),
            'SESSION_SECURE_COOKIE' => env('SESSION_SECURE_COOKIE'),
            'SANCTUM_STATEFUL_DOMAINS' => env('SANCTUM_STATEFUL_DOMAINS'),
            'CACHE_STORE' => env('CACHE_STORE'),
        ];

        $this->table(
            ['Variable', 'Runtime Value'],
            array_map(fn($k, $v) => [$k, $v ?? '<fg=yellow>NOT SET</>'], array_keys($envVars), $envVars)
        );

        $this->newLine();

        // ─── Config Cache Check ───
        $this->section('Configuration Cache');

        $cachedConfigPath = base_path('bootstrap/cache/config.php');
        if (file_exists($cachedConfigPath)) {
            $this->line('<fg=yellow>WARNING: Config cache file EXISTS at bootstrap/cache/config.php');
            $this->line('Runtime config may be STALE if source files changed after cache was built.');
            $this->line('Run "php artisan optimize:clear && php artisan config:cache" to rebuild.');
        } else {
            $this->line('<fg=green>OK: No config cache file (config is loaded fresh from source files).');
        }

        $this->newLine();

        // ─── Phase 3: HandleCors Middleware Check ───
        $this->section('Phase 3: HandleCors Middleware');

        $this->info('Checking if HandleCors is in the middleware stack...');

        $router = $this->laravel->make('router');
        $middleware = $router->getMiddleware();

        $handleCorsRegistered = false;
        foreach ($middleware as $alias => $class) {
            if (str_contains($class, 'HandleCors')) {
                $handleCorsRegistered = true;
                $this->line("  Middleware alias '{$alias}' → {$class}");
            }
        }

        if ($handleCorsRegistered) {
            $this->line('<fg=green>✓ HandleCors is registered as route middleware.</>');
        } else {
            $this->line('<fg=yellow>HandleCors not found in route middleware (it may be global — check bootstrap/app.php).</>');
        }

        $this->newLine();

        // ─── Phase 4: Simulated OPTIONS Response ───
        $this->section('Phase 4: Simulated Preflight Response');

        $this->info("Simulating OPTIONS request from origin: {$origin}");
        $this->info("Endpoint: {$endpoint}");

        // Create a simulated preflight request
        $simRequest = Request::create($endpoint, 'OPTIONS');
        $simRequest->headers->set('Origin', $origin);
        $simRequest->headers->set('Access-Control-Request-Method', 'GET');

        try {
            $handleCors = $this->laravel->make(\Illuminate\Http\Middleware\HandleCors::class);
            $response = $handleCors->handle($simRequest, function () {
                return new Response('', 204);
            });

            $this->table(
                ['Header', 'Value'],
                collect($response->headers->allPreserveCase())
                    ->filter(fn($v, $k) => str_contains($k, 'Access-Control'))
                    ->map(fn($v, $k) => [$k, implode(', ', $v)])
                    ->toArray()
            );

            $hasAcao = $response->headers->has('Access-Control-Allow-Origin');
            $this->line(sprintf(
                'Access-Control-Allow-Origin present: %s',
                $hasAcao ? '<fg=green>YES → ' . $response->headers->get('Access-Control-Allow-Origin') . '</>' : '<fg=red>NO</>'
            ));

            if (!$hasAcao) {
                $this->error('>>> HandleCors simulation produced NO Access-Control-Allow-Origin header.');
                $this->error('>>> This confirms runtime configuration causes the CORS failure.');
            } else {
                $this->line('<fg=green>✓ HandleCors simulation PASSED — ACAO header is present.</>');
            }
        } catch (\Throwable $e) {
            $this->error('HandleCors simulation failed: ' . $e->getMessage());
        }

        $this->newLine();

        // ─── Phase 5: Server Info ───
        $this->section('Phase 5: Server Information');

        $this->table(
            ['Property', 'Value'],
            [
                ['PHP Version', phpversion()],
                ['Laravel Version', $this->laravel->version()],
                ['Environment', app()->environment()],
                ['Debug Mode', config('app.debug') ? 'ON' : 'OFF'],
                ['Cache Driver', config('cache.default')],
                ['Session Driver', config('session.driver')],
                ['Queue Driver', config('queue.default')],
                ['Server Software', $_SERVER['SERVER_SOFTWARE'] ?? '(CLI)'],
                ['PHP SAPI', php_sapi_name()],
                ['Document Root', $_SERVER['DOCUMENT_ROOT'] ?? '(not available on CLI)'],
            ]
        );

        $this->newLine();

        // ─── Phase 6: Route List ───
        $this->section('Phase 6: API Routes');

        $routes = Route::getRoutes()->getRoutesByMethod()['OPTIONS'] ?? [];
        $this->line('OPTIONS routes registered: ' . count($routes));
        foreach ($routes as $route) {
            $this->line('  ' . $route->uri());
        }

        $this->newLine();

        // ─── Summary ───
        $this->section('Summary');

        $issues = [];

        $allowedOrigins = $corsConfig['allowed_origins'] ?? [];
        if (!in_array($origin, $allowedOrigins)) {
            $issues[] = "CRITICAL: Origin '{$origin}' not in allowed_origins.";
            $issues[] = "  → HandleCors will NOT emit Access-Control-Allow-Origin.";
            $issues[] = "  → Fix: Add '{$origin}' to config/cors.php allowed_origins.";
        }

        if (!empty($corsConfig['allowed_origins']) && in_array('*', $corsConfig['allowed_origins']) && !empty($corsConfig['supports_credentials'])) {
            $issues[] = "CRITICAL: Wildcard '*' + supports_credentials=true — invalid per CORS spec.";
        }

        if (file_exists($cachedConfigPath)) {
            $issues[] = "WARNING: Cached config exists — verify it includes your latest changes.";
        }

        if (empty($issues)) {
            $this->info('✓ No configuration issues detected by CLI diagnostic.');
            $this->line('The issue may be at the server, proxy, or browser level.');
            $this->line('Run the HTTP diagnostics on the next step.');
        } else {
            foreach ($issues as $issue) {
                $this->warn($issue);
            }
        }

        $this->newLine();
        $this->info('═══════════════════════════════════════════');
        $this->info('  To collect HTTP-level evidence, run:');
        $this->info('  php artisan cors:http-diagnose');
        $this->info('═══════════════════════════════════════════');
        $this->newLine();

        return 0;
    }

    private function section(string $title): void
    {
        $this->line("─── {$title} ───");
    }
}
