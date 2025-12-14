<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoiceNumber }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #1e293b;
            background: #fff;
        }

        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }

        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            border-bottom: 3px solid #f97316;
            padding-bottom: 20px;
        }

        .company-info {
            width: 50%;
        }

        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 8px;
        }

        .company-name span {
            color: #f97316;
        }

        .company-details {
            color: #64748b;
            font-size: 11px;
        }

        .invoice-info {
            width: 45%;
            text-align: right;
        }

        .invoice-title {
            font-size: 32px;
            font-weight: bold;
            color: #f97316;
            margin-bottom: 8px;
        }

        .invoice-meta {
            color: #64748b;
            font-size: 11px;
        }

        .invoice-meta strong {
            color: #1e293b;
        }

        /* Billing Section */
        .billing-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }

        .billing-box {
            width: 48%;
        }

        .billing-title {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
            margin-bottom: 8px;
            font-weight: bold;
        }

        .billing-name {
            font-size: 14px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 4px;
        }

        .billing-details {
            color: #64748b;
            font-size: 11px;
        }

        /* Items Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .items-table th {
            background: #f8fafc;
            padding: 12px 16px;
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            border-bottom: 2px solid #e2e8f0;
        }

        .items-table th:last-child,
        .items-table td:last-child {
            text-align: right;
        }

        .items-table td {
            padding: 16px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: top;
        }

        .item-name {
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 2px;
        }

        .item-variant {
            font-size: 10px;
            color: #94a3b8;
        }

        .item-qty {
            color: #64748b;
        }

        .item-price {
            font-weight: bold;
            color: #0f172a;
        }

        /* Summary */
        .summary-section {
            width: 300px;
            margin-left: auto;
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
        }

        .summary-label {
            color: #64748b;
        }

        .summary-value {
            font-weight: 600;
            color: #1e293b;
        }

        .summary-total {
            background: #0f172a;
            color: #fff;
            padding: 16px;
            margin-top: 8px;
            display: flex;
            justify-content: space-between;
            border-radius: 8px;
        }

        .summary-total .summary-label {
            color: #94a3b8;
            font-weight: bold;
        }

        .summary-total .summary-value {
            color: #f97316;
            font-size: 18px;
            font-weight: bold;
        }

        /* Footer */
        .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #94a3b8;
            font-size: 10px;
        }

        /* Payment Status Badge */
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-paid {
            background: #dcfce7;
            color: #15803d;
        }

        .status-unpaid {
            background: #fef3c7;
            color: #b45309;
        }

        .status-processing {
            background: #dbeafe;
            color: #1d4ed8;
        }
    </style>
</head>

<body>
    <div class="invoice-container">
        <!-- Header -->
        <table width="100%" style="margin-bottom: 40px; border-bottom: 3px solid #f97316; padding-bottom: 20px;">
            <tr>
                <td width="50%" style="vertical-align: top;">
                    <div class="company-name"><span>Distro</span>Zone</div>
                    <div class="company-details">
                        {{ $storeAddress }}<br>
                        Phone: {{ $storePhone }}<br>
                        Email: {{ $storeEmail }}
                    </div>
                </td>
                <td width="50%" style="text-align: right; vertical-align: top;">
                    <div class="invoice-title">INVOICE</div>
                    <div class="invoice-meta">
                        <strong>{{ $invoiceNumber }}</strong><br>
                        Date: {{ $invoiceDate }}<br>
                        Order: #{{ $order->order_number }}
                    </div>
                </td>
            </tr>
        </table>

        <!-- Billing Section -->
        <table width="100%" style="margin-bottom: 30px;">
            <tr>
                <td width="48%" style="vertical-align: top;">
                    <div class="billing-title">Bill To</div>
                    <div class="billing-name">{{ $order->user->name ?? 'Customer' }}</div>
                    <div class="billing-details">
                        {{ $order->user->email ?? '' }}
                    </div>
                </td>
                <td width="4%"></td>
                <td width="48%" style="vertical-align: top;">
                    <div class="billing-title">Ship To</div>
                    <div class="billing-name">{{ $order->shipping_address['name'] ?? '' }}</div>
                    <div class="billing-details">
                        {{ $order->shipping_address['address'] ?? '' }}<br>
                        {{ $order->shipping_address['city'] ?? '' }},
                        {{ $order->shipping_address['postal_code'] ?? '' }}<br>
                        Phone: {{ $order->shipping_address['phone'] ?? '' }}
                    </div>
                </td>
            </tr>
        </table>

        <!-- Payment Status -->
        <table width="100%" style="margin-bottom: 20px;">
            <tr>
                <td>
                    <span
                        class="status-badge status-{{ $order->status === 'paid' || $order->status === 'completed' || $order->status === 'shipped' || $order->status === 'processing' ? 'paid' : 'unpaid' }}">
                        {{ ucfirst($order->status) }}
                    </span>
                    @if($order->payment_method)
                        <span style="margin-left: 10px; color: #64748b; font-size: 11px;">
                            Payment: {{ strtoupper(str_replace('_', ' ', $order->payment_method)) }}
                        </span>
                    @endif
                </td>
            </tr>
        </table>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 50%;">Item</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                    <tr>
                        <td>
                            <div class="item-name">{{ $item->product->name ?? 'Product' }}</div>
                            @if($item->variant)
                                <div class="item-variant">
                                    @if($item->variant->color) Color: {{ $item->variant->color }} @endif
                                    @if($item->variant->size) | Size: {{ $item->variant->size }} @endif
                                </div>
                            @endif
                        </td>
                        <td>Rp {{ number_format($item->price, 0, ',', '.') }}</td>
                        <td class="item-qty">{{ $item->quantity }}</td>
                        <td class="item-price">Rp {{ number_format($item->price * $item->quantity, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Summary -->
        <table width="300" style="margin-left: auto;">
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span class="summary-label">Subtotal</span>
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                    <span class="summary-value">Rp {{ number_format($order->subtotal, 0, ',', '.') }}</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                    <span class="summary-label">Shipping</span>
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                    <span class="summary-value">Rp {{ number_format($order->shipping_cost, 0, ',', '.') }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="padding-top: 8px;">
                    <table width="100%" style="background: #0f172a; border-radius: 8px;">
                        <tr>
                            <td style="padding: 16px; color: #94a3b8; font-weight: bold;">Total</td>
                            <td
                                style="padding: 16px; text-align: right; color: #f97316; font-size: 18px; font-weight: bold;">
                                Rp {{ number_format($order->total, 0, ',', '.') }}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Footer -->
        <div class="footer">
            <p>Thank you for shopping at {{ $storeName }}!</p>
            <p style="margin-top: 8px;">This is a computer-generated invoice. No signature required.</p>
        </div>
    </div>
</body>

</html>