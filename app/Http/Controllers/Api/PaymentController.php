<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function notification(Request $request, MidtransService $midtransService): JsonResponse
    {
        try {
            $payload = $request->all();

            // Log incoming notification for debugging
            \Log::info('Midtrans notification received', $payload);

            // Check if this is a test notification (no signature_key OR order_id contains test pattern)
            $orderId = $payload['order_id'] ?? '';
            $isTestNotification = !isset($payload['signature_key']) ||
                str_contains($orderId, 'payment_notif_test');

            if ($isTestNotification) {
                \Log::info('Test notification detected, skipping signature verification', [
                    'order_id' => $orderId
                ]);
                return response()->json([
                    'message' => 'Test notification received successfully',
                    'order_id' => $orderId,
                ]);
            }

            // Verify signature for real notifications
            $isProduction = config('midtrans.is_production');
            $serverKey = config('midtrans.server_key');
            $signatureKey = $payload['signature_key'];
            $statusCode = $payload['status_code'] ?? '';
            $grossAmount = $payload['gross_amount'] ?? '';

            $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

            // Only enforce strict signature validation in production
            if ($signatureKey !== $expectedSignature) {
                \Log::warning('Midtrans signature mismatch', [
                    'is_production' => $isProduction,
                    'order_id' => $orderId,
                    'expected' => substr($expectedSignature, 0, 20) . '...',
                    'received' => substr($signatureKey, 0, 20) . '...',
                ]);

                // In production, reject invalid signatures
                if ($isProduction) {
                    return response()->json([
                        'message' => 'Invalid signature',
                    ], 401);
                }

                // In sandbox, log warning but continue processing
                \Log::info('Sandbox mode: continuing despite signature mismatch for order ' . $orderId);
            }

            $payment = $midtransService->handleNotification($payload);

            return response()->json([
                'message' => 'Notification handled successfully',
                'status' => $payment->status,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error handling Midtrans notification: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Error handling notification',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get Midtrans client key for frontend
     */
    public function clientKey(): JsonResponse
    {
        return response()->json([
            'client_key' => config('midtrans.client_key'),
            'is_production' => config('midtrans.is_production'),
        ]);
    }
}
