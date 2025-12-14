<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\Review;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ReviewController extends Controller
{
    /**
     * Get all reviews with filters.
     */
    public function index(Request $request)
    {
        $query = Review::with(['product:id,name,slug,image', 'user:id,name,email,profile_photo_path']);

        // Filter by approval status
        if ($request->has('status')) {
            switch ($request->query('status')) {
                case 'pending':
                    $query->where('is_approved', false);
                    break;
                case 'approved':
                    $query->where('is_approved', true);
                    break;
            }
        }

        // Filter by rating
        if ($request->has('rating')) {
            $query->where('rating', $request->query('rating'));
        }

        // Search by product name or user name
        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('product', function ($pq) use ($search) {
                    $pq->where('name', 'like', "%{$search}%");
                })
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Sort
        $sort = $request->query('sort', 'recent');
        switch ($sort) {
            case 'oldest':
                $query->oldest();
                break;
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

        $reviews = $query->paginate($request->query('per_page', 15));

        return response()->json([
            'data' => $reviews->items(),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
            'stats' => [
                'total' => Review::count(),
                'pending' => Review::where('is_approved', false)->count(),
                'approved' => Review::where('is_approved', true)->count(),
            ],
        ]);
    }

    /**
     * Get a single review.
     */
    public function show($id)
    {
        $review = Review::with(['product:id,name,slug,image,price', 'user:id,name,email,profile_photo_path'])
            ->findOrFail($id);

        return response()->json(['data' => $review]);
    }

    /**
     * Approve a review.
     */
    public function approve($id)
    {
        $review = Review::findOrFail($id);
        $review->is_approved = true;
        $review->save();

        return response()->json([
            'message' => 'Review approved successfully',
            'data' => $review->load(['product:id,name,slug', 'user:id,name']),
        ]);
    }

    /**
     * Delete a review.
     */
    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully',
        ]);
    }
}
