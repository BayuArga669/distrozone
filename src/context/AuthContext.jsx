import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const userData = await authAPI.getUser();
                console.log('AuthContext: User fetched', userData);
                setUser(userData);
            } catch (error) {
                console.error('AuthContext: Fetch user failed', error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const data = await authAPI.login(email, password);
        console.log('AuthContext: Login successful', data);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            // Ignore error
        }
        localStorage.removeItem('token');
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const userData = await authAPI.getUser();
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Failed to refresh user:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
