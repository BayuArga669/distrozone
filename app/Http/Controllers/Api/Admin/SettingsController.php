<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Get all settings by group
     */
    public function index(Request $request): JsonResponse
    {
        $group = $request->query('group', 'midtrans');

        $settings = Setting::where('group', $group)->get()->mapWithKeys(function ($setting) {
            return [
                $setting->key => [
                    'value' => Setting::get($setting->key),
                    'type' => $setting->type,
                ]
            ];
        });

        return response()->json([
            'settings' => $settings,
        ]);
    }

    /**
     * Update settings
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
        ]);

        foreach ($validated['settings'] as $setting) {
            $existing = Setting::where('key', $setting['key'])->first();

            if ($existing) {
                $existing->update([
                    'value' => is_bool($setting['value'])
                        ? ($setting['value'] ? 'true' : 'false')
                        : ($setting['value'] ?? ''),
                ]);
            }
        }

        return response()->json([
            'message' => 'Settings berhasil diperbarui',
        ]);
    }

    /**
     * Get Midtrans client key (public)
     */
    public function getMidtransClientKey(): JsonResponse
    {
        return response()->json([
            'client_key' => Setting::get('midtrans_client_key', ''),
            'is_production' => Setting::get('midtrans_is_production', false),
        ]);
    }
}
