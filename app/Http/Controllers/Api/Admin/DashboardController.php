<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalRevenue = Payment::where('status', 'success')->sum('amount');
        $pendingOrders = Order::whereIn('status', ['pending', 'unpaid', 'processing'])->count();
        $totalProducts = Product::where('is_active', true)->count();
        $totalCustomers = User::where('role', 'customer')->count();
        $lowStockProducts = Product::where('stock', '<=', 10)->where('stock', '>', 0)->count();
        $outOfStockProducts = Product::where('stock', 0)->count();

        // Recent orders
        $recentOrders = Order::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'order_number', 'user_id', 'status', 'total', 'created_at']);

        // Daily revenue (last 7 days)
        $dailyRevenue = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dayName = $date->format('D');

            $revenue = Order::whereIn('status', ['paid', 'processing', 'shipped', 'completed'])
                ->whereDate('created_at', $date->toDateString())
                ->sum('total');

            $orders = Order::whereDate('created_at', $date->toDateString())->count();

            $dailyRevenue[] = [
                'name' => $dayName,
                'revenue' => (int) $revenue,
                'orders' => $orders,
            ];
        }

        // Order status distribution
        $orderStatusCounts = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        $statusColors = [
            'completed' => '#10b981',
            'processing' => '#3b82f6',
            'pending' => '#f59e0b',
            'unpaid' => '#f59e0b',
            'paid' => '#10b981',
            'shipped' => '#a855f7',
            'cancelled' => '#ef4444',
            'expired' => '#6b7280',
        ];

        $orderStatusData = [];
        foreach ($orderStatusCounts as $status => $count) {
            $orderStatusData[] = [
                'name' => ucfirst($status),
                'value' => $count,
                'color' => $statusColors[$status] ?? '#64748b',
            ];
        }

        // Top selling products
        $topProducts = Product::withCount([
            'orderItems as total_sold' => function ($query) {
                $query->select(DB::raw('COALESCE(SUM(quantity), 0)'));
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
            'daily_revenue' => $dailyRevenue,
            'order_status_data' => $orderStatusData,
            'top_products' => $topProducts,
        ]);
    }
}

