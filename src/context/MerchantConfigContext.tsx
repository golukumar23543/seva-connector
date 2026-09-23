import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.tsx';
import { useToast } from './ToastContext.tsx';

export const DEFAULT_MERCHANT_PHOTO =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
export const DEFAULT_MERCHANT_NAME = 'Ravi Kumar';
export const DEFAULT_MERCHANT_UPI = 'ravikanhauli91@ptyes';

export interface MerchantConfig {
  merchantPhotoUrl: string | null;
  merchantPayeeName: string;
  merchantUpiId: string;
  merchantVerified: boolean;
}

interface MerchantConfigContextValue extends MerchantConfig {
  isLoading: boolean;
  updateMerchantConfig: (updates: {
    merchantPhotoUrl?: string | null;
    merchantPayeeName?: string;
    merchantUpiId?: string;
    merchantVerified?: boolean;
  }) => Promise<void>;
  removeMerchantPhoto: () => Promise<void>;
  resetToDefaultPhoto: () => Promise<void>;
  refreshMerchantConfig: () => Promise<void>;
}

const MerchantConfigContext = createContext<MerchantConfigContextValue | null>(null);

const STORAGE_KEYS = {
  PHOTO: 'sevaconnect_merchant_photo',
  NAME: 'sevaconnect_merchant_name',
  UPI: 'sevaconnect_merchant_upi',
  VERIFIED: 'sevaconnect_merchant_verified',
};

