<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use App\Services\AuditService;
use Illuminate\Http\Request;
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

        Profile::create([
            'id' => $user->id,
            'email' => $request->email,
            'full_name' => $request->full_name,
            'role' => 'student',
        ]);

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

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'verification_url' => $verificationUrl,
            'requires_verification' => true,
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

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid credentials',
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        $profile = $user->profile;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'full_name' => $profile?->full_name,
                'avatar_url' => $profile?->avatar_url,
                'role' => $profile?->role ?? 'student',
            ],
        ]);
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
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}
