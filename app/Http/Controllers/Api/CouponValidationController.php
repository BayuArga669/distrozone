<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CouponValidationController extends Controller
{
    /**
     * Validate a coupon code
     */
    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'order_amount' => 'required|numeric|min:0',
        ]);

        $code = strtoupper($request->code);
        $orderAmount = (float) $request->order_amount;

        // Find coupon by code
        $coupon = Coupon::where('code', $code)->first();

        if (!$coupon) {
            return response()->json([
                'valid' => false,
                'message' => 'Kode kupon tidak ditemukan',
            ], 404);
        }

        // Check if expired
        if ($coupon->expires_at && now()->isAfter($coupon->expires_at)) {
            return response()->json([
                'valid' => false,
                'message' => 'Kode kupon sudah kadaluarsa',
            ], 400);
        }

        // Check if active
        if (!$coupon->is_active) {
            return response()->json([
                'valid' => false,
                'message' => 'Kode kupon tidak aktif',
            ], 400);
        }

        // Check usage limit
        if ($coupon->max_uses !== null && $coupon->used_count >= $coupon->max_uses) {
            return response()->json([
                'valid' => false,
                'message' => 'Kode kupon sudah mencapai batas pemakaian',
            ], 400);
        }

        // Check minimum order
        if ($orderAmount < $coupon->min_order) {
            return response()->json([
                'valid' => false,
                'message' => sprintf(
                    'Minimal belanja Rp %s untuk menggunakan kupon ini',
                    number_format($coupon->min_order, 0, ',', '.')
                ),
            ], 400);
        }

        // Calculate discount
        $discountAmount = $coupon->calculateDiscount($orderAmount);

        return response()->json([
            'valid' => true,
            'message' => 'Kode kupon valid',
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'type' => $coupon->type,
                'value' => $coupon->value,
                'discount_amount' => $discountAmount,
            ],
        ]);
    }
}
