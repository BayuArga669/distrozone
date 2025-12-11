<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Setting;
use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    public function __construct()
    {
        // Get settings from database, fallback to env
        $serverKey = Setting::get('midtrans_server_key') ?: config('midtrans.server_key');
        $isProduction = Setting::get('midtrans_is_production', false);
        $isSanitized = Setting::get('midtrans_is_sanitized', true);
        $is3ds = Setting::get('midtrans_is_3ds', true);

        Config::$serverKey = $serverKey;
        Config::$isProduction = $isProduction;
        Config::$isSanitized = $isSanitized;
        Config::$is3ds = $is3ds;
    }

    /**
     * Check if Midtrans is configured
     */
    public function isConfigured(): bool
    {
        $serverKey = Setting::get('midtrans_server_key') ?: config('midtrans.server_key');
        return !empty($serverKey);
    }

    /**
     * Get client key for frontend
     */
    public function getClientKey(): string
    {
        return Setting::get('midtrans_client_key') ?: config('midtrans.client_key', '');
    }

    /**
     * Check if in production mode
     */
    public function isProduction(): bool
    {
        return Setting::get('midtrans_is_production', false);
    }

    /**
     * Create Snap token for payment
     */
    public function createSnapToken(Order $order, ?string $paymentMethod = null): array
    {
        $items = $order->items->map(function ($item) {
            return [
                'id' => $item->product_id,
                'price' => (int) $item->price,
                'quantity' => $item->quantity,
                'name' => substr($item->product->name, 0, 50),
            ];
        })->toArray();

        // Add shipping cost as item if exists
        if ($order->shipping_cost > 0) {
            $items[] = [
                'id' => 'SHIPPING',
                'price' => (int) $order->shipping_cost,
                'quantity' => 1,
                'name' => 'Biaya Pengiriman',
            ];
        }

        $params = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => (int) $order->total,
            ],
            'item_details' => $items,
            'customer_details' => [
                'first_name' => $order->user->name,
                'email' => $order->user->email,
                'phone' => $order->shipping_address['phone'] ?? '',
                'shipping_address' => [
                    'first_name' => $order->shipping_address['name'] ?? $order->user->name,
                    'phone' => $order->shipping_address['phone'] ?? '',
                    'address' => $order->shipping_address['address'] ?? '',
                    'city' => $order->shipping_address['city'] ?? '',
                    'postal_code' => $order->shipping_address['postal_code'] ?? '',
                    'country_code' => 'IDN',
                ],
            ],
        ];

        // Configure enabled payments based on selected payment method
        if ($paymentMethod) {
            $enabledPayments = $this->mapPaymentMethod($paymentMethod);
            if ($enabledPayments) {
                $params['enabled_payments'] = $enabledPayments;
            }
        }

        $snapToken = Snap::getSnapToken($params);

        // Create payment record
        Payment::create([
            'order_id' => $order->id,
            'amount' => $order->total,
            'snap_token' => $snapToken,
            'status' => Payment::STATUS_PENDING,
        ]);

        $isProduction = $this->isProduction();

        return [
            'snap_token' => $snapToken,
            'redirect_url' => $isProduction
                ? "https://app.midtrans.com/snap/v2/vtweb/{$snapToken}"
                : "https://app.sandbox.midtrans.com/snap/v2/vtweb/{$snapToken}",
        ];
    }

    /**
     * Handle notification from Midtrans
     */
    public function handleNotification(array $payload): Payment
    {
        $orderId = $payload['order_id'];
        $transactionStatus = $payload['transaction_status'];
        $paymentType = $payload['payment_type'];
        $fraudStatus = $payload['fraud_status'] ?? null;
        $transactionId = $payload['transaction_id'];

        $order = Order::where('order_number', $orderId)->firstOrFail();
        $payment = $order->payment;

        if (!$payment) {
            $payment = Payment::create([
                'order_id' => $order->id,
                'amount' => $order->total,
                'status' => Payment::STATUS_PENDING,
            ]);
        }

        $payment->midtrans_transaction_id = $transactionId;
        $payment->payment_type = $paymentType;
        $payment->payload = $payload;

        // Handle transaction status
        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'accept') {
                $payment->status = Payment::STATUS_SUCCESS;
                $payment->paid_at = now();
                $order->status = Order::STATUS_PAID;
            } else if ($fraudStatus == 'challenge') {
                $payment->status = Payment::STATUS_CHALLENGE;
            }
        } else if ($transactionStatus == 'settlement') {
            $payment->status = Payment::STATUS_SUCCESS;
            $payment->paid_at = now();
            $order->status = Order::STATUS_PAID;
        } else if ($transactionStatus == 'pending') {
            $payment->status = Payment::STATUS_PENDING;
            $order->status = Order::STATUS_UNPAID;
        } else if ($transactionStatus == 'deny' || $transactionStatus == 'cancel') {
            $payment->status = Payment::STATUS_FAILED;
            $order->status = Order::STATUS_CANCELLED;
        } else if ($transactionStatus == 'expire') {
            $payment->status = Payment::STATUS_EXPIRED;
            $order->status = Order::STATUS_EXPIRED;
        }

        $payment->save();
        $order->save();

        return $payment;
    }

    /**
     * Map frontend payment method to Midtrans enabled_payments
     */
    private function mapPaymentMethod(string $paymentMethod): ?array
    {
        $mapping = [
            'gopay' => ['gopay'],
            'dana' => ['dana'],
            'ovo' => ['ovo'],
            'shopeepay' => ['shopeepay'],
            'credit_card' => ['credit_card'],
            'bca_va' => ['bca_va'],
            'bni_va' => ['bni_va'],
            'bri_va' => ['bri_va'],
            'mandiri_va' => ['echannel'], // Mandiri Bill Payment
        ];

        return $mapping[$paymentMethod] ?? null;
    }
}
