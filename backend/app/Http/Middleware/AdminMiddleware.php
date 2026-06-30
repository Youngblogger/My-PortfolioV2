<?php

namespace App\Http\Middleware;

use App\Models\AdminUser;
use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->profile?->role !== 'admin') {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        // For token-based auth, verify the token has the admin:access ability
        // For session-based auth, the session already proves authentication
        if ($user->currentAccessToken() && !$user->tokenCan('admin:access')) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid token scope. Admin token required.',
            ], 403);
        }

        $adminUser = AdminUser::where('user_id', $user->id)->first();

        if ($adminUser && !$adminUser->is_active) {
            return response()->json([
                'success' => false,
                'error' => 'Your admin account has been suspended.',
            ], 403);
        }

        return $next($request);
    }
}
