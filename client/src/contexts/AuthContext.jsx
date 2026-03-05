import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api'; // Ensure this points to your src/api.js

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on load
    useEffect(() => {
        // FIXED: Use 'token' to match what api.js looks for
        const token = localStorage.getItem('token');
        if (token) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchProfile = async () => {
        try {
            // FIXED: Added '/api' prefix and standard endpoint
            const res = await api.get('/users/me');
            setUser(res.data);
        } catch (err) {
            console.error("Profile fetch failed:", err);
            // Don't auto-logout here to prevent loops, just clear user state
            setUser(null);
            // Optionally remove invalid token
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        // FIXED: Added '/api' prefix
        // Note: Using URLSearchParams for OAuth2PasswordRequestForm compatibility if needed
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const res = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // FIXED: Key is 'token'
        localStorage.setItem('token', res.data.access_token);
        
        // Fetch full user details immediately after login
        await fetchProfile();
        return res.data;
    };

    const register = async (userData) => {
        // FIXED: Added '/api' prefix
        const res = await api.post('/auth/register', userData);
        
        // If registration returns a token immediately (depends on backend logic)
        if (res.data.access_token) {
            localStorage.setItem('token', res.data.access_token);
            await fetchProfile();
        }
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        // Optional: Redirect to login or home
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);