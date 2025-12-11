<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'items.product', 'payment']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by order number or user name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', '%' . $search . '%')
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('name', 'like', '%' . $search . '%');
                    });
            });
        }

        // Sort
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = min($request->get('per_page', 10), 100);
        $orders = $query->paginate($perPage);

        return response()->json($orders);
    }

    public function show(int $id): JsonResponse
    {
        $order = Order::with(['user', 'items.product', 'payment'])->findOrFail($id);
        return response()->json($order);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,paid,shipped,completed,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->status = $validated['status'];
        $order->save();

        return response()->json([
            'message' => 'Status order berhasil diperbarui',
            'order' => $order->load(['user', 'items.product', 'payment']),
        ]);
    }
}
