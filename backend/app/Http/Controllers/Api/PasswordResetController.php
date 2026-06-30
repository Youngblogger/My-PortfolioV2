<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password as PasswordRule;

class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        $email = $request->email;

        $rateKey = 'password-reset-send:' . $email;
        if (RateLimiter::tooManyAttempts($rateKey, 1)) {
            $seconds = RateLimiter::availableIn($rateKey);
            return response()->json([
                'success' => false,
                'error' => 'Too many attempts. Please try again in ' . $seconds . ' seconds.',
            ], 429);
        }
        RateLimiter::hit($rateKey, 60);

        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'success' => true,
                'message' => 'If that email exists, a password reset link has been sent.',
            ]);
        }

        $token = Password::createToken($user);
        $user->sendPasswordResetNotification($token);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'password_reset_requested',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'metadata' => ['email' => $email],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'If that email exists, a password reset link has been sent.',
        ]);
    }

    public function reset(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email'],
            'password' => [
                'required',
                'confirmed',
                PasswordRule::min(8)
                    ->mixedCase()
                    ->numbers(),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        $credentials = $request->only('email', 'password', 'password_confirmation', 'token');

        $user = User::where('email', $credentials['email'])->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid or expired reset token.',
            ], 400);
        }

        if (!Password::exists($user, $credentials['token'])) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid or expired reset token.',
            ], 400);
        }

        $user->password = Hash::make($credentials['password']);
        $user->save();

        Password::deleteToken($user);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'password_reset_completed',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'metadata' => ['email' => $credentials['email']],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password has been reset successfully.',
        ]);
    }
}
