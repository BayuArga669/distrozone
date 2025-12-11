<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    public function __construct(
        private ShippingService $shippingService
    ) {
    }

    /**
     * Calculate shipping cost based on city and item count
     */
    public function calculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'city' => 'required|string|max:100',
            'province' => 'nullable|string|max:100',
            'item_count' => 'required|integer|min:1',
        ]);

        $result = $this->shippingService->calculateShipping(
            $validated['city'],
            $validated['province'] ?? null,
            $validated['item_count']
        );

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    /**
     * Get available shipping regions
     */
    public function regions(): JsonResponse
    {
        return response()->json([
            'regions' => $this->shippingService->getAvailableRegions(),
            'note' => 'Hanya melayani pengiriman ke Pulau Jawa',
            'weight_info' => '1 kg = 3 kaos',
        ]);
    }
}
