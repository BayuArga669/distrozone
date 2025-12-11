<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request->user());
        $cart->load('items.product', 'items.variant');

        return response()->json([
            'cart' => $cart,
            'total' => $cart->total,
            'total_items' => $cart->total_items,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if (!$product->is_active) {
            return response()->json([
                'message' => 'Produk tidak tersedia',
            ], 400);
        }

        // Check variant stock if variant is specified
        if (!empty($validated['variant_id'])) {
            $variant = ProductVariant::where('id', $validated['variant_id'])
                ->where('product_id', $validated['product_id'])
                ->where('is_active', true)
                ->first();

            if (!$variant) {
                return response()->json([
                    'message' => 'Variant tidak tersedia',
                ], 400);
            }

            if ($variant->stock < $validated['quantity']) {
                return response()->json([
                    'message' => 'Stok variant tidak mencukupi',
                ], 400);
            }
        } else {
            // No variant - check product stock
            if ($product->stock < $validated['quantity']) {
                return response()->json([
                    'message' => 'Stok produk tidak mencukupi',
                ], 400);
            }
        }

        $cart = $this->getOrCreateCart($request->user());

        // Check if same product+variant already in cart
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $validated['product_id'])
            ->where('variant_id', $validated['variant_id'] ?? null)
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $validated['quantity'];
            $cartItem->save();
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $validated['product_id'],
                'variant_id' => $validated['variant_id'] ?? null,
                'quantity' => $validated['quantity'],
            ]);
        }

        $cart->load('items.product', 'items.variant');

        return response()->json([
            'message' => 'Produk berhasil ditambahkan ke keranjang',
            'cart' => $cart,
            'total' => $cart->total,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'variant_id' => 'nullable|exists:product_variants,id',
        ]);

        $cart = $this->getOrCreateCart($request->user());
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('id', $id)
            ->firstOrFail();

        // If variant_id is being changed
        if (isset($validated['variant_id'])) {
            $newVariant = ProductVariant::find($validated['variant_id']);

            // Verify the variant belongs to the same product
            if ($newVariant->product_id !== $cartItem->product_id) {
                return response()->json([
                    'message' => 'Variant tidak valid untuk produk ini',
                ], 400);
            }

            // Check stock for new variant
            if ($newVariant->stock < $validated['quantity']) {
                return response()->json([
                    'message' => 'Stok variant tidak mencukupi',
                ], 400);
            }

            $cartItem->variant_id = $validated['variant_id'];
        } else {
            // Check stock based on current variant or product
            if ($cartItem->variant_id) {
                if ($cartItem->variant->stock < $validated['quantity']) {
                    return response()->json([
                        'message' => 'Stok variant tidak mencukupi',
                    ], 400);
                }
            } else {
                if ($cartItem->product->stock < $validated['quantity']) {
                    return response()->json([
                        'message' => 'Stok produk tidak mencukupi',
                    ], 400);
                }
            }
        }

        $cartItem->quantity = $validated['quantity'];
        $cartItem->save();

        $cart->load('items.product', 'items.variant');

        return response()->json([
            'message' => 'Keranjang berhasil diperbarui',
            'cart' => $cart,
            'total' => $cart->total,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $cart = $this->getOrCreateCart($request->user());
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('id', $id)
            ->firstOrFail();

        $cartItem->delete();

        $cart->load('items.product', 'items.variant');

        return response()->json([
            'message' => 'Produk berhasil dihapus dari keranjang',
            'cart' => $cart,
            'total' => $cart->total,
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request->user());
        $cart->items()->delete();

        return response()->json([
            'message' => 'Keranjang berhasil dikosongkan',
        ]);
    }

    private function getOrCreateCart($user): Cart
    {
        return Cart::firstOrCreate(['user_id' => $user->id]);
    }
}
