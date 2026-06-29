<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureEmailIsVerified
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || !$request->user()->email_verified_at) {
            return response()->json([
                'success' => false,
                'error' => 'Email not verified',
            ], 403);
        }

        return $next($request);
    }
}
