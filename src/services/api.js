// Use environment variable or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Helper to get full image URL
export const getImageUrl = (path) => {
    if (!path) return null;
    // Already has full URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    // Relative path - prepend backend URL
    return `${BACKEND_URL}${path}`;
};

// Helper function to get auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan');
    }

    return data;
};

// ==================== AUTH ====================
export const authAPI = {
    login: (email, password) =>
        apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (name, email, password, password_confirmation) =>
        apiRequest('/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, password_confirmation }),
        }),

    logout: () => apiRequest('/logout', { method: 'POST' }),

    getUser: () => apiRequest('/user'),

    updateProfile: (data) =>
        apiRequest('/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    updatePassword: (current_password, password, password_confirmation) =>
        apiRequest('/profile/password', {
            method: 'PUT',
            body: JSON.stringify({ current_password, password, password_confirmation }),
        }),

    uploadPhoto: async (file) => {
        const token = getToken();
        const formData = new FormData();
        formData.append('photo', file);

        const response = await fetch(`${API_URL}/profile/photo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }
        return data;
    },
};

// ==================== PUBLIC ====================
export const publicAPI = {
    getProducts: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/products${query ? `?${query}` : ''}`);
    },

    getFeaturedProducts: () => apiRequest('/products/featured'),

    getProduct: (slug) => apiRequest(`/products/${slug}`),

    getCategories: () => apiRequest('/categories'),

    getCategory: (slug) => apiRequest(`/categories/${slug}`),

    // Blog Posts
    getPosts: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/posts${query ? `?${query}` : ''}`);
    },

    getPost: (slug) => apiRequest(`/posts/${slug}`),

    // Reviews
    getProductReviews: (slug, params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/products/${slug}/reviews${query ? `?${query}` : ''}`);
    },
};

