<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AdminUser;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminAuthController extends Controller
{
    public function __construct(private AuditService $audit) {}

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid credentials',
            ], 401);
        }

        $profile = $user->profile;

        if (!$profile || $profile->role !== 'admin') {
            $this->audit->log('admin_login_failed', $user->id, 'User', $user->id, [
                'reason' => 'not_admin',
                'ip' => $request->ip(),
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $adminUser = AdminUser::where('user_id', $user->id)->first();

        if ($adminUser && !$adminUser->is_active) {
            $this->audit->log('admin_login_failed', $user->id, 'AdminUser', $adminUser->id, [
                'reason' => 'account_suspended',
                'ip' => $request->ip(),
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Your admin account has been suspended.',
            ], 403);
        }

        Auth::guard('web')->login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        if ($adminUser) {
            $adminUser->update(['last_login_at' => now()]);
        }

        $this->audit->log('admin_login', $user->id, 'AdminUser', $adminUser?->id, [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'full_name' => $profile->full_name,
                'avatar_url' => $profile->avatar_url,
                'role' => $profile->role,
                'admin_role' => $adminUser?->role ?? 'super_admin',
            ],
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;
        $adminUser = AdminUser::where('user_id', $user->id)->first();

        if (!$profile || $profile->role !== 'admin') {
            return response()->json(['success' => false], 403);
        }

        if ($adminUser && !$adminUser->is_active) {
            return response()->json(['success' => false, 'error' => 'Account suspended'], 403);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'full_name' => $profile->full_name,
                'avatar_url' => $profile->avatar_url,
                'role' => $profile->role,
                'admin_role' => $adminUser?->role ?? 'super_admin',
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        if (!$profile || $profile->role !== 'admin') {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $this->audit->log('admin_logout', $user->id, 'User', $user->id, [
            'ip' => $request->ip(),
        ]);

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['success' => true]);
    }
}
