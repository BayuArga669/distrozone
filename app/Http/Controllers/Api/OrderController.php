<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with(['items.product', 'payment'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::with(['items.product', 'items.variant', 'payment'])
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        // Calculate subtotal (total - shipping_cost)
        $subtotal = $order->total - ($order->shipping_cost ?? 0);

        $orderData = $order->toArray();
        $orderData['subtotal'] = $subtotal;

        return response()->json($orderData);
    }

    public function store(Request $request, MidtransService $midtransService): JsonResponse
    {
        $validated = $request->validate([
            'shipping_address.name' => 'required|string|max:255',
            'shipping_address.phone' => 'required|string|max:20',
            'shipping_address.address' => 'required|string|max:500',
            'shipping_address.city' => 'required|string|max:100',
            'shipping_address.postal_code' => 'required|string|max:10',
            'notes' => 'nullable|string|max:500',
            'shipping_cost' => 'nullable|numeric|min:0',
            'payment_method' => 'required|string|in:gopay,dana,ovo,shopeepay,credit_card,bca_va,bni_va,bri_va,mandiri_va,cod',
        ]);

        $cart = Cart::with(['items.product', 'items.variant'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'message' => 'Keranjang belanja kosong',
            ], 400);
        }

        // Validate stock - check variant stock if variant exists
        foreach ($cart->items as $item) {
            if ($item->variant_id && $item->variant) {
                // Check variant stock
                if ($item->variant->stock < $item->quantity) {
                    return response()->json([
                        'message' => "Stok {$item->product->name} ({$item->variant->color} - {$item->variant->size}) tidak mencukupi",
                    ], 400);
                }
            } else {
                // Check product stock
                if ($item->product->stock < $item->quantity) {
                    return response()->json([
                        'message' => "Stok {$item->product->name} tidak mencukupi",
                    ], 400);
                }
            }
        }

        DB::beginTransaction();
        try {
            $subtotal = $cart->total;
            $shippingCost = $validated['shipping_cost'] ?? 0;
            $total = $subtotal + $shippingCost;
            $paymentMethod = $validated['payment_method'];

            // Create order
            $order = Order::create([
                'user_id' => $request->user()->id,
                'status' => Order::STATUS_UNPAID,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'shipping_address' => $validated['shipping_address'],
                'payment_method' => $paymentMethod,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create order items and reduce stock
            foreach ($cart->items as $item) {
                // Calculate price with variant adjustment
                $price = $item->product->price;
                if ($item->variant_id && $item->variant) {
                    $price += $item->variant->price_adjustment ?? 0;
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'quantity' => $item->quantity,
                    'price' => $price,
                ]);

                // Reduce stock from variant or product
                if ($item->variant_id && $item->variant) {
                    $item->variant->decrement('stock', $item->quantity);
                } else {
                    $item->product->decrement('stock', $item->quantity);
                }
            }

            // Clear cart
            $cart->items()->delete();

            // Handle payment based on method
            $order->load('items.product', 'user');
            $snapToken = null;
            $redirectUrl = null;

            // Use Midtrans for all online payments (not COD)
            if ($paymentMethod !== 'cod') {
                // Create Midtrans snap token for online payment
                try {
                    if (config('midtrans.server_key')) {
                        $paymentData = $midtransService->createSnapToken($order, $paymentMethod);
                        $snapToken = $paymentData['snap_token'];
                        $redirectUrl = $paymentData['redirect_url'];

                        // Save snap_token to order for later use
                        $order->update(['snap_token' => $snapToken]);
                    }
                } catch (\Exception $e) {
                    \Log::warning('Midtrans payment creation failed: ' . $e->getMessage());
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Order berhasil dibuat',
                'data' => $order->load('items.product', 'payment'),
                'snap_token' => $snapToken,
                'redirect_url' => $redirectUrl,
                'payment_method' => $paymentMethod,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Order creation failed: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Terjadi kesalahan saat membuat order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
