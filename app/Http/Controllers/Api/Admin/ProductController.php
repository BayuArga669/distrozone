<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category');

        // Search
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true)->where('stock', '>', 0);
            } elseif ($request->status === 'out_of_stock') {
                $query->where('stock', 0);
            } elseif ($request->status === 'low_stock') {
                $query->where('stock', '>', 0)->where('stock', '<=', 10);
            }
        }

        // Sort
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = min($request->get('per_page', 10), 100);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'color' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        // Ensure unique slug
        $count = 1;
        $originalSlug = $validated['slug'];
        while (Product::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $count++;
        }

        $product = Product::create($validated);
        $product->load('category');

        // Clear product cache
        $this->clearProductCache();

        return response()->json([
            'message' => 'Produk berhasil ditambahkan',
            'product' => $product,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with('category')->findOrFail($id);
        return response()->json($product);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'color' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        if (isset($validated['name']) && $validated['name'] !== $product->name) {
            $validated['slug'] = Str::slug($validated['name']);
            $count = 1;
            $originalSlug = $validated['slug'];
            while (Product::where('slug', $validated['slug'])->where('id', '!=', $id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $count++;
            }
        }

        $product->update($validated);
        $product->load('category');

        // Clear product cache
        $this->clearProductCache($product->slug);

        return response()->json([
            'message' => 'Produk berhasil diperbarui',
            'product' => $product,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $slug = $product->slug;
        $product->delete();

        // Clear product cache
        $this->clearProductCache($slug);

        return response()->json([
            'message' => 'Produk berhasil dihapus',
        ]);
    }

    /**
     * Clear product related cache
     */
    private function clearProductCache(?string $slug = null): void
    {
        // Clear list caches
        Cache::forget('featured_products');

        // Clear specific product cache if slug provided
        if ($slug) {
            Cache::forget("product_{$slug}");
        }

        // Clear product list cache patterns (simplified approach)
        // In production, consider using Cache::tags() or Redis for better pattern clearing
        Cache::flush();
    }
}
