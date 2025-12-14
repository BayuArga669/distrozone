<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use App\Models\Setting;

class InvoiceController extends Controller
{
    /**
     * Download invoice for user's own order
     */
    public function download(Request $request, $orderId)
    {
        $order = Order::with(['items.product', 'items.variant', 'user', 'payment'])
            ->where('user_id', $request->user()->id)
            ->where('id', $orderId)
            ->firstOrFail();

        return $this->generateInvoice($order);
    }

    /**
     * Download invoice for admin (any order)
     */
    public function adminDownload(Request $request, $orderId)
    {
        // Check if user is admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $order = Order::with(['items.product', 'items.variant', 'user', 'payment'])
            ->where('id', $orderId)
            ->firstOrFail();

        return $this->generateInvoice($order);
    }

    /**
     * Generate PDF invoice
     */
    private function generateInvoice(Order $order)
    {
        // Get store settings
        $storeName = Setting::get('store_name', 'DistroZone');
        $storeAddress = Setting::get('store_address', 'Jl. Fashion Street No. 123, Jakarta 12345');
        $storePhone = Setting::get('store_phone', '+62 21 1234 5678');
        $storeEmail = Setting::get('store_email', 'info@distrozone.com');

        $data = [
            'order' => $order,
            'storeName' => $storeName,
            'storeAddress' => $storeAddress,
            'storePhone' => $storePhone,
            'storeEmail' => $storeEmail,
            'invoiceNumber' => 'INV-' . $order->order_number,
            'invoiceDate' => $order->created_at->format('d M Y'),
        ];

        $pdf = Pdf::loadView('invoices.invoice', $data);
        $pdf->setPaper('a4', 'portrait');

        $filename = 'invoice-' . $order->order_number . '.pdf';

        return $pdf->download($filename);
    }
}
