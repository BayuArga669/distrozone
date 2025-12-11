<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ShippingController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
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

        // Admin Routes
        Route::prefix('admin')->group(function () {
            // Dashboard
            Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);

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

            // Upload
            Route::post('/upload', [\App\Http\Controllers\Api\Admin\UploadController::class, 'uploadImage']);
            Route::delete('/upload', [\App\Http\Controllers\Api\Admin\UploadController::class, 'deleteImage']);

            // Settings
            Route::get('/settings', [\App\Http\Controllers\Api\Admin\SettingsController::class, 'index']);
            Route::put('/settings', [\App\Http\Controllers\Api\Admin\SettingsController::class, 'update']);

            // Product Variants
            Route::get('/products/{productId}/variants', [\App\Http\Controllers\Api\Admin\VariantController::class, 'index']);
            Route::post('/products/{productId}/variants', [\App\Http\Controllers\Api\Admin\VariantController::class, 'store']);
            Route::put('/products/{productId}/variants/{variantId}', [\App\Http\Controllers\Api\Admin\VariantController::class, 'update']);
            Route::delete('/products/{productId}/variants/{variantId}', [\App\Http\Controllers\Api\Admin\VariantController::class, 'destroy']);
            Route::put('/products/{productId}/variants/bulk-stock', [\App\Http\Controllers\Api\Admin\VariantController::class, 'bulkUpdateStock']);
        });
    });
});
