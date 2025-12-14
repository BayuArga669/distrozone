<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SalesReportController extends Controller
{
    /**
     * Get sales summary statistics with profit
     */
    public function summary(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date')
            ? Carbon::parse($request->start_date)->startOfDay()
            : Carbon::now()->startOfMonth();
        $endDate = $request->get('end_date')
            ? Carbon::parse($request->end_date)->endOfDay()
            : Carbon::now()->endOfDay();

        // Current period stats
        $currentOrders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('status', ['paid', 'processing', 'shipped', 'completed']);

        $totalRevenue = (clone $currentOrders)->sum('total');
        $totalOrders = (clone $currentOrders)->count();
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;
        $totalDiscount = (clone $currentOrders)->sum('discount_amount');
        $totalShipping = (clone $currentOrders)->sum('shipping_cost');

        // Calculate profit (revenue - cost)
        $orderIds = (clone $currentOrders)->pluck('id');
        $totalCost = OrderItem::whereIn('order_id', $orderIds)
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->selectRaw('SUM(order_items.quantity * COALESCE(products.cost_price, 0)) as cost')
            ->value('cost') ?? 0;

        $grossProfit = $totalRevenue - $totalShipping - $totalCost;
        $profitMargin = $totalRevenue > 0 ? round(($grossProfit / $totalRevenue) * 100, 1) : 0;

        // Items sold
        $totalItemsSold = OrderItem::whereIn('order_id', $orderIds)->sum('quantity');

        // Previous period for comparison
        $periodDays = $startDate->diffInDays($endDate) + 1;
        $prevStartDate = (clone $startDate)->subDays($periodDays);
        $prevEndDate = (clone $startDate)->subDay()->endOfDay();

        $prevOrders = Order::whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->whereIn('status', ['paid', 'processing', 'shipped', 'completed']);

        $prevRevenue = $prevOrders->sum('total');
        $prevOrderCount = $prevOrders->count();

        // Calculate percentage changes
        $revenueChange = $prevRevenue > 0
            ? round((($totalRevenue - $prevRevenue) / $prevRevenue) * 100, 1)
            : ($totalRevenue > 0 ? 100 : 0);
        $ordersChange = $prevOrderCount > 0
            ? round((($totalOrders - $prevOrderCount) / $prevOrderCount) * 100, 1)
            : ($totalOrders > 0 ? 100 : 0);

        return response()->json([
            'total_revenue' => round($totalRevenue, 0),
            'total_orders' => $totalOrders,
            'avg_order_value' => round($avgOrderValue, 0),
            'total_discount' => round($totalDiscount, 0),
            'total_shipping' => round($totalShipping, 0),
            'total_cost' => round($totalCost, 0),
            'gross_profit' => round($grossProfit, 0),
            'profit_margin' => $profitMargin,
            'total_items_sold' => $totalItemsSold,
            'revenue_change' => $revenueChange,
            'orders_change' => $ordersChange,
            'period' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
            ],
        ]);
    }

    /**
     * Get payment method breakdown
     */
    public function paymentMethods(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date')
            ? Carbon::parse($request->start_date)->startOfDay()
            : Carbon::now()->startOfMonth();
        $endDate = $request->get('end_date')
            ? Carbon::parse($request->end_date)->endOfDay()
            : Carbon::now()->endOfDay();

        $paymentData = Order::whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('status', ['paid', 'processing', 'shipped', 'completed'])
            ->selectRaw('payment_method, COUNT(*) as count, SUM(total) as total')
            ->groupBy('payment_method')
            ->orderByDesc('total')
            ->get();

        $totalAmount = $paymentData->sum('total');

        $result = $paymentData->map(function ($item) use ($totalAmount) {
            return [
                'method' => $item->payment_method ?? 'Unknown',
                'count' => $item->count,
                'total' => round($item->total, 0),
                'percentage' => $totalAmount > 0 ? round(($item->total / $totalAmount) * 100, 1) : 0,
            ];
        });

        return response()->json($result);
    }

    /**
     * Get order status breakdown
     */
    public function orderStatus(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date')
            ? Carbon::parse($request->start_date)->startOfDay()
            : Carbon::now()->startOfMonth();
        $endDate = $request->get('end_date')
            ? Carbon::parse($request->end_date)->endOfDay()
            : Carbon::now()->endOfDay();

        $statusData = Order::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('status, COUNT(*) as count, SUM(total) as total')
            ->groupBy('status')
            ->get();

        $total = $statusData->sum('count');

        $result = $statusData->map(function ($item) use ($total) {
            return [
                'status' => $item->status,
                'count' => $item->count,
                'total' => round($item->total, 0),
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 1) : 0,
            ];
        });

        return response()->json($result);
    }

    /**
     * Get chart data for sales trends with profit
     */
    public function chart(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date')
            ? Carbon::parse($request->start_date)->startOfDay()
            : Carbon::now()->startOfMonth();
        $endDate = $request->get('end_date')
            ? Carbon::parse($request->end_date)->endOfDay()
            : Carbon::now()->endOfDay();

        $days = $startDate->diffInDays($endDate) + 1;
        $groupBy = $days <= 31 ? 'day' : 'week';

        if ($groupBy === 'day') {
            $salesData = Order::whereBetween('created_at', [$startDate, $endDate])
                ->whereIn('status', ['paid', 'processing', 'shipped', 'completed'])
                ->selectRaw('DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders, SUM(shipping_cost) as shipping')
                ->groupByRaw('DATE(created_at)')
                ->orderBy('date')
                ->get()
                ->keyBy('date');

            // Get cost per day
            $costData = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->whereBetween('orders.created_at', [$startDate, $endDate])
                ->whereIn('orders.status', ['paid', 'processing', 'shipped', 'completed'])
                ->selectRaw('DATE(orders.created_at) as date, SUM(order_items.quantity * COALESCE(products.cost_price, 0)) as cost')
                ->groupByRaw('DATE(orders.created_at)')
                ->get()
                ->keyBy('date');

            $filledData = [];
            $currentDate = clone $startDate;
            while ($currentDate <= $endDate) {
                $dateStr = $currentDate->toDateString();
                $sale = $salesData->get($dateStr);
                $cost = $costData->get($dateStr);
                $revenue = $sale ? round($sale->revenue, 0) : 0;
                $shipping = $sale ? round($sale->shipping, 0) : 0;
                $costAmount = $cost ? round($cost->cost, 0) : 0;
                $profit = $revenue - $shipping - $costAmount;

                $filledData[] = [
                    'date' => $dateStr,
                    'label' => $currentDate->format('d M'),
                    'revenue' => $revenue,
                    'profit' => $profit,
                    'orders' => $sale ? $sale->orders : 0,
                ];
                $currentDate->addDay();
            }
        } else {
            $salesData = Order::whereBetween('created_at', [$startDate, $endDate])
                ->whereIn('status', ['paid', 'processing', 'shipped', 'completed'])
                ->selectRaw('YEARWEEK(created_at) as week, MIN(DATE(created_at)) as date, SUM(total) as revenue, COUNT(*) as orders')
                ->groupByRaw('YEARWEEK(created_at)')
                ->orderBy('week')
                ->get();

            $filledData = $salesData->map(function ($item) {
                return [
                    'date' => $item->date,
                    'label' => Carbon::parse($item->date)->format('d M'),
                    'revenue' => round($item->revenue, 0),
                    'profit' => 0,
                    'orders' => $item->orders,
                ];
            })->toArray();
        }

        return response()->json([
            'data' => $filledData,
            'group_by' => $groupBy,
        ]);
    }

    /**
     * Get top selling products with profit
     */
    public function products(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date')
            ? Carbon::parse($request->start_date)->startOfDay()
            : Carbon::now()->startOfMonth();
        $endDate = $request->get('end_date')
            ? Carbon::parse($request->end_date)->endOfDay()
            : Carbon::now()->endOfDay();
        $limit = $request->get('limit', 10);

        $topProducts = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereIn('orders.status', ['paid', 'processing', 'shipped', 'completed'])
            ->selectRaw('products.id, products.name, products.image, products.price, products.cost_price,
                SUM(order_items.quantity) as total_quantity, 
                SUM(order_items.quantity * order_items.price) as total_revenue,
                SUM(order_items.quantity * COALESCE(products.cost_price, 0)) as total_cost')
            ->groupBy('products.id', 'products.name', 'products.image', 'products.price', 'products.cost_price')
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                $profit = $item->total_revenue - $item->total_cost;
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'image' => $item->image,
                    'price' => $item->price,
                    'cost_price' => $item->cost_price,
                    'total_quantity' => $item->total_quantity,
                    'total_revenue' => round($item->total_revenue, 0),
                    'total_cost' => round($item->total_cost, 0),
                    'profit' => round($profit, 0),
                    'margin' => $item->total_revenue > 0 ? round(($profit / $item->total_revenue) * 100, 1) : 0,
                ];
            });

        return response()->json($topProducts);
    }

    /**
     * Get sales by category
     */
    public function categories(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date')
            ? Carbon::parse($request->start_date)->startOfDay()
            : Carbon::now()->startOfMonth();
        $endDate = $request->get('end_date')
            ? Carbon::parse($request->end_date)->endOfDay()
            : Carbon::now()->endOfDay();

        $categorySales = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereIn('orders.status', ['paid', 'processing', 'shipped', 'completed'])
            ->selectRaw('categories.id, categories.name, 
                SUM(order_items.quantity) as total_quantity, 
                SUM(order_items.quantity * order_items.price) as total_revenue,
                SUM(order_items.quantity * COALESCE(products.cost_price, 0)) as total_cost')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_revenue')
            ->get();

        $totalRevenue = $categorySales->sum('total_revenue');

        $categorySales = $categorySales->map(function ($item) use ($totalRevenue) {
            $profit = $item->total_revenue - $item->total_cost;
            return [
                'id' => $item->id,
                'name' => $item->name,
                'total_quantity' => $item->total_quantity,
                'total_revenue' => round($item->total_revenue, 0),
                'total_cost' => round($item->total_cost, 0),
                'profit' => round($profit, 0),
                'margin' => $item->total_revenue > 0 ? round(($profit / $item->total_revenue) * 100, 1) : 0,
                'percentage' => $totalRevenue > 0 ? round(($item->total_revenue / $totalRevenue) * 100, 1) : 0,
            ];
        });

        return response()->json($categorySales);
    }

    /**
     * Export orders to CSV with more details
     */
    public function export(Request $request)
    {
        $startDate = $request->get('start_date')
            ? Carbon::parse($request->start_date)->startOfDay()
            : Carbon::now()->startOfMonth();
        $endDate = $request->get('end_date')
            ? Carbon::parse($request->end_date)->endOfDay()
            : Carbon::now()->endOfDay();

        $orders = Order::with(['items.product', 'user'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = 'sales_report_' . $startDate->format('Y-m-d') . '_to_' . $endDate->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');

            // CSV Header
            fputcsv($file, [
                'Order Number',
                'Date',
                'Customer',
                'Email',
                'Status',
                'Products',
                'Quantity',
                'Subtotal',
                'Cost',
                'Profit',
                'Shipping',
                'Discount',
                'Total',
                'Payment Method',
            ]);

            foreach ($orders as $order) {
                $products = $order->items->map(fn($item) => $item->product->name . ' x' . $item->quantity)->join(', ');
                $totalQty = $order->items->sum('quantity');
                $totalCost = $order->items->sum(fn($item) => $item->quantity * ($item->product->cost_price ?? 0));
                $subtotal = $order->subtotal ?? $order->total - $order->shipping_cost + ($order->discount_amount ?? 0);
                $profit = $subtotal - $totalCost;

                fputcsv($file, [
                    $order->order_number,
                    $order->created_at->format('Y-m-d H:i'),
                    $order->user->name ?? 'Guest',
                    $order->user->email ?? '-',
                    ucfirst($order->status),
                    $products,
                    $totalQty,
                    $subtotal,
                    $totalCost,
                    $profit,
                    $order->shipping_cost,
                    $order->discount_amount ?? 0,
                    $order->total,
                    $order->payment_method,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
