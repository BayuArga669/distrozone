<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Cache::remember('categories_list', 300, function () {
            return Category::select(['id', 'name', 'slug', 'is_active'])
                ->where('is_active', true)
                ->withCount([
                    'products' => function ($query) {
                        $query->where('is_active', true);
                    }
                ])
                ->orderBy('name')
                ->get();
        });

        return response()->json($categories);
    }

    public function show(string $slug): JsonResponse
    {
        $category = Cache::remember("category_{$slug}", 300, function () use ($slug) {
            return Category::where('slug', $slug)
                ->where('is_active', true)
                ->withCount('products')
                ->firstOrFail();
        });

        return response()->json($category);
    }
}
