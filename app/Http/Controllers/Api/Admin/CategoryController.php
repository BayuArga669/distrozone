<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Category::withCount([
            'products' => function ($q) {
                $q->where('is_active', true);
            }
        ]);

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $categories = $query->orderBy('name')->get();

        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Kategori berhasil ditambahkan',
            'category' => $category,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $category = Category::withCount('products')->findOrFail($id);
        return response()->json($category);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if (isset($validated['name']) && $validated['name'] !== $category->name) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return response()->json([
            'message' => 'Kategori berhasil diperbarui',
            'category' => $category,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        if ($category->products()->count() > 0) {
            return response()->json([
                'message' => 'Tidak dapat menghapus kategori yang memiliki produk',
            ], 400);
        }

        $category->delete();

        return response()->json([
            'message' => 'Kategori berhasil dihapus',
        ]);
    }
}
