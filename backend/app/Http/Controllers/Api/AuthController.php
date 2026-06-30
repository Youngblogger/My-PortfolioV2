<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function __construct(private AuditService $audit) {}

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'email_verified_at' => null,
        ]);

        $profile = new Profile([
            'id' => $user->id,
            'email' => $request->email,
            'full_name' => $request->full_name,
        ]);
        $profile->role = 'student';
        $profile->save();

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addHours(48),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $this->audit->log(
            'user_registered',
            $user->id,
            'User',
            $user->id,
            ['email' => $user->email]
        );

        $this->audit->log(
            'verification_email_sent',
            $user->id,
            'User',
            $user->id,
            ['email' => $user->email]
        );

        return response()->json([
            'success' => true,
            'requires_verification' => true,
            'verification_url' => $verificationUrl,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'full_name' => $request->full_name,
            ],
        ], 201);
    }

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

        if (Auth::guard('web')->attempt(
            $request->only('email', 'password'),
            $request->boolean('remember')
        )) {
            $request->session()->regenerate();

            $user = Auth::guard('web')->user();
            $profile = $user->profile;

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'full_name' => $profile?->full_name,
                    'avatar_url' => $profile?->avatar_url,
                    'role' => $profile?->role ?? 'student',
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => 'Invalid credentials',
        ], 401);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'full_name' => $profile?->full_name,
                'avatar_url' => $profile?->avatar_url,
                'role' => $profile?->role ?? 'student',
            ],
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
        ]);
    }
}
