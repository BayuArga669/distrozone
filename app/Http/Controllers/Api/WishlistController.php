<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Get user's wishlist
     */
    public function index(Request $request): JsonResponse
    {
        $wishlist = Wishlist::with('product.category')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => $wishlist,
            'product_ids' => $wishlist->pluck('product_id'),
        ]);
    }

    /**
     * Add product to wishlist
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $wishlist = Wishlist::firstOrCreate([
            'user_id' => $request->user()->id,
            'product_id' => $request->product_id,
        ]);

        return response()->json([
            'message' => 'Product added to wishlist',
            'data' => $wishlist->load('product'),
        ], 201);
    }

    /**
     * Remove product from wishlist
     */
    public function destroy(Request $request, int $productId): JsonResponse
    {
        $deleted = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->delete();

        if ($deleted) {
            return response()->json([
                'message' => 'Product removed from wishlist',
            ]);
        }

        return response()->json([
            'message' => 'Product not found in wishlist',
        ], 404);
    }

    /**
     * Toggle wishlist (add if not exists, remove if exists)
     */
    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $existing = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'message' => 'Product removed from wishlist',
                'is_wishlisted' => false,
            ]);
        }

        Wishlist::create([
            'user_id' => $request->user()->id,
            'product_id' => $request->product_id,
        ]);

        return response()->json([
            'message' => 'Product added to wishlist',
            'is_wishlisted' => true,
        ]);
    }

    /**
     * Check if product is in wishlist
     */
    public function check(Request $request, int $productId): JsonResponse
    {
        $exists = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->exists();

        return response()->json([
            'is_wishlisted' => $exists,
        ]);
    }
}
