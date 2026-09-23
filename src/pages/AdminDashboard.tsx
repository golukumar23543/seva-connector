import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { AdminLayout } from './admin/AdminLayout.tsx';
import { AdminLoginModal } from '../components/AdminLoginModal.tsx';
import { ShieldAlert, Loader2, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import type { Booking, ServiceCategory, User } from '../types.ts';

import { AdminOverview } from './admin/AdminOverview.tsx';
import { AdminBookings } from './admin/AdminBookings.tsx';
import { AdminProviders } from './admin/AdminProviders.tsx';
import { AdminAnalytics } from './admin/AdminAnalytics.tsx';
import { AdminServices } from './admin/AdminServices.tsx';
import { AdminUsers } from './admin/AdminUsers.tsx';
import { AdminFinance } from './admin/AdminFinance.tsx';
import { AdminPayments } from './admin/AdminPayments.tsx';
import { AdminSettings } from './admin/AdminSettings.tsx';
import { AdminNotifications } from './admin/AdminNotifications.tsx';

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
}


function AdminLockForm({ onSuccess, onNavigateHome }: { onSuccess: () => void, onNavigateHome?: () => void }) {
  const { adminLogin } = useAuth();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Incorrect password');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await adminLogin(password);
      showToast('Super Administrator session authorized', 'success');
      onSuccess();
    } catch (err: any) {
      setError('Incorrect password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 shadow-[0_0_15px_rgba(244,63,94,0.15)] text-left">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Admin Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4 text-[#0df2a4]/70 group-focus-within:text-[#0df2a4] transition-colors" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter admin password"
              autoComplete="current-password"
              className="w-full pl-10 pr-11 py-3.5 bg-[#061017] border border-[#0df2a4]/30 focus:border-[#0df2a4] focus:ring-2 focus:ring-[#0df2a4]/20 rounded-xl text-white placeholder-slate-600 text-sm font-mono transition-all outline-none shadow-inner"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#0df2a4] transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="pt-2 flex flex-col gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-[#0df2a4] hover:bg-[#00f5c4] active:scale-[0.98] disabled:opacity-60 text-slate-950 font-extrabold text-sm rounded-xl shadow-[0_0_25px_rgba(13,242,164,0.35)] hover:shadow-[0_0_35px_rgba(13,242,164,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Access Admin Dashboard</span>
              </>
            )}
          </button>
          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl text-sm border border-teal-500/20 transition-all cursor-pointer"
            >
              Return to Website
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { user, authHeaders } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [services, setServices] = useState<ServiceCategory[]>([]);

  const fetchAdminData = async () => {
    if (!user || user.role !== 'ADMIN') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [analyticsRes, bookingsRes, providersRes, customersRes, servicesRes] =
        await Promise.all([
          fetch('/api/admin/analytics', { headers: authHeaders() }),
          fetch('/api/admin/bookings', { headers: authHeaders() }),
          fetch('/api/admin/providers', { headers: authHeaders() }),
          fetch('/api/admin/customers', { headers: authHeaders() }),
          fetch('/api/services'),
        ]);

      const parseJsonSafe = async (res: Response) => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          return await res.json();
        }
        return null;
      };

      const [analyticsData, bookingsData, providersData, customersData, servicesData] =
        await Promise.all([
          parseJsonSafe(analyticsRes),
          parseJsonSafe(bookingsRes),
          parseJsonSafe(providersRes),
          parseJsonSafe(customersRes),
          parseJsonSafe(servicesRes),
        ]);

      if (analyticsData) setAnalytics(analyticsData);
      if (bookingsData) setBookings(bookingsData);
      if (providersData) setProviders(providersData);
      if (customersData) setCustomers(customersData);
      if (servicesData) setServices(servicesData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const handleVerifyProvider = async (providerId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ verificationStatus: newStatus }),
      });

      if (res.ok) {
        showToast(
          newStatus === 'APPROVED' ? 'Provider verified!' : 'Provider suspended.',
          newStatus === 'APPROVED' ? 'success' : 'info'
        );
        fetchAdminData();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const handleAddService = async (serviceData: any) => {
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(serviceData),
      });

      if (res.ok) {
        showToast('Service category added to marketplace', 'success');
        fetchAdminData();
      } else {
        showToast('Failed to add service', 'error');
      }
    } catch {
      showToast('Action failed', 'error');
    }
  };

  // Non-admin lock screen
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex-grow w-full bg-[#070e14] flex flex-col items-center justify-center p-4 sm:p-8 selection:bg-[#0df2a4] selection:text-slate-950">
        <div className="w-full max-w-md bg-gradient-to-b from-[#0a1c26] to-[#050f15] border border-[#0df2a4]/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(13,242,164,0.15)] relative overflow-hidden select-none">
          {/* Ambient Background Glow Effect */}
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#0df2a4]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0c2734] to-[#06141c] border border-[#0df2a4]/40 flex items-center justify-center text-[#0df2a4] shadow-[0_0_20px_rgba(13,242,164,0.25)] mb-5">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white mb-2">
              Super Admin Access
            </h2>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              Enter your administrative key to access the operations and governance control center.
            </p>
          </div>

          <div className="relative z-10 pt-2">
            <AdminLockForm 
              onSuccess={() => fetchAdminData()} 
              onNavigateHome={onNavigate ? () => onNavigate('home') : undefined} 
            />
          </div>
        </div>
      </div>
    );
  }

  if (loading || !analytics) {
    return (
      <div className="flex-grow w-full bg-[#03090F] flex flex-col items-center justify-center text-teal-300/80">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#0df2a4]" />
        <p className="font-medium tracking-wide">Loading SevaConnect Admin Portal...</p>
      </div>
    );
  }

  return (
    <AdminLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onNavigateHome={() => onNavigate && onNavigate('home')}
    >
      <div className="text-white">
        {activeTab === 'OVERVIEW' && <AdminOverview analytics={analytics} bookings={bookings} />}
        {activeTab === 'PAYMENTS' && <AdminPayments />}
        {activeTab === 'ANALYTICS' && <AdminAnalytics analytics={analytics} bookings={bookings} />}
        {activeTab === 'CUSTOMERS' && <AdminUsers customers={customers} onRefreshCustomers={fetchAdminData} />}
        {activeTab === 'PROVIDERS' && <AdminProviders providers={providers} onVerifyProvider={handleVerifyProvider} />}
        {activeTab === 'SERVICES' && <AdminServices services={services} onAddService={handleAddService} />}
        {activeTab === 'BOOKINGS' && <AdminBookings bookings={bookings} />}
        {activeTab === 'FINANCE' && <AdminFinance analytics={analytics} bookings={bookings} />}
        {activeTab === 'REVIEWS' && (
          <div className="py-24 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Reviews & Ratings Module</h3>
            <p className="text-slate-400">Coming soon in next release update.</p>
          </div>
        )}
        {activeTab === 'COMPLAINTS' && (
          <div className="py-24 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Support & Complaints Hub</h3>
            <p className="text-slate-400">Coming soon in next release update.</p>
          </div>
        )}
        {activeTab === 'NOTIFICATIONS' && <AdminNotifications />}
        {activeTab === 'REPORTS' && (
          <div className="py-24 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Custom Report Generation</h3>
            <p className="text-slate-400">Coming soon in next release update.</p>
          </div>
        )}
        {activeTab === 'SETTINGS' && <AdminSettings />}
      </div>
    </AdminLayout>
  );
}