// ==================== CART ====================
export const cartAPI = {
    getCart: () => apiRequest('/cart'),

    addToCart: (product_id, quantity, variant_id = null) =>
        apiRequest('/cart', {
            method: 'POST',
            body: JSON.stringify({ product_id, quantity, variant_id }),
        }),

    updateCartItem: (id, data) =>
        apiRequest(`/cart/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    removeFromCart: (id) =>
        apiRequest(`/cart/${id}`, { method: 'DELETE' }),

    clearCart: () => apiRequest('/cart', { method: 'DELETE' }),
};

// ==================== SHIPPING ====================
export const shippingAPI = {
    calculate: (city, province, itemCount) =>
        apiRequest('/shipping/calculate', {
            method: 'POST',
            body: JSON.stringify({ city, province, item_count: itemCount }),
        }),

    getRegions: () => apiRequest('/shipping/regions'),
};

// ==================== ORDERS ====================
export const orderAPI = {
    getOrders: () => apiRequest('/orders'),

    getOrder: (id) => apiRequest(`/orders/${id}`),

    createOrder: (data) =>
        apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    downloadInvoice: async (orderId) => {
        const token = getToken();
        const response = await fetch(`${API_URL}/orders/${orderId}/invoice`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to download invoice');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    },
};

// ==================== WISHLIST ====================
export const wishlistAPI = {
    getWishlist: () => apiRequest('/wishlist'),

    addToWishlist: (productId) =>
        apiRequest('/wishlist', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId }),
        }),

    toggleWishlist: (productId) =>
        apiRequest('/wishlist/toggle', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId }),
        }),

    checkWishlist: (productId) => apiRequest(`/wishlist/check/${productId}`),

    removeFromWishlist: (productId) =>
        apiRequest(`/wishlist/${productId}`, {
            method: 'DELETE',
        }),
};

// ==================== REVIEWS ====================
export const reviewAPI = {
    canReview: (productId) => apiRequest(`/products/${productId}/can-review`),

    submitReview: (slug, data) =>
        apiRequest(`/products/${slug}/reviews`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// ==================== ADDRESSES ====================
export const addressAPI = {
    getAddresses: () => apiRequest('/addresses'),

    createAddress: (data) =>
        apiRequest('/addresses', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateAddress: (id, data) =>
        apiRequest(`/addresses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteAddress: (id) =>
        apiRequest(`/addresses/${id}`, { method: 'DELETE' }),

    setDefaultAddress: (id) =>
        apiRequest(`/addresses/${id}/default`, { method: 'PUT' }),
};

// ==================== COUPONS ====================
export const couponAPI = {
    validateCoupon: (code, orderAmount) =>
        apiRequest('/coupons/validate', {
            method: 'POST',
            body: JSON.stringify({ code, order_amount: orderAmount }),
        }),
};

// ==================== ADMIN ====================
export const adminAPI = {
    // Dashboard
    getDashboardStats: () => apiRequest('/admin/dashboard/stats'),

    // Products
    getProducts: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/products${query ? `?${query}` : ''}`);
    },

    getProduct: (id) => apiRequest(`/admin/products/${id}`),

    createProduct: (data) =>
        apiRequest('/admin/products', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateProduct: (id, data) =>
        apiRequest(`/admin/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteProduct: (id) =>
        apiRequest(`/admin/products/${id}`, { method: 'DELETE' }),

    // Categories
    getCategories: () => apiRequest('/admin/categories'),

    getCategory: (id) => apiRequest(`/admin/categories/${id}`),

    createCategory: (data) =>
        apiRequest('/admin/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateCategory: (id, data) =>
        apiRequest(`/admin/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteCategory: (id) =>
        apiRequest(`/admin/categories/${id}`, { method: 'DELETE' }),

    // Orders
    getOrders: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/orders${query ? `?${query}` : ''}`);
    },

    getOrder: (id) => apiRequest(`/admin/orders/${id}`),

    updateOrderStatus: (id, status) =>
        apiRequest(`/admin/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),

    // Chats
    getChats: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/chats${query ? `?${query}` : ''}`);
    },

    getChatDetail: (id) => apiRequest(`/admin/chats/${id}`),

    replyChat: (id, message) =>
        apiRequest(`/admin/chats/${id}/reply`, {
            method: 'POST',
            body: JSON.stringify({ message }),
        }),

    closeChat: (id) =>
        apiRequest(`/admin/chats/${id}/close`, {
            method: 'PATCH',
        }),

    // Upload
    uploadImage: async (file, folder = 'products') => {
        const token = getToken();
        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', folder);

        const response = await fetch(`${API_URL}/admin/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }
        return data;
    },

    // Settings
    getSettings: (group = 'midtrans') =>
        apiRequest(`/admin/settings?group=${group}`),

    updateSettings: (settings) =>
        apiRequest('/admin/settings', {
            method: 'PUT',
            body: JSON.stringify({ settings }),
        }),

    // Variants
    getVariants: (productId) =>
        apiRequest(`/admin/products/${productId}/variants`),

    createVariant: (productId, data) =>
        apiRequest(`/admin/products/${productId}/variants`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateVariant: (productId, variantId, data) =>
        apiRequest(`/admin/products/${productId}/variants/${variantId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteVariant: (productId, variantId) =>
        apiRequest(`/admin/products/${productId}/variants/${variantId}`, {
            method: 'DELETE',
        }),

    bulkUpdateStock: (productId, variants) =>
        apiRequest(`/admin/products/${productId}/variants/bulk-stock`, {
            method: 'PUT',
            body: JSON.stringify({ variants }),
        }),

    // Blog Posts
    getPosts: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/posts${query ? `?${query}` : ''}`);
    },

    getPost: (id) => apiRequest(`/admin/posts/${id}`),

    createPost: (data) =>
        apiRequest('/admin/posts', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updatePost: (id, data) =>
        apiRequest(`/admin/posts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deletePost: (id) =>
        apiRequest(`/admin/posts/${id}`, { method: 'DELETE' }),

    // Reviews
    getReviews: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/reviews${query ? `?${query}` : ''}`);
    },

    getReview: (id) => apiRequest(`/admin/reviews/${id}`),

    approveReview: (id) =>
        apiRequest(`/admin/reviews/${id}/approve`, {
            method: 'PATCH',
        }),

    deleteReview: (id) =>
        apiRequest(`/admin/reviews/${id}`, { method: 'DELETE' }),

    // Coupons
    getCoupons: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/coupons${query ? `?${query}` : ''}`);
    },

    createCoupon: (data) =>
        apiRequest('/admin/coupons', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateCoupon: (id, data) =>
        apiRequest(`/admin/coupons/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteCoupon: (id) =>
        apiRequest(`/admin/coupons/${id}`, { method: 'DELETE' }),

    downloadInvoice: async (orderId) => {
        const token = getToken();
        const response = await fetch(`${API_URL}/admin/orders/${orderId}/invoice`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to download invoice');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    },
};

export default {
    auth: authAPI,
    public: publicAPI,
    cart: cartAPI,
    order: orderAPI,
    admin: adminAPI,
    review: reviewAPI,
};
