<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DistroZone API Documentation</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .code-block {
            background: #1e293b;
            border-radius: 8px;
            padding: 16px;
            overflow-x: auto;
        }

        .code-block code {
            color: #e2e8f0;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
        }

        .method-get {
            background: #10b981;
        }

        .method-post {
            background: #3b82f6;
        }

        .method-put {
            background: #f59e0b;
        }

        .method-patch {
            background: #8b5cf6;
        }

        .method-delete {
            background: #ef4444;
        }
    </style>
</head>

<body class="bg-slate-50 min-h-screen">
    <!-- Header -->
    <header class="bg-slate-900 text-white py-8">
        <div class="max-w-6xl mx-auto px-4">
            <h1 class="text-3xl font-black"><span class="text-orange-500">Distro</span>Zone API</h1>
            <p class="text-slate-400 mt-2">REST API Documentation v1.0</p>
            <div class="mt-4 flex gap-4 text-sm">
                <span class="bg-slate-800 px-3 py-1 rounded-full">Base URL: <code
                        class="text-orange-400">{{ url('/api/v1') }}</code></span>
                <span class="bg-slate-800 px-3 py-1 rounded-full">Auth: Bearer Token</span>
            </div>
        </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-12">
        <!-- Authentication -->
        <section class="mb-12">
            <h2 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span
                    class="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm">🔐</span>
                Authentication
            </h2>

            <div class="space-y-4">
                <!-- Register -->
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4 border-b border-slate-100">
                        <span class="method-post text-white text-xs font-bold px-3 py-1 rounded">POST</span>
                        <code class="text-slate-700 font-mono">/register</code>
                        <span class="text-slate-500 text-sm ml-auto">Register new user</span>
                    </div>
                    <div class="p-4 bg-slate-50">
                        <p class="text-sm text-slate-600 mb-2">Request Body:</p>
                        <div class="code-block">
                            <code>{ "name": "John Doe", "email": "john@example.com", "password": "password123", "password_confirmation": "password123" }</code>
                        </div>
                    </div>
                </div>

                <!-- Login -->
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4 border-b border-slate-100">
                        <span class="method-post text-white text-xs font-bold px-3 py-1 rounded">POST</span>
                        <code class="text-slate-700 font-mono">/login</code>
                        <span class="text-slate-500 text-sm ml-auto">Login & get token</span>
                    </div>
                    <div class="p-4 bg-slate-50">
                        <p class="text-sm text-slate-600 mb-2">Request Body:</p>
                        <div class="code-block">
                            <code>{ "email": "john@example.com", "password": "password123" }</code>
                        </div>
                        <p class="text-sm text-slate-600 mt-4 mb-2">Response:</p>
                        <div class="code-block">
                            <code>{ "user": {...}, "token": "1|abc123..." }</code>
                        </div>
                    </div>
                </div>

                <!-- Logout -->
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4">
                        <span class="method-post text-white text-xs font-bold px-3 py-1 rounded">POST</span>
                        <code class="text-slate-700 font-mono">/logout</code>
                        <span class="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded">Auth Required</span>
                        <span class="text-slate-500 text-sm ml-auto">Revoke current token</span>
                    </div>
                </div>

                <!-- Get User -->
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4">
                        <span class="method-get text-white text-xs font-bold px-3 py-1 rounded">GET</span>
                        <code class="text-slate-700 font-mono">/user</code>
                        <span class="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded">Auth Required</span>
                        <span class="text-slate-500 text-sm ml-auto">Get current user</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Products -->
        <section class="mb-12">
            <h2 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span
                    class="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-sm">📦</span>
                Products
            </h2>

            <div class="space-y-4">
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4 border-b border-slate-100">
                        <span class="method-get text-white text-xs font-bold px-3 py-1 rounded">GET</span>
                        <code class="text-slate-700 font-mono">/products</code>
                        <span class="text-slate-500 text-sm ml-auto">List all products</span>
                    </div>
                    <div class="p-4 bg-slate-50">
                        <p class="text-sm text-slate-600 mb-2">Query Parameters:</p>
                        <div class="text-sm space-y-1">
                            <p><code class="bg-slate-200 px-1 rounded">category</code> - Filter by category slug</p>
                            <p><code class="bg-slate-200 px-1 rounded">search</code> - Search by name</p>
                            <p><code class="bg-slate-200 px-1 rounded">featured</code> - Filter featured only
                                (true/false)</p>
                            <p><code class="bg-slate-200 px-1 rounded">page</code> - Page number</p>
                            <p><code class="bg-slate-200 px-1 rounded">per_page</code> - Items per page (max 50)</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4">
                        <span class="method-get text-white text-xs font-bold px-3 py-1 rounded">GET</span>
                        <code class="text-slate-700 font-mono">/products/featured</code>
                        <span class="text-slate-500 text-sm ml-auto">Get featured products (max 8)</span>
                    </div>
                </div>

                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4">
                        <span class="method-get text-white text-xs font-bold px-3 py-1 rounded">GET</span>
                        <code class="text-slate-700 font-mono">/products/{slug}</code>
                        <span class="text-slate-500 text-sm ml-auto">Get single product by slug</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Categories -->
        <section class="mb-12">
            <h2 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span
                    class="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm">📁</span>
                Categories
            </h2>

            <div class="space-y-4">
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4">
                        <span class="method-get text-white text-xs font-bold px-3 py-1 rounded">GET</span>
                        <code class="text-slate-700 font-mono">/categories</code>
                        <span class="text-slate-500 text-sm ml-auto">List all categories with product count</span>
                    </div>
                </div>

                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4">
                        <span class="method-get text-white text-xs font-bold px-3 py-1 rounded">GET</span>
                        <code class="text-slate-700 font-mono">/categories/{slug}</code>
                        <span class="text-slate-500 text-sm ml-auto">Get single category</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Cart -->
        <section class="mb-12">
            <h2 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span
                    class="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm">🛒</span>
                Cart
                <span class="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded ml-2">Auth Required</span>
            </h2>

            <div class="space-y-4">
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4">
                        <span class="method-get text-white text-xs font-bold px-3 py-1 rounded">GET</span>
                        <code class="text-slate-700 font-mono">/cart</code>
                        <span class="text-slate-500 text-sm ml-auto">Get user's cart</span>
                    </div>
                </div>

                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4 border-b border-slate-100">
                        <span class="method-post text-white text-xs font-bold px-3 py-1 rounded">POST</span>
                        <code class="text-slate-700 font-mono">/cart</code>
                        <span class="text-slate-500 text-sm ml-auto">Add item to cart</span>
                    </div>
                    <div class="p-4 bg-slate-50">
                        <div class="code-block">
                            <code>{ "product_id": 1, "quantity": 2 }</code>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4 border-b border-slate-100">
                        <span class="method-put text-white text-xs font-bold px-3 py-1 rounded">PUT</span>
                        <code class="text-slate-700 font-mono">/cart/{id}</code>
                        <span class="text-slate-500 text-sm ml-auto">Update cart item quantity</span>
                    </div>
                    <div class="p-4 bg-slate-50">
                        <div class="code-block">
                            <code>{ "quantity": 3 }</code>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4">
                        <span class="method-delete text-white text-xs font-bold px-3 py-1 rounded">DELETE</span>
                        <code class="text-slate-700 font-mono">/cart/{id}</code>
                        <span class="text-slate-500 text-sm ml-auto">Remove item from cart</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Orders -->
        <section class="mb-12">
            <h2 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span
                    class="w-8 h-8 bg-pink-500 text-white rounded-lg flex items-center justify-center text-sm">📋</span>
                Orders
                <span class="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded ml-2">Auth Required</span>
            </h2>

            <div class="space-y-4">
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4">
                        <span class="method-get text-white text-xs font-bold px-3 py-1 rounded">GET</span>
                        <code class="text-slate-700 font-mono">/orders</code>
                        <span class="text-slate-500 text-sm ml-auto">Get user's order history</span>
                    </div>
                </div>

                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4">
                        <span class="method-get text-white text-xs font-bold px-3 py-1 rounded">GET</span>
                        <code class="text-slate-700 font-mono">/orders/{id}</code>
                        <span class="text-slate-500 text-sm ml-auto">Get single order details</span>
                    </div>
                </div>

                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4 border-b border-slate-100">
                        <span class="method-post text-white text-xs font-bold px-3 py-1 rounded">POST</span>
                        <code class="text-slate-700 font-mono">/orders</code>
                        <span class="text-slate-500 text-sm ml-auto">Create order from cart</span>
                    </div>
                    <div class="p-4 bg-slate-50">
                        <div class="code-block">
                            <code>{ "shipping_address": { "name": "John", "phone": "08123456789", "address": "Jl. Example", "city": "Jakarta", "postal_code": "12345" }, "notes": "Optional note" }</code>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Admin APIs -->
        <section class="mb-12">
            <h2 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span
                    class="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center text-sm">⚙️</span>
                Admin API
                <span class="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded ml-2">Admin Auth Required</span>
            </h2>

            <div class="grid md:grid-cols-2 gap-4">
                <!-- Dashboard -->
                <div class="bg-white rounded-xl border border-slate-200 p-4">
                    <h3 class="font-bold text-slate-900 mb-3">Dashboard</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center gap-2">
                            <span class="method-get text-white text-xs font-bold px-2 py-0.5 rounded">GET</span>
                            <code>/admin/dashboard/stats</code>
                        </div>
                    </div>
                </div>

                <!-- Products Admin -->
                <div class="bg-white rounded-xl border border-slate-200 p-4">
                    <h3 class="font-bold text-slate-900 mb-3">Products CRUD</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center gap-2">
                            <span class="method-get text-white text-xs font-bold px-2 py-0.5 rounded">GET</span>
                            <code>/admin/products</code>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="method-post text-white text-xs font-bold px-2 py-0.5 rounded">POST</span>
                            <code>/admin/products</code>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="method-put text-white text-xs font-bold px-2 py-0.5 rounded">PUT</span>
                            <code>/admin/products/{id}</code>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="method-delete text-white text-xs font-bold px-2 py-0.5 rounded">DEL</span>
                            <code>/admin/products/{id}</code>
                        </div>
                    </div>
                </div>

                <!-- Categories Admin -->
                <div class="bg-white rounded-xl border border-slate-200 p-4">
                    <h3 class="font-bold text-slate-900 mb-3">Categories CRUD</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center gap-2">
                            <span class="method-get text-white text-xs font-bold px-2 py-0.5 rounded">GET</span>
                            <code>/admin/categories</code>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="method-post text-white text-xs font-bold px-2 py-0.5 rounded">POST</span>
                            <code>/admin/categories</code>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="method-put text-white text-xs font-bold px-2 py-0.5 rounded">PUT</span>
                            <code>/admin/categories/{id}</code>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="method-delete text-white text-xs font-bold px-2 py-0.5 rounded">DEL</span>
                            <code>/admin/categories/{id}</code>
                        </div>
                    </div>
                </div>

                <!-- Orders Admin -->
                <div class="bg-white rounded-xl border border-slate-200 p-4">
                    <h3 class="font-bold text-slate-900 mb-3">Orders Management</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center gap-2">
                            <span class="method-get text-white text-xs font-bold px-2 py-0.5 rounded">GET</span>
                            <code>/admin/orders</code>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="method-get text-white text-xs font-bold px-2 py-0.5 rounded">GET</span>
                            <code>/admin/orders/{id}</code>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="method-patch text-white text-xs font-bold px-2 py-0.5 rounded">PATCH</span>
                            <code>/admin/orders/{id}/status</code>
                        </div>
                    </div>
                </div>

                <!-- Upload -->
                <div class="bg-white rounded-xl border border-slate-200 p-4">
                    <h3 class="font-bold text-slate-900 mb-3">File Upload</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center gap-2">
                            <span class="method-post text-white text-xs font-bold px-2 py-0.5 rounded">POST</span>
                            <code>/admin/upload</code>
                        </div>
                        <p class="text-slate-500 text-xs">Form-data: image (file), folder (products/categories)</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Payment -->
        <section class="mb-12">
            <h2 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span
                    class="w-8 h-8 bg-yellow-500 text-white rounded-lg flex items-center justify-center text-sm">💳</span>
                Payment (Midtrans)
            </h2>

            <div class="space-y-4">
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4">
                        <span class="method-post text-white text-xs font-bold px-3 py-1 rounded">POST</span>
                        <code class="text-slate-700 font-mono">/payments/notification</code>
                        <span class="text-slate-500 text-sm ml-auto">Midtrans webhook callback</span>
                    </div>
                </div>

                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="p-4 flex items-center gap-4">
                        <span class="method-get text-white text-xs font-bold px-3 py-1 rounded">GET</span>
                        <code class="text-slate-700 font-mono">/payments/client-key</code>
                        <span class="text-slate-500 text-sm ml-auto">Get Midtrans client key</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Response Codes -->
        <section class="mb-12">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Response Codes</h2>
            <div class="grid md:grid-cols-4 gap-4">
                <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <span class="text-3xl font-bold text-emerald-600">200</span>
                    <p class="text-emerald-700 text-sm mt-1">Success</p>
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <span class="text-3xl font-bold text-blue-600">201</span>
                    <p class="text-blue-700 text-sm mt-1">Created</p>
                </div>
                <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                    <span class="text-3xl font-bold text-yellow-600">401</span>
                    <p class="text-yellow-700 text-sm mt-1">Unauthorized</p>
                </div>
                <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <span class="text-3xl font-bold text-red-600">422</span>
                    <p class="text-red-700 text-sm mt-1">Validation Error</p>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-900 text-white py-8">
        <div class="max-w-6xl mx-auto px-4 text-center">
            <p class="text-slate-400">© 2025 DistroZone API. Built with Laravel.</p>
        </div>
    </footer>
</body>

</html>