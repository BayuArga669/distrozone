<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Console\Command;

class UpdateOrderStatus extends Command
{
    protected $signature = 'order:update-status {order_number} {status=paid}';
    protected $description = 'Manually update order status for testing';

    public function handle()
    {
        $orderNumber = $this->argument('order_number');
        $status = $this->argument('status');

        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            $this->error("Order {$orderNumber} not found");
            return 1;
        }

        $oldStatus = $order->status;
        $order->status = $status;
        $order->save();

        // Create payment record if marking as paid
        if ($status === 'paid' || $status === Order::STATUS_PAID) {
            $payment = Payment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'transaction_id' => 'MANUAL-' . now()->timestamp,
                    'amount' => $order->total,
                    'status' => 'success',
                    'payment_details' => json_encode([
                        'payment_type' => $order->payment_method,
                        'manual_update' => true,
                        'updated_at' => now()->toDateTimeString(),
                    ])
                ]
            );

            $this->info("✓ Payment record created (ID: {$payment->id})");
        }

        $this->info("✓ Order {$orderNumber} status updated: {$oldStatus} → {$status}");
        return 0;
    }
}
