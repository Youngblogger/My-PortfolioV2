<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Cache;

class VerificationController extends Controller
{
    public function __construct(private AuditService $audit) {}

    public function sendVerificationEmail(Request $request)
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json([
                'success' => false,
                'error' => 'Email already verified',
            ], 400);
        }

        $cacheKey = 'verification_sent_' . $user->id;
        if (Cache::has($cacheKey)) {
            return response()->json([
                'success' => false,
                'error' => 'Please wait before requesting another verification email',
            ], 429);
        }

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addHours(48),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $user->email_verified_at = null;
        $user->save();

        Cache::put($cacheKey, true, 60);

        $this->audit->log(
            'verification_email_sent',
            $user->id,
            'User',
            $user->id,
            ['email' => $user->email]
        );

        return response()->json([
            'success' => true,
            'url' => $url,
        ]);
    }

    public function verify(Request $request, $id, $hash)
    {
        if (!$request->hasValidSignature()) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid or expired verification link',
            ], 400);
        }

        $user = User::findOrFail($id);

        if (!hash_equals(sha1($user->email), (string) $hash)) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid verification link',
            ], 400);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'success' => true,
                'message' => 'Email already verified',
            ]);
        }

        $user->email_verified_at = now();
        $user->save();

        $this->audit->log(
            'email_verified',
            $user->id,
            'User',
            $user->id,
            ['email' => $user->email]
        );

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully',
        ]);
    }

    public function resend(Request $request)
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json([
                'success' => false,
                'error' => 'Email already verified',
            ], 400);
        }

        $cacheKey = 'verification_sent_' . $user->id;
        if (Cache::has($cacheKey)) {
            return response()->json([
                'success' => false,
                'error' => 'Please wait before requesting another verification email',
            ], 429);
        }

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addHours(48),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        Cache::put($cacheKey, true, 60);

        $this->audit->log(
            'verification_email_resend',
            $user->id,
            'User',
            $user->id,
            ['email' => $user->email]
        );

        return response()->json([
            'success' => true,
            'url' => $url,
        ]);
    }
}
