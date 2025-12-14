<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Get reviews for a specific product.
     */
    public function index(Request $request, $slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $query = $product->approvedReviews()->with('user:id,name,profile_photo_path');

        // Sort options
        $sort = $request->query('sort', 'recent');
        switch ($sort) {
            case 'highest':
                $query->orderBy('rating', 'desc');
                break;
            case 'lowest':
                $query->orderBy('rating', 'asc');
                break;
            case 'recent':
            default:
                $query->latest();
                break;
        }

        // Filter by rating
        if ($request->has('rating')) {
            $query->where('rating', $request->query('rating'));
        }

        // Filter verified purchases only
        if ($request->query('verified') === 'true') {
            $query->where('verified_purchase', true);
        }

        $reviews = $query->paginate(10);

        return response()->json([
            'data' => $reviews->items(),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
            'summary' => [
                'average_rating' => $product->average_rating,
                'total_reviews' => $product->total_reviews,
                'rating_distribution' => $product->rating_distribution,
                'rating_percentages' => $product->rating_percentages,
            ],
        ]);
    }

    /**
     * Check if the authenticated user can review this product.
     */
    public function canReview($productId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['can_review' => false, 'reason' => 'Not authenticated'], 401);
        }

        // Check if user has already reviewed this product
        $existingReview = Review::where('product_id', $productId)
            ->where('user_id', $user->id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'can_review' => false,
                'reason' => 'You have already reviewed this product',
            ]);
        }

        // Check if user has purchased this product
        $hasPurchased = Order::where('user_id', $user->id)
            ->where('status', 'completed')
            ->whereHas('items', function ($query) use ($productId) {
                $query->where('product_id', $productId);
            })
            ->exists();

        if (!$hasPurchased) {
            return response()->json([
                'can_review' => false,
                'reason' => 'You must purchase this product before reviewing',
            ]);
        }

        return response()->json([
            'can_review' => true,
        ]);
    }

    /**
     * Store a new review.
     */
    public function store(Request $request, $slug)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $product = Product::where('slug', $slug)->firstOrFail();

        // Check if user has already reviewed this product
        $existingReview = Review::where('product_id', $product->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'You have already reviewed this product',
            ], 422);
        }

        // Validate request
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'required|string|max:255',
            'comment' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check if user has purchased this product
        $hasPurchased = Order::where('user_id', $user->id)
            ->where('status', 'completed')
            ->whereHas('items', function ($query) use ($product) {
                $query->where('product_id', $product->id);
            })
            ->exists();

        // Create review
        $review = Review::create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'rating' => $request->rating,
            'title' => $request->title,
            'comment' => $request->comment,
            'verified_purchase' => $hasPurchased,
            'is_approved' => true, // Auto-approve for now (change to false if admin approval needed)
        ]);

        return response()->json([
            'message' => 'Review submitted successfully!',
            'data' => $review->load('user:id,name,profile_photo_path'),
        ], 201);
    }
}
