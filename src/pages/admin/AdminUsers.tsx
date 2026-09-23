import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Calendar as CalendarIcon,
  Shield,
  Mail,
  Phone,
  Eye,
  CheckCircle2,
  XCircle,
  Key,
  Clock,
  User as UserIcon,
  Home,
  FileText,
  X,
  Lock,
  Power,
  Filter,
} from 'lucide-react';
import type { User, RegistrationMethod } from '../../types.ts';
import { AdminRegistrationCodeCard } from '../../components/admin/AdminRegistrationCodeCard.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminUsersProps {
  customers: User[];
  onRefreshCustomers?: () => void;
}

export function AdminUsers({ customers, onRefreshCustomers }: AdminUsersProps) {
  const { authHeaders } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'GOOGLE' | 'EMAIL_PHONE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Counts for tabs
  const countAll = customers.length;
  const countGoogle = customers.filter(
    (c) => c.registrationMethod === 'GOOGLE' || (c as any).customerProfile?.registrationMethod === 'GOOGLE'
  ).length;
  const countEmailPhone = customers.filter(
    (c) =>
      c.registrationMethod === 'EMAIL_PHONE' ||
      (c as any).customerProfile?.registrationMethod === 'EMAIL_PHONE' ||
      (!c.registrationMethod && !(c as any).customerProfile?.registrationMethod)
  ).length;

  const handleToggleStatus = async (user: User) => {
    try {
      setUpdatingStatusId(user.id);
      const newStatus = !user.isActive;
      const res = await fetch(`/api/admin/customers/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (res.ok) {
        showToast(`Customer account ${newStatus ? 'activated' : 'deactivated'}`, 'success');
        if (selectedUser && selectedUser.id === user.id) {
          setSelectedUser({ ...selectedUser, isActive: newStatus });
        }
        if (onRefreshCustomers) onRefreshCustomers();
      } else {
        showToast('Failed to update customer status', 'error');
      }
    } catch {
      showToast('Error updating customer status', 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Not recorded';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getMethod = (user: User): RegistrationMethod => {
    return (
      user.registrationMethod ||
      user.customerProfile?.registrationMethod ||
      'EMAIL_PHONE'
    );
  };

  const filteredCustomers = customers.filter((c) => {
    const method = getMethod(c);
    // Method filter
    if (methodFilter === 'GOOGLE' && method !== 'GOOGLE') return false;
    if (methodFilter === 'EMAIL_PHONE' && method !== 'EMAIL_PHONE') return false;

    // Status filter
    if (statusFilter === 'ACTIVE' && !c.isActive) return false;
    if (statusFilter === 'INACTIVE' && c.isActive) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const profile = c.customerProfile;
      const address = profile?.address;
      const matchName = c.name?.toLowerCase().includes(q) || profile?.firstName?.toLowerCase().includes(q) || profile?.lastName?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchPhone = c.phone?.includes(q) || profile?.altPhone?.includes(q);
      const matchId = c.id?.toLowerCase().includes(q);
      const matchCity = address?.city?.toLowerCase().includes(q) || address?.pincode?.includes(q);
      return Boolean(matchName || matchEmail || matchPhone || matchId || matchCity);
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. REGISTRATION CODE MANAGER COMPONENT */}
      <AdminRegistrationCodeCard />

      {/* 2. CUSTOMER MANAGEMENT CONTROLS */}
      <div className="bg-[#061017] border border-teal-900/40 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white font-display">Customer Directory</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Browse, filter, and audit verified customer registrations with complete identity and address data.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email, phone, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0a1822] border border-teal-900/50 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-[#0df2a4] outline-none transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar: Registration Method & Account Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-teal-900/30">
          {/* Method Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0a1822] rounded-xl border border-teal-900/40 text-xs">
            <button
              onClick={() => setMethodFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                methodFilter === 'ALL'
                  ? 'bg-[#0df2a4] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>All Customers</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${methodFilter === 'ALL' ? 'bg-slate-900/30 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>
                {countAll}
              </span>
            </button>

            <button
              onClick={() => setMethodFilter('GOOGLE')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                methodFilter === 'GOOGLE'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {/* Google G mini logo */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google Registered</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${methodFilter === 'GOOGLE' ? 'bg-white/20 text-white font-bold' : 'bg-slate-800 text-slate-300'}`}>
                {countGoogle}
              </span>
            </button>

            <button
              onClick={() => setMethodFilter('EMAIL_PHONE')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                methodFilter === 'EMAIL_PHONE'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Email + Phone</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${methodFilter === 'EMAIL_PHONE' ? 'bg-white/20 text-white font-bold' : 'bg-slate-800 text-slate-300'}`}>
                {countEmailPhone}
              </span>
            </button>
          </div>

          {/* Status Select Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#0a1822] border border-teal-900/40 rounded-xl px-3 py-1.5 text-slate-200 text-xs outline-none focus:border-[#0df2a4]"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Deactivated Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. CUSTOMER RECORDS LIST / GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-[#061017] rounded-2xl border border-teal-900/20 space-y-2">
            <UserIcon className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-base font-semibold text-slate-300">No customer records found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No registered customers match your current filter settings or search query.
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const method = getMethod(customer);
            const profile = customer.customerProfile;
            const address = profile?.address;
            const age = calculateAge(profile?.dob);

            return (
              <div
                key={customer.id}
                className="bg-[#061017] border border-teal-900/40 hover:border-teal-500/50 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Method Glow indicator in corner */}
                <div
                  className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full pointer-events-none opacity-20 blur-xl ${
                    method === 'GOOGLE' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`}
                />

                {/* Top Row: Avatar, Name, Status & Method Badge */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {customer.avatarUrl ? (
                        <img
                          src={customer.avatarUrl}
                          alt={customer.name}
                          className="w-12 h-12 rounded-full border border-teal-500/30 object-cover bg-slate-800"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0df2a4]/20 to-teal-500/10 border border-[#0df2a4]/30 flex items-center justify-center text-xl font-display font-bold text-[#0df2a4]">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-white text-base leading-tight group-hover:text-[#0df2a4] transition-colors">
                            {customer.name}
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                          ID: {customer.id}
                        </span>
                      </div>
                    </div>

                    {/* Registration Method Badge */}
                    <div>
                      {method === 'GOOGLE' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-sm">
                          <svg className="w-3 h-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          Google
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
                          <Key className="w-3 h-3 text-emerald-400" />
                          Email + Phone
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer Information Grid */}
                  <div className="space-y-2 text-xs text-slate-300 my-3.5 pt-2 border-t border-teal-900/30">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono truncate">{customer.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono">{customer.phone || 'Not provided'}</span>
                      {profile?.altPhone && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          (Alt: {profile.altPhone})
                        </span>
                      )}
                    </div>

                    {profile?.dob && (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>
                          DOB: <strong className="text-slate-200">{profile.dob}</strong>
                          {age !== null && <span className="text-slate-400"> ({age} yrs)</span>}
                        </span>
                      </div>
                    )}

                    {address && (
                      <div className="flex items-start gap-2 pt-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-[#0df2a4] shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed text-[11px]">
                          {address.houseFlat}, {address.streetArea}, {address.city}, {address.state} -{' '}
                          <strong className="text-slate-200 font-mono">{address.pincode}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Metadata & Actions */}
                <div className="pt-3 border-t border-teal-900/40 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1 text-[10px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Joined: {formatDate(customer.createdAt).split(',')[0]}
                    </span>
                    {customer.lastLoginAt && (
                      <span className="text-[9px] text-slate-500 font-mono">
                        Last Active: {formatDate(customer.lastLoginAt).split(',')[0]}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Active toggle button */}
                    <button
                      onClick={() => handleToggleStatus(customer)}
                      disabled={updatingStatusId === customer.id}
                      title={customer.isActive ? 'Click to deactivate customer' : 'Click to activate customer'}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        customer.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-rose-500/20 hover:text-rose-300 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 hover:bg-emerald-500/20 hover:text-emerald-300 border border-rose-500/20'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{customer.isActive ? 'Active' : 'Inactive'}</span>
                    </button>

                    {/* View full details modal */}
                    <button
                      onClick={() => setSelectedUser(customer)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-[#0df2a4]/20 text-slate-400 hover:text-[#0df2a4] border border-teal-500/20 transition-all cursor-pointer"
                      title="View complete customer profile"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. DETAILED CUSTOMER PROFILE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#08151f] border border-teal-500/40 w-full max-w-2xl rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(13,242,164,0.15)] relative animate-in fade-in zoom-in-95 duration-150 my-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-teal-900/40">
              <div className="flex items-center gap-3">
                {selectedUser.avatarUrl ? (
                  <img
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.name}
                    className="w-14 h-14 rounded-2xl border border-teal-500/40 object-cover bg-slate-800"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0df2a4]/20 to-teal-500/10 border border-[#0df2a4]/40 flex items-center justify-center text-2xl font-bold text-[#0df2a4]">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white font-display">{selectedUser.name}</h3>
                    {selectedUser.isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        DEACTIVATED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">User ID: {selectedUser.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="py-5 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
              {/* Registration Method & Verification Block */}
              <div className="p-4 rounded-2xl bg-[#040e15] border border-teal-900/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {getMethod(selectedUser) === 'GOOGLE' ? (
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#0df2a4]">
                      <Key className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                      Registration Method
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {getMethod(selectedUser) === 'GOOGLE'
                        ? 'Google OAuth Verified'
                        : 'Email + Phone (Admin Code Verified)'}
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">Password Security</span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    {getMethod(selectedUser) === 'GOOGLE'
                      ? 'Protected via Google SSO (No Local Password)'
                      : 'PBKDF2 Salted Hash (Encrypted)'}
                  </span>
                </div>
              </div>

              {/* Section 1: Personal Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0df2a4] flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#051017] p-4 rounded-xl border border-teal-900/30">
                  <div>
                    <span className="text-slate-400 block text-[11px]">First Name:</span>
                    <span className="font-semibold text-white text-sm">
                      {selectedUser.customerProfile?.firstName || selectedUser.name.split(' ')[0]}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Last Name:</span>
                    <span className="font-semibold text-white text-sm">
                      {selectedUser.customerProfile?.lastName || selectedUser.name.split(' ').slice(1).join(' ') || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date of Birth (DOB):</span>
                    <span className="font-semibold text-white text-sm">
                      {selectedUser.customerProfile?.dob || 'Not provided'}
                      {selectedUser.customerProfile?.dob && (
                        <span className="text-slate-400 font-normal ml-1">
                          ({calculateAge(selectedUser.customerProfile?.dob)} years old)
                        </span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Address:</span>
                    <span className="font-mono text-white text-sm">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Primary Phone:</span>
                    <span className="font-mono text-white text-sm">{selectedUser.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Alternative Phone:</span>
                    <span className="font-mono text-white text-sm">
                      {selectedUser.customerProfile?.altPhone || 'None specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Complete Address Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0df2a4] flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" />
                  Complete Registered Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#051017] p-4 rounded-xl border border-teal-900/30">
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">House / Flat / Unit No:</span>
                    <span className="font-semibold text-white text-sm">
                      {selectedUser.customerProfile?.address?.houseFlat || 'Not provided'}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Street / Area / Colony:</span>
                    <span className="font-semibold text-white text-sm">
                      {selectedUser.customerProfile?.address?.streetArea || 'Not provided'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">City:</span>
                    <span className="font-semibold text-white text-sm">
                      {selectedUser.customerProfile?.address?.city || 'Patna'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">State:</span>
                    <span className="font-semibold text-white text-sm">
                      {selectedUser.customerProfile?.address?.state || 'Bihar'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">PIN Code:</span>
                    <span className="font-mono font-bold text-[#0df2a4] text-sm">
                      {selectedUser.customerProfile?.address?.pincode || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: System Timestamps & Activity */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0df2a4] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Account Timestamps & Metrics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#051017] p-4 rounded-xl border border-teal-900/30 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Account Registered:</span>
                    <span className="text-slate-200">{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Last Login Activity:</span>
                    <span className="text-slate-200">{formatDate(selectedUser.lastLoginAt)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Bookings:</span>
                    <span className="text-[#0df2a4] font-bold text-sm">
                      {(selectedUser as any).totalBookings || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Service Expenditure:</span>
                    <span className="text-[#0df2a4] font-bold text-sm">
                      ₹{(selectedUser as any).totalSpent || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-4 border-t border-teal-900/40 flex items-center justify-between gap-3">
              <button
                onClick={() => handleToggleStatus(selectedUser)}
                disabled={updatingStatusId === selectedUser.id}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  selectedUser.isActive
                    ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{selectedUser.isActive ? 'Deactivate Customer Account' : 'Activate Customer Account'}</span>
              </button>

              <button
                onClick={() => setSelectedUser(null)}
                className="py-2.5 px-5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
