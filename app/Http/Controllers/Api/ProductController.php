<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Build cache key based on request parameters
        $cacheKey = 'products_' . md5(json_encode($request->all()));

        $products = Cache::remember($cacheKey, 300, function () use ($request) {
            $query = Product::with('category:id,name,slug')
                ->select(['id', 'category_id', 'name', 'slug', 'price', 'stock', 'image', 'color', 'is_featured'])
                ->active();

            // Filter by category
            if ($request->has('category')) {
                $query->whereHas('category', function ($q) use ($request) {
                    $q->where('slug', $request->category);
                });
            }

            // Filter featured
            if ($request->has('featured') && $request->featured) {
                $query->featured();
            }

            // Search
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            // Sort
            $sortBy = $request->get('sort', 'created_at');
            $sortOrder = $request->get('order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = min($request->get('per_page', 12), 50);
            return $query->paginate($perPage);
        });

        return response()->json($products);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Cache::remember("product_{$slug}", 300, function () use ($slug) {
            $product = Product::with([
                'category:id,name,slug',
                'variants' => function ($q) {
                    $q->active()->orderBy('color')->orderBy('size');
                }
            ])
                ->active()
                ->where('slug', $slug)
                ->firstOrFail();

            // Add computed properties
            $product->has_variants = $product->variants->isNotEmpty();
            $product->total_stock = $product->hasVariants()
                ? $product->variants->sum('stock')
                : $product->stock;

            // Get unique colors with hex
            if ($product->has_variants) {
                $product->available_colors = $product->variants
                    ->unique('color')
                    ->map(fn($v) => [
                        'name' => $v->color,
                        'hex' => $v->color_hex,
                    ])
                    ->values();
            }

            return $product;
        });

        return response()->json($product);
    }

    public function featured(): JsonResponse
    {
        $products = Cache::remember('featured_products', 300, function () {
            return Product::with('category:id,name,slug')
                ->select(['id', 'category_id', 'name', 'slug', 'price', 'stock', 'image', 'color', 'is_featured'])
                ->active()
                ->featured()
                ->limit(8)
                ->get();
        });

        return response()->json($products);
    }
}

