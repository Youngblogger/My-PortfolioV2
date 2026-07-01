<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserSettingsController extends Controller
{
    public function show(Request $request)
    {
        $profile = Profile::findOrFail($request->user()->id);

        $settings = $profile->metadata['settings'] ?? [
            'email_notifications' => true,
            'push_notifications' => true,
            'sms_notifications' => false,
            'marketing_emails' => false,
        ];

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $profile = Profile::findOrFail($request->user()->id);

        $validator = Validator::make($request->all(), [
            'email_notifications' => ['boolean'],
            'push_notifications' => ['boolean'],
            'sms_notifications' => ['boolean'],
            'marketing_emails' => ['boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $metadata = $profile->metadata ?? [];
        $metadata['settings'] = array_merge(
            $metadata['settings'] ?? [
                'email_notifications' => true,
                'push_notifications' => true,
                'sms_notifications' => false,
                'marketing_emails' => false,
            ],
            $request->only(['email_notifications', 'push_notifications', 'sms_notifications', 'marketing_emails'])
        );

        $profile->update(['metadata' => $metadata]);

        return response()->json([
            'success' => true,
            'data' => $metadata['settings'],
        ]);
    }
}
