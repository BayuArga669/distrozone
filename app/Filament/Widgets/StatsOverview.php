<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        $totalRevenue = Payment::where('status', 'success')->sum('amount');
        $pendingOrders = Order::where('status', 'pending')->count();
        $totalProducts = Product::where('is_active', true)->count();
        $totalCustomers = User::count();

        return [
            Stat::make('Total Pendapatan', 'Rp ' . number_format($totalRevenue, 0, ',', '.'))
                ->description('Total dari pembayaran sukses')
                ->descriptionIcon('heroicon-m-currency-dollar')
                ->color('success'),
            Stat::make('Order Pending', $pendingOrders)
                ->description('Menunggu pembayaran')
                ->descriptionIcon('heroicon-m-clock')
                ->color('warning'),
            Stat::make('Total Produk', $totalProducts)
                ->description('Produk aktif')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('info'),
            Stat::make('Total Pelanggan', $totalCustomers)
                ->description('Pengguna terdaftar')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),
        ];
    }
}
