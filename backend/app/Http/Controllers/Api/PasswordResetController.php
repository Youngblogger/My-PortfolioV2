<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
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

        try {
            $status = Password::sendResetLink(
                ['email' => $email],
            );

            if ($status === Password::RESET_THROTTLED) {
                return response()->json([
                    'success' => false,
                    'error' => 'Too many attempts. Please try again later.',
                ], 429);
            }

            if ($status === Password::RESET_LINK_SENT) {
                $user = User::where('email', $email)->first();
                if ($user) {
                    AuditLog::create([
                        'user_id' => $user->id,
                        'action' => 'password_reset_requested',
                        'entity_type' => 'user',
                        'entity_id' => $user->id,
                        'metadata' => ['email' => $email],
                        'ip_address' => $request->ip(),
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'If an account with that email address exists, a password reset link has been sent.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Password reset email failed to send', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'We couldn\'t process your password reset request. Please try again later.',
            ], 500);
        }
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

        $status = Password::reset(
            $credentials,
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->save();

                $user->tokens()->delete();

                AuditLog::create([
                    'user_id' => $user->id,
                    'action' => 'password_reset_completed',
                    'entity_type' => 'user',
                    'entity_id' => $user->id,
                    'metadata' => ['email' => $user->email],
                    'ip_address' => request()->ip(),
                ]);
            }
        );

        return match ($status) {
            Password::PASSWORD_RESET => response()->json([
                'success' => true,
                'message' => 'Password has been reset successfully.',
            ]),
            Password::INVALID_TOKEN => response()->json([
                'success' => false,
                'error' => 'Invalid or expired reset token. Please request a new one.',
            ], 400),
            Password::INVALID_USER => response()->json([
                'success' => false,
                'error' => 'Invalid or expired reset token. Please request a new one.',
            ], 400),
            default => response()->json([
                'success' => false,
                'error' => 'We couldn\'t reset your password. Please try again.',
            ], 500),
        };
    }
}
