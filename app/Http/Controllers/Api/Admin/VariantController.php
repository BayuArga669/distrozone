<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VariantController extends Controller
{
    /**
     * Get all variants for a product
     */
    public function index(int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $variants = $product->variants()->orderBy('color')->orderBy('size')->get();

        return response()->json([
            'variants' => $variants,
            'product' => $product->only(['id', 'name', 'price']),
        ]);
    }

    /**
     * Create a new variant
     */
    public function store(Request $request, int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'color' => 'required|string|max:50',
            'color_hex' => 'nullable|string|max:7',
            'image' => 'nullable|string',
            'size' => 'required|string|max:20',
            'stock' => 'required|integer|min:0',
            'price_adjustment' => 'nullable|numeric',
            'sku' => 'nullable|string|max:50|unique:product_variants,sku',
            'is_active' => 'boolean',
        ]);

        $validated['product_id'] = $productId;
        $validated['price_adjustment'] = $validated['price_adjustment'] ?? 0;
        $validated['is_active'] = $validated['is_active'] ?? true;

        // Check for duplicate color+size combination
        $exists = ProductVariant::where('product_id', $productId)
            ->where('color', $validated['color'])
            ->where('size', $validated['size'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Kombinasi warna dan ukuran sudah ada',
            ], 422);
        }

        $variant = ProductVariant::create($validated);

        return response()->json([
            'message' => 'Variant berhasil ditambahkan',
            'variant' => $variant,
        ], 201);
    }

    /**
     * Update a variant
     */
    public function update(Request $request, int $productId, int $variantId): JsonResponse
    {
        $variant = ProductVariant::where('product_id', $productId)
            ->where('id', $variantId)
            ->firstOrFail();

        $validated = $request->validate([
            'color' => 'sometimes|string|max:50',
            'color_hex' => 'nullable|string|max:7',
            'image' => 'nullable|string',
            'size' => 'nullable|string|max:20',
            'stock' => 'sometimes|integer|min:0',
            'price_adjustment' => 'nullable|numeric',
            'sku' => 'nullable|string|max:50|unique:product_variants,sku,' . $variantId,
            'is_active' => 'boolean',
        ]);

        // Check for duplicate color+size combination (excluding current variant)
        if (isset($validated['color']) || isset($validated['size'])) {
            $color = $validated['color'] ?? $variant->color;
            $size = $validated['size'] ?? $variant->size;

            $exists = ProductVariant::where('product_id', $productId)
                ->where('color', $color)
                ->where('size', $size)
                ->where('id', '!=', $variantId)
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Kombinasi warna dan ukuran sudah ada',
                ], 422);
            }
        }

        $variant->update($validated);

        return response()->json([
            'message' => 'Variant berhasil diperbarui',
            'variant' => $variant,
        ]);
    }

    /**
     * Delete a variant
     */
    public function destroy(int $productId, int $variantId): JsonResponse
    {
        $variant = ProductVariant::where('product_id', $productId)
            ->where('id', $variantId)
            ->firstOrFail();

        $variant->delete();

        return response()->json([
            'message' => 'Variant berhasil dihapus',
        ]);
    }

    /**
     * Bulk update stock
     */
    public function bulkUpdateStock(Request $request, int $productId): JsonResponse
    {
        $validated = $request->validate([
            'variants' => 'required|array',
            'variants.*.id' => 'required|exists:product_variants,id',
            'variants.*.stock' => 'required|integer|min:0',
        ]);

        foreach ($validated['variants'] as $variantData) {
            ProductVariant::where('id', $variantData['id'])
                ->where('product_id', $productId)
                ->update(['stock' => $variantData['stock']]);
        }

        return response()->json([
            'message' => 'Stock berhasil diperbarui',
        ]);
    }
}
