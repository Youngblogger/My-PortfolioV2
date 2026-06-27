<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CorsHttpDiagnose extends Command
{
    protected $signature = 'cors:http-diagnose
        {--url=https://codemafia.ng/api/v1/courses : Full API URL to test}
        {--origin=http://localhost:3000 : Origin header value}
        {--token= : Optional Bearer token for authenticated tests}';

    protected $description = 'HTTP-level CORS diagnostic — tests actual request flow';

    public function handle(): int
    {
        $url = $this->option('url');
        $origin = $this->option('origin');
        $token = $this->option('token');

        $this->newLine();
        $this->info('══════════════════════════════════════════════════');
        $this->info('  CODEMAFIA CORS HTTP Diagnostic');
        $this->info('  Target: ' . $url);
        $this->info('  Origin: ' . $origin);
        $this->info('══════════════════════════════════════════════════');
        $this->newLine();

        // ─── Test 1: Check what server is running ───
        $this->section('Test 1: Server Identification');

        $this->execCurl("curl -sI '{$url}' -o /dev/null -w '%{http_code}'", 'Server check');
        $serverInfo = $this->execCurl("curl -sI '{$url}' 2>&1 | grep -i '^server:'", 'Server header', false);
        $this->line('Server: ' . ($serverInfo['stdout'] ?: 'not detected'));
        $this->newLine();

        // ─── Test 2: OPTIONS preflight (the critical test) ───
        $this->section('Test 2: OPTIONS Preflight');

        $cmd = sprintf(
            "curl -v -X OPTIONS '%s' -H 'Origin: %s' -H 'Access-Control-Request-Method: GET' 2>&1",
            $url,
            $origin
        );
        $result = $this->execCurl($cmd, 'OPTIONS preflight');

        $statusCode = $this->execCurl(
            sprintf("curl -s -o /dev/null -w '%%{http_code}' -X OPTIONS '%s' -H 'Origin: %s' -H 'Access-Control-Request-Method: GET'", $url, $origin),
            'Status code',
            false
        );

        $this->line('HTTP Status: ' . $statusCode['stdout']);
        $this->line('');

        // Extract CORS headers
        $headers = $result['stdout'];
        $this->parseAndDisplayHeaders($headers, [
            'access-control-allow-origin',
            'access-control-allow-credentials',
            'access-control-allow-methods',
            'access-control-allow-headers',
            'access-control-max-age',
            'vary',
            'x-cors-debug',
            'location',
            'server',
            'cf-ray',
        ]);

        $this->newLine();

        // Check for redirect
        if (preg_match('/^< HTTP.*3\d\d/m', $headers)) {
            $location = '';
            if (preg_match('/^< location: (.+)$/im', $headers, $m)) {
                $location = $m[1];
            }
            $this->warn('>>> REDIRECT DETECTED <<<');
            $this->warn('The OPTIONS request is being redirected.');
            $this->warn('Browser will abort the preflight on redirect.');
            $this->warn('Location: ' . $location);
            $this->warn('Check Cloudflare, APP_URL, .htaccess trailing slash rewrite.');
        }

        $hasAcao = preg_match('/access-control-allow-origin/i', $headers);
        $this->line(sprintf(
            'Access-Control-Allow-Origin: %s',
            $hasAcao ? '<fg=green>PRESENT</>' : '<fg=red>MISSING</>'
        ));

        $this->newLine();

        // ─── Test 3: GET request ───
        $this->section('Test 3: GET Request');

        $result = $this->execCurl(
            sprintf("curl -v '%s' -H 'Origin: %s' 2>&1", $url, $origin),
            'GET request'
        );
        $this->parseAndDisplayHeaders($result['stdout'], [
            'access-control-allow-origin',
            'access-control-allow-credentials',
            'content-type',
            'x-cors-debug',
        ]);

        $this->newLine();

        // ─── Test 4: OPTIONS on auth endpoint ───
        $this->section('Test 4: OPTIONS on Auth Endpoint');

        $authUrl = preg_replace('#/courses.*#', '/auth/login', $url);
        $result = $this->execCurl(
            sprintf("curl -v -X OPTIONS '%s' -H 'Origin: %s' -H 'Access-Control-Request-Method: POST' 2>&1", $authUrl, $origin),
            'OPTIONS auth'
        );
        $this->parseAndDisplayHeaders($result['stdout'], [
            'access-control-allow-origin',
            'http_code',
            'status',
        ]);

        $this->newLine();

        // ─── Test 5: Authenticated request (if token provided) ───
        if ($token) {
            $this->section('Test 5: Authenticated GET');

            $userUrl = preg_replace('#/courses.*#', '/auth/user', $url);
            $result = $this->execCurl(
                sprintf("curl -v '%s' -H 'Origin: %s' -H 'Authorization: Bearer %s' 2>&1", $userUrl, $origin, $token),
                'Auth GET'
            );
            $this->parseAndDisplayHeaders($result['stdout'], [
                'access-control-allow-origin',
                'access-control-allow-credentials',
                'http_code',
                'content-type',
            ]);
            $this->newLine();
        }

        // ─── Test 6: Check for Cloudflare ───
        $this->section('Test 6: Cloudflare Detection');

        $hasCfRay = preg_match('/cf-ray/i', $headers);
        $this->line(sprintf('Cloudflare detected: %s', $hasCfRay ? '<fg=yellow>YES — request is proxied through Cloudflare</>' : '<fg=green>No — direct to origin</>'));

        if ($hasCfRay) {
            $this->warn('Cloudflare may be intercepting or modifying OPTIONS responses.');
            $this->warn('Check Cloudflare dashboard for:');
            $this->warn('  ● Cache Rules — ensure api/* bypasses cache');
            $this->warn('  ● Transform Rules — ensure no rule strips ACAO');
            $this->warn('  ● WAF — ensure no rule blocks OPTIONS');
            $this->warn('  ● SSL/TLS — ensure Full (strict)');
            $this->warn('');
            $this->line('Test DNS-only (grey cloud) to bypass Cloudflare:');
            $this->line('  nslookup ' . parse_url($url, PHP_URL_HOST));
            $this->line('  Then curl directly to origin IP with Host header set.');
        }

        $this->newLine();

        // ─── Summary ───
        $this->section('Diagnosis');

        if (!$hasAcao) {
            $this->error('╔══════════════════════════════════════════════════════╗');
            $this->error('║  ROOT CAUSE CONFIRMED                              ║');
            $this->error('╠══════════════════════════════════════════════════════╣');
            $this->error('║  OPTIONS preflight response is MISSING              ║');
            $this->error('║  Access-Control-Allow-Origin header.                ║');
            $this->error('║                                                    ║');
            $this->error('║  Next step: Run "php artisan cors:diagnose" to      ║');
            $this->error('║  check runtime allowed_origins config.              ║');
            $this->error('╚══════════════════════════════════════════════════════╝');
        } else {
            $this->info('✓ OPTIONS preflight returns Access-Control-Allow-Origin.');
            $this->line('The CORS config appears correct at the HTTP level.');
            $this->line('Check browser-specific issues:');
            $this->line('  ● Clear browser cache (especially preflight cache)');
            $this->line('  ● Check for mixed content (HTTP page calling HTTPS API)');
            $this->line('  ● Check browser console for detailed error messages');
        }

        $redirectDetected = preg_match('/^< HTTP.*3\d\d/m', $headers);
        if ($redirectDetected) {
            $this->error('╔══════════════════════════════════════════════════════╗');
            $this->error('║  REDIRECT DETECTED                                 ║');
            $this->error('║  OPTIONS request is being redirected.               ║');
            $this->error('║  Browsers do NOT follow redirects on preflight.     ║');
            $this->error('║  Fix the redirect at the server/Cloudflare level.   ║');
            $this->error('╚══════════════════════════════════════════════════════╝');
        }

        $this->newLine();

        return 0;
    }

    private function execCurl(string $cmd, string $label, bool $showOutput = true): array
    {
        $this->line("Running: {$label}...");
        $output = [];
        $returnCode = 0;
        exec($cmd, $output, $returnCode);
        $stdout = implode("\n", $output);

        if ($showOutput) {
            foreach ($output as $line) {
                // Only show header and status lines
                if (preg_match('/^(< |> |\* )/', $line) || preg_match('/^HTTP/', $line)) {
                    $this->line($line);
                }
            }
        }

        return ['stdout' => $stdout, 'code' => $returnCode];
    }

    private function parseAndDisplayHeaders(string $curlOutput, array $headersToShow): void
    {
        $this->table(
            ['Header', 'Value'],
            collect($headersToShow)
                ->map(function ($header) use ($curlOutput) {
                    $pattern = '/^< ' . preg_quote($header, '/') . ': (.+)$/im';
                    if (preg_match($pattern, $curlOutput, $m)) {
                        $value = trim($m[1]);
                        $isError = in_array($header, ['access-control-allow-origin']) && empty($value);
                        return [$header, $isError ? '<fg=red>MISSING</>' : $value];
                    }
                    // Try case-insensitive
                    $pattern = '/^< ' . $header . ': (.+)$/im';
                    if (preg_match($pattern, $curlOutput, $m)) {
                        return [$header, trim($m[1])];
                    }
                    return [$header, '<fg=yellow>not found</>'];
                })
                ->toArray()
        );
    }

    private function section(string $title): void
    {
        $this->line("─── {$title} ───");
    }
}