export const MerchantConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authHeaders, user } = useAuth();
  const { showToast } = useToast();

  // Initialize from localStorage with fallbacks
  const [merchantPhotoUrl, setMerchantPhotoUrl] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PHOTO);
      if (stored === '__REMOVED__') return null;
      if (stored && stored.trim()) return stored;
      return DEFAULT_MERCHANT_PHOTO;
    } catch {
      return DEFAULT_MERCHANT_PHOTO;
    }
  });

  const [merchantPayeeName, setMerchantPayeeName] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.NAME) || DEFAULT_MERCHANT_NAME;
    } catch {
      return DEFAULT_MERCHANT_NAME;
    }
  });

  const [merchantUpiId, setMerchantUpiId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.UPI);
      if (stored === '8709107808@okbizaxis') {
        localStorage.setItem(STORAGE_KEYS.UPI, DEFAULT_MERCHANT_UPI);
        return DEFAULT_MERCHANT_UPI;
      }
      return stored || DEFAULT_MERCHANT_UPI;
    } catch {
      return DEFAULT_MERCHANT_UPI;
    }
  });

  const [merchantVerified, setMerchantVerified] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.VERIFIED);
      return v === null ? true : v === 'true';
    } catch {
      return true;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch authoritative merchant settings from backend
  const refreshMerchantConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/public/merchant-config');
      if (res.ok) {
        const data = await res.json();
        const photo = data.merchantPhotoUrl ?? null;
        const name = data.merchantPayeeName || DEFAULT_MERCHANT_NAME;
        const upi = data.merchantUpiId || DEFAULT_MERCHANT_UPI;
        const verified = data.merchantVerified !== false;

        setMerchantPhotoUrl(photo);
        setMerchantPayeeName(name);
        setMerchantUpiId(upi);
        setMerchantVerified(verified);

        try {
          if (photo === null) {
            localStorage.setItem(STORAGE_KEYS.PHOTO, '__REMOVED__');
          } else {
            localStorage.setItem(STORAGE_KEYS.PHOTO, photo);
          }
          localStorage.setItem(STORAGE_KEYS.NAME, name);
          localStorage.setItem(STORAGE_KEYS.UPI, upi);
          localStorage.setItem(STORAGE_KEYS.VERIFIED, String(verified));
        } catch {
          // ignore localStorage errors
        }
      }
    } catch (err) {
      console.warn('Could not sync remote merchant config, using cached local config:', err);
    }
  }, []);

  useEffect(() => {
    refreshMerchantConfig();

    const handleSync = (e: any) => {
      if (e.detail) {
        if (e.detail.merchantPhotoUrl !== undefined) setMerchantPhotoUrl(e.detail.merchantPhotoUrl);
        if (e.detail.merchantPayeeName !== undefined) setMerchantPayeeName(e.detail.merchantPayeeName);
        if (e.detail.merchantUpiId !== undefined) setMerchantUpiId(e.detail.merchantUpiId);
        if (e.detail.merchantVerified !== undefined) setMerchantVerified(e.detail.merchantVerified);
      }
    };

    window.addEventListener('sevaconnect-merchant-sync', handleSync);
    return () => window.removeEventListener('sevaconnect-merchant-sync', handleSync);
  }, [refreshMerchantConfig]);

  // Update merchant config (Admin only or fallback local preview)
  const updateMerchantConfig = async (updates: {
    merchantPhotoUrl?: string | null;
    merchantPayeeName?: string;
    merchantUpiId?: string;
    merchantVerified?: boolean;
  }) => {
    setIsLoading(true);
    try {
      // 1. Optimistic update
      if (updates.merchantPhotoUrl !== undefined) {
        setMerchantPhotoUrl(updates.merchantPhotoUrl);
        if (updates.merchantPhotoUrl === null || updates.merchantPhotoUrl === '') {
          localStorage.setItem(STORAGE_KEYS.PHOTO, '__REMOVED__');
        } else {
          localStorage.setItem(STORAGE_KEYS.PHOTO, updates.merchantPhotoUrl);
        }
      }
      if (updates.merchantPayeeName !== undefined) {
        setMerchantPayeeName(updates.merchantPayeeName);
        localStorage.setItem(STORAGE_KEYS.NAME, updates.merchantPayeeName);
      }
      if (updates.merchantUpiId !== undefined) {
        setMerchantUpiId(updates.merchantUpiId);
        localStorage.setItem(STORAGE_KEYS.UPI, updates.merchantUpiId);
      }
      if (updates.merchantVerified !== undefined) {
        setMerchantVerified(updates.merchantVerified);
        localStorage.setItem(STORAGE_KEYS.VERIFIED, String(updates.merchantVerified));
      }

      // Dispatch event to synchronize all instances
      window.dispatchEvent(
        new CustomEvent('sevaconnect-merchant-sync', {
          detail: updates,
        })
      );

      // 2. Persist to API if admin token exists
      const headers = typeof authHeaders === 'function' ? authHeaders() : authHeaders || {};
      const res = await fetch('/api/admin/merchant-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        // If not logged in as admin yet, still keep local changes and inform user
        const errData = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 403) {
          showToast('Changes saved locally. Login as Admin to permanently sync to server.', 'info');
          return;
        }
        throw new Error(errData.error || 'Failed to save merchant settings');
      }

      showToast('Merchant photo & details updated successfully!', 'success');
    } catch (err: any) {
      console.error('Update merchant config error:', err);
      showToast(err.message || 'Failed to save changes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const removeMerchantPhoto = async () => {
    await updateMerchantConfig({ merchantPhotoUrl: null });
    showToast('Merchant photo removed. Displaying initials (RK).', 'info');
  };

  const resetToDefaultPhoto = async () => {
    await updateMerchantConfig({ merchantPhotoUrl: DEFAULT_MERCHANT_PHOTO });
    showToast('Reset to default merchant photo.', 'success');
  };

  return (
    <MerchantConfigContext.Provider
      value={{
        merchantPhotoUrl,
        merchantPayeeName,
        merchantUpiId,
        merchantVerified,
        isLoading,
        updateMerchantConfig,
        removeMerchantPhoto,
        resetToDefaultPhoto,
        refreshMerchantConfig,
      }}
    >
      {children}
    </MerchantConfigContext.Provider>
  );
};

export function useMerchantConfig() {
  const context = useContext(MerchantConfigContext);
  if (!context) {
    throw new Error('useMerchantConfig must be used within a MerchantConfigProvider');
  }
  return context;
}
