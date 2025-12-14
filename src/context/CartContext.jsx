import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuth();

    // Fetch cart from API when user is authenticated
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            setItems([]);
            return;
        }

        setLoading(true);
        try {
            const response = await cartAPI.getCart();
            // Backend returns { cart: { items: [...] }, total: ... }
            const cartItems = response.cart?.items || response.items || response.data || [];
            console.log('Cart fetched:', cartItems);
            setItems(cartItems);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch cart:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Fetch cart when authentication state changes
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Add item to cart
    const addToCart = async (productId, quantity = 1, variantId = null) => {
        if (!isAuthenticated) {
            throw new Error('Please login to add items to cart');
        }

        setLoading(true);
        try {
            await cartAPI.addToCart(productId, quantity, variantId);
            await fetchCart(); // Refresh cart
            setError(null);
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update item quantity
    const updateQuantity = async (itemId, quantity) => {
        if (quantity < 1) return;

        setLoading(true);
        try {
            await cartAPI.updateCartItem(itemId, { quantity: parseInt(quantity) });
            await fetchCart(); // Refresh cart
            setError(null);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Remove item from cart
    const removeFromCart = async (itemId) => {
        setLoading(true);
        try {
            await cartAPI.removeFromCart(itemId);
            await fetchCart(); // Refresh cart
            setError(null);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Clear entire cart
    const clearCart = async () => {
        setLoading(true);
        try {
            await cartAPI.clearCart();
            setItems([]);
            setError(null);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals
    const itemCount = items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    const subtotal = items.reduce((sum, item) => {
        const price = parseFloat(item.product?.price) || parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 0;
        return sum + (price * qty);
    }, 0);

    const value = {
        items,
        loading,
        error,
        itemCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
        refreshCart: fetchCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
