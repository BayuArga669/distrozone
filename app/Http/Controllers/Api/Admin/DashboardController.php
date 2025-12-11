<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalRevenue = Payment::where('status', 'success')->sum('amount');
        $pendingOrders = Order::where('status', 'pending')->count();
        $totalProducts = Product::where('is_active', true)->count();
        $totalCustomers = User::count();
        $lowStockProducts = Product::where('stock', '<=', 10)->where('stock', '>', 0)->count();
        $outOfStockProducts = Product::where('stock', 0)->count();

        // Recent orders
        $recentOrders = Order::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'order_number', 'user_id', 'status', 'total', 'created_at']);

        // Monthly revenue (last 6 months)
        $monthlyRevenue = Payment::where('status', 'success')
            ->where('paid_at', '>=', now()->subMonths(6))
            ->select(
                DB::raw('YEAR(paid_at) as year'),
                DB::raw('MONTH(paid_at) as month'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        // Top selling products
        $topProducts = Product::withCount([
            'orderItems as total_sold' => function ($query) {
                $query->select(DB::raw('SUM(quantity)'));
            }
        ])
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'price', 'stock']);

        return response()->json([
            'stats' => [
                'total_revenue' => $totalRevenue,
                'pending_orders' => $pendingOrders,
                'total_products' => $totalProducts,
                'total_customers' => $totalCustomers,
                'low_stock_products' => $lowStockProducts,
                'out_of_stock_products' => $outOfStockProducts,
            ],
            'recent_orders' => $recentOrders,
            'monthly_revenue' => $monthlyRevenue,
            'top_products' => $topProducts,
        ]);
    }
}
