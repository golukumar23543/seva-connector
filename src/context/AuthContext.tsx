import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole, AuthResponse, CompleteAddress } from '../types.ts';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  providerDetails?: {
    serviceCategory: string;
    services: string[];
    experienceYears: number;
    bio: string;
    serviceAreas: string[];
    pricingStartingAt: number;
    workingHours: string;
  };
}

export interface CustomerSignupData {
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  phone: string;
  altPhone?: string;
  address: CompleteAddress;
  password: string;
  confirmPassword: string;
  registrationCode: string;
}

export interface GoogleCustomerSignupData {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
  phone: string;
  altPhone?: string;
  address: CompleteAddress;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  registerCustomer: (data: CustomerSignupData) => Promise<{ message: string }>;
  verifyGoogle: (googlePayload: { googleId?: string; email: string; name: string; avatarUrl?: string }) => Promise<{ status: 'LOGGED_IN' | 'NEEDS_PROFILE_COMPLETION'; user?: User; googleUser?: any }>;
  registerGoogleCustomer: (data: GoogleCustomerSignupData) => Promise<{ message: string }>;
  demoLogin: (role: 'ADMIN' | 'CO_ADMIN' | 'PROVIDER_ELECTRICIAN' | 'PROVIDER_AC' | 'CUSTOMER') => Promise<void>;
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    phone?: string;
    altPhone?: string;
    dob?: string;
    address?: CompleteAddress;
  }) => Promise<{ user: User; message: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  authHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sevaconnect_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const authHeaders = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  // Load current user on boot
  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token expired or invalid
        localStorage.removeItem('sevaconnect_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to verify session:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to login');
    }

    localStorage.setItem('sevaconnect_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const adminLogin = async (password: string) => {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Incorrect password');
    }

    localStorage.setItem('sevaconnect_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (regData: RegisterData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    localStorage.setItem('sevaconnect_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const registerCustomer = async (custData: CustomerSignupData) => {
    const res = await fetch('/api/auth/register-customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(custData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    localStorage.setItem('sevaconnect_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return { message: data.message || 'Your customer account has been created successfully.' };
  };

  const verifyGoogle = async (googlePayload: { googleId?: string; email: string; name: string; avatarUrl?: string }) => {
    const res = await fetch('/api/auth/google/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googlePayload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Google verification failed');
    }

    if (data.status === 'LOGGED_IN' && data.token) {
      localStorage.setItem('sevaconnect_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const registerGoogleCustomer = async (custData: GoogleCustomerSignupData) => {
    const res = await fetch('/api/auth/google/register-customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(custData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Google registration failed');
    }

    localStorage.setItem('sevaconnect_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return { message: data.message || 'Your customer account has been created successfully.' };
  };

  const demoLogin = async (role: 'ADMIN' | 'CO_ADMIN' | 'PROVIDER_ELECTRICIAN' | 'PROVIDER_AC' | 'CUSTOMER') => {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demoRole: role }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Demo login failed');
    }

    localStorage.setItem('sevaconnect_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const updateProfile = async (updateData: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    phone?: string;
    altPhone?: string;
    dob?: string;
    address?: CompleteAddress;
  }) => {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(updateData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }

    if (data.user) {
      setUser(data.user);
    }
    return { user: data.user, message: data.message || 'Profile updated successfully.' };
  };

  const logout = () => {
    localStorage.removeItem('sevaconnect_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        adminLogin,
        register,
        registerCustomer,
        verifyGoogle,
        registerGoogleCustomer,
        demoLogin,
        updateProfile,
        logout,
        refreshUser,
        authHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
