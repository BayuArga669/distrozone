<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ShippingController;
use App\Http\Controllers\Api\CouponValidationController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// API Version 1
Route::prefix('v1')->group(function () {

    // Public routes
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);

    // Shipping routes (public)
    Route::post('/shipping/calculate', [ShippingController::class, 'calculate']);
    Route::get('/shipping/regions', [ShippingController::class, 'regions']);

    // Reviews (public - read only)
    Route::get('/products/{slug}/reviews', [App\Http\Controllers\Api\ReviewController::class, 'index']);

    // Auth routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Midtrans webhook (no auth required)
    Route::post('/payments/notification', [PaymentController::class, 'notification']);
    Route::get('/payments/notification', [PaymentController::class, 'notification']); // For test verification
    Route::get('/payments/client-key', [PaymentController::class, 'clientKey']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/profile/password', [AuthController::class, 'updatePassword']);
        Route::post('/profile/photo', [AuthController::class, 'uploadPhoto']);

        // Cart
        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart', [CartController::class, 'store']);
        Route::put('/cart/{id}', [CartController::class, 'update']);
        Route::delete('/cart/{id}', [CartController::class, 'destroy']);
        Route::delete('/cart', [CartController::class, 'clear']);

        // Orders
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/orders/{id}/invoice', [\App\Http\Controllers\Api\InvoiceController::class, 'download']);

        // Wishlist
        Route::get('/wishlist', [App\Http\Controllers\Api\WishlistController::class, 'index']);
        Route::post('/wishlist', [App\Http\Controllers\Api\WishlistController::class, 'store']);
        Route::post('/wishlist/toggle', [App\Http\Controllers\Api\WishlistController::class, 'toggle']);
        Route::get('/wishlist/check/{productId}', [App\Http\Controllers\Api\WishlistController::class, 'check']);
        Route::delete('/wishlist/{productId}', [App\Http\Controllers\Api\WishlistController::class, 'destroy']);

        // Chat
        Route::get('/chat', [App\Http\Controllers\Api\ChatController::class, 'getOrCreate']);
        Route::get('/chat/{id}', [App\Http\Controllers\Api\ChatController::class, 'show']);
        Route::post('/chat/{id}/messages', [App\Http\Controllers\Api\ChatController::class, 'sendMessage']);
        Route::get('/chat/unread/count', [App\Http\Controllers\Api\ChatController::class, 'unreadCount']);

        // Addresses
        Route::get('/addresses', [App\Http\Controllers\Api\AddressController::class, 'index']);
        Route::post('/addresses', [App\Http\Controllers\Api\AddressController::class, 'store']);
        Route::put('/addresses/{id}', [App\Http\Controllers\Api\AddressController::class, 'update']);
        Route::delete('/addresses/{id}', [App\Http\Controllers\Api\AddressController::class, 'destroy']);
        Route::put('/addresses/{id}/default', [App\Http\Controllers\Api\AddressController::class, 'setDefault']);

        // Coupon Validation
        Route::post('/coupons/validate', [CouponValidationController::class, 'validate']);

        // Reviews (authenticated users can submit)
        Route::get('/products/{productId}/can-review', [App\Http\Controllers\Api\ReviewController::class, 'canReview']);
        Route::post('/products/{slug}/reviews', [App\Http\Controllers\Api\ReviewController::class, 'store']);

        // Admin Routes
        Route::prefix('admin')->group(function () {
            // Dashboard
            Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);

            // Sales Reports
            Route::get('/reports/summary', [\App\Http\Controllers\Api\Admin\SalesReportController::class, 'summary']);
            Route::get('/reports/chart', [\App\Http\Controllers\Api\Admin\SalesReportController::class, 'chart']);
            Route::get('/reports/products', [\App\Http\Controllers\Api\Admin\SalesReportController::class, 'products']);
            Route::get('/reports/categories', [\App\Http\Controllers\Api\Admin\SalesReportController::class, 'categories']);
            Route::get('/reports/payment-methods', [\App\Http\Controllers\Api\Admin\SalesReportController::class, 'paymentMethods']);
            Route::get('/reports/order-status', [\App\Http\Controllers\Api\Admin\SalesReportController::class, 'orderStatus']);
            Route::get('/reports/export', [\App\Http\Controllers\Api\Admin\SalesReportController::class, 'export']);

            // Products CRUD
            Route::get('/products', [AdminProductController::class, 'index']);
            Route::post('/products', [AdminProductController::class, 'store']);
            Route::get('/products/{id}', [AdminProductController::class, 'show']);
            Route::put('/products/{id}', [AdminProductController::class, 'update']);
            Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);

            // Categories CRUD
            Route::get('/categories', [AdminCategoryController::class, 'index']);
            Route::post('/categories', [AdminCategoryController::class, 'store']);
            Route::get('/categories/{id}', [AdminCategoryController::class, 'show']);
            Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
            Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);

            // Orders
            Route::get('/orders', [AdminOrderController::class, 'index']);
            Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
            Route::patch('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
            Route::get('/orders/{id}/invoice', [\App\Http\Controllers\Api\InvoiceController::class, 'adminDownload']);

            // Chats
            Route::get('/chats', [App\Http\Controllers\Api\Admin\ChatController::class, 'index']);
            Route::get('/chats/{id}', [App\Http\Controllers\Api\Admin\ChatController::class, 'show']);
            Route::post('/chats/{id}/reply', [App\Http\Controllers\Api\Admin\ChatController::class, 'reply']);
            Route::patch('/chats/{id}/close', [App\Http\Controllers\Api\Admin\ChatController::class, 'close']);
            Route::get('/chats/unread/count', [App\Http\Controllers\Api\Admin\ChatController::class, 'unreadCount']);

            // Upload
            Route::post('/upload', [\App\Http\Controllers\Api\Admin\UploadController::class, 'uploadImage']);
            Route::delete('/upload', [\App\Http\Controllers\Api\Admin\UploadController::class, 'deleteImage']);

            // Settings
            Route::get('/settings', [\App\Http\Controllers\Api\Admin\SettingsController::class, 'index']);
            Route::put('/settings', [\App\Http\Controllers\Api\Admin\SettingsController::class, 'update']);

            // Coupons
            Route::apiResource('coupons', AdminCouponController::class);

            // Product Variants
            Route::get('/products/{productId}/variants', [\App\Http\Controllers\Api\Admin\VariantController::class, 'index']);
            Route::post('/products/{productId}/variants', [\App\Http\Controllers\Api\Admin\VariantController::class, 'store']);
            Route::put('/products/{productId}/variants/{variantId}', [\App\Http\Controllers\Api\Admin\VariantController::class, 'update']);
            Route::delete('/products/{productId}/variants/{variantId}', [\App\Http\Controllers\Api\Admin\VariantController::class, 'destroy']);
            Route::put('/products/{productId}/variants/bulk-stock', [\App\Http\Controllers\Api\Admin\VariantController::class, 'bulkUpdateStock']);

            // Blog Posts
            Route::get('/posts', [\App\Http\Controllers\Api\Admin\PostController::class, 'index']);
            Route::post('/posts', [\App\Http\Controllers\Api\Admin\PostController::class, 'store']);
            Route::get('/posts/{id}', [\App\Http\Controllers\Api\Admin\PostController::class, 'show']);
            Route::put('/posts/{id}', [\App\Http\Controllers\Api\Admin\PostController::class, 'update']);
            Route::delete('/posts/{id}', [\App\Http\Controllers\Api\Admin\PostController::class, 'destroy']);

            // Reviews
            Route::get('/reviews', [\App\Http\Controllers\Api\Admin\ReviewController::class, 'index']);
            Route::get('/reviews/{id}', [\App\Http\Controllers\Api\Admin\ReviewController::class, 'show']);
            Route::patch('/reviews/{id}/approve', [\App\Http\Controllers\Api\Admin\ReviewController::class, 'approve']);
            Route::delete('/reviews/{id}', [\App\Http\Controllers\Api\Admin\ReviewController::class, 'destroy']);
        });
    });

    // Public Blog Routes
    Route::get('/posts', [App\Http\Controllers\Api\PostController::class, 'index']);
    Route::get('/posts/{slug}', [App\Http\Controllers\Api\PostController::class, 'show']);
});
