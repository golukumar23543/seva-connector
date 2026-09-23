import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Download,
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  MessageSquare,
  Copy,
  ChevronDown,
  Camera,
  Pencil
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { MerchantPhotoModal } from '../../components/MerchantPhotoModal.tsx';
import type { PaymentRecord, PaymentStats, UpiPaymentStatus } from '../../types.ts';

export function AdminPayments() {
  const { authHeaders } = useAuth();
  const { showToast } = useToast();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | UpiPaymentStatus>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');

  // Modals
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [screenshotModalUrl, setScreenshotModalUrl] = useState<string | null>(null);
  const [rejectingPayment, setRejectingPayment] = useState<PaymentRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [verifyingPayment, setVerifyingPayment] = useState<PaymentRecord | null>(null);
  const [adminRemarks, setAdminRemarks] = useState<string>('');
  const [isActionPending, setIsActionPending] = useState<boolean>(false);

  const fetchPayments = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const headers = typeof authHeaders === 'function' ? authHeaders() : authHeaders || {};
      const res = await fetch('/api/admin/payments', {
        headers: {
          ...headers,
        },
      });
      if (!res.ok) throw new Error('Failed to load admin payments');
      const data = await res.json();
      setPayments(data.payments || []);
      setStats(data.stats || null);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      showToast(err.message || 'Failed to fetch payments data', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Unique services list for filter dropdown
  const uniqueServices = useMemo(() => {
    const set = new Set<string>();
    payments.forEach((p) => {
      if (p.serviceOrPlan) set.add(p.serviceOrPlan);
    });
    return Array.from(set);
  }, [payments]);

  // Client-side filtering logic
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // 1. Status Filter
      if (statusFilter !== 'ALL' && payment.status !== statusFilter) {
        return false;
      }

      // 2. Service Filter
      if (serviceFilter !== 'ALL' && payment.serviceOrPlan !== serviceFilter) {
        return false;
      }

      // 3. Date Range Filter
      if (dateRangeFilter !== 'ALL') {
        const pDate = new Date(payment.createdAt).getTime();
        const now = Date.now();
        if (dateRangeFilter === 'TODAY') {
          const startOfToday = new Date().setHours(0, 0, 0, 0);
          if (pDate < startOfToday) return false;
        } else if (dateRangeFilter === 'WEEK') {
          const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
          if (pDate < oneWeekAgo) return false;
        } else if (dateRangeFilter === 'MONTH') {
          const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
          if (pDate < oneMonthAgo) return false;
        }
      }

      // 4. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = payment.customerName?.toLowerCase().includes(q);
        const matchEmail = payment.customerEmail?.toLowerCase().includes(q);
        const matchPhone = payment.customerPhone?.toLowerCase().includes(q);
        const matchUtr = payment.utr?.toLowerCase().includes(q);
        const matchBooking = payment.bookingCode?.toLowerCase().includes(q) || payment.bookingId?.toLowerCase().includes(q);
        const matchService = payment.serviceOrPlan?.toLowerCase().includes(q);
        const matchId = payment.id.toLowerCase().includes(q);
        return matchName || matchEmail || matchPhone || matchUtr || matchBooking || matchService || matchId;
      }

      return true;
    });
  }, [payments, statusFilter, serviceFilter, dateRangeFilter, searchQuery]);

  // Handle Verify Action
  const handleConfirmVerify = async () => {
    if (!verifyingPayment) return;
    setIsActionPending(true);
    try {
      const res = await fetch(`/api/admin/payments/${verifyingPayment.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          adminRemarks: adminRemarks.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify payment');

      showToast(`Payment ${verifyingPayment.id} verified and marked as PAID!`, 'success');
      setVerifyingPayment(null);
      setAdminRemarks('');
      await fetchPayments(false);
    } catch (err: any) {
      showToast(err.message || 'Verification error', 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  // Handle Reject Action
  const handleConfirmReject = async () => {
    if (!rejectingPayment) return;
    if (!rejectionReason.trim()) {
      showToast('Please provide a rejection reason.', 'error');
      return;
    }

    setIsActionPending(true);
    try {
      const res = await fetch(`/api/admin/payments/${rejectingPayment.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          rejectionReason: rejectionReason.trim(),
          adminRemarks: adminRemarks.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject payment');

      showToast(`Payment ${rejectingPayment.id} rejected. Customer will be notified.`, 'info');
      setRejectingPayment(null);
      setRejectionReason('');
      setAdminRemarks('');
      await fetchPayments(false);
    } catch (err: any) {
      showToast(err.message || 'Rejection error', 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  // Copy to clipboard helper
  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard`, 'success');
  };

  // CSV Export
  const exportCsv = () => {
    if (filteredPayments.length === 0) {
      showToast('No payment records to export', 'error');
      return;
    }
    const headers = ['Payment ID', 'Booking Ref', 'Customer Name', 'Customer Email', 'Customer Phone', 'Service/Plan', 'Amount (INR)', 'UPI ID', 'UTR', 'Status', 'Date Time', 'Verified By', 'Verified At', 'Rejection Reason'];
    const rows = filteredPayments.map((p) => [
      `"${p.id}"`,
      `"${p.bookingCode || p.bookingId}"`,
      `"${p.customerName || ''}"`,
      `"${p.customerEmail || ''}"`,
      `"${p.customerPhone || ''}"`,
      `"${p.serviceOrPlan || ''}"`,
      p.amount,
      `"${p.upiId}"`,
      `"${p.utr}"`,
      `"${p.status}"`,
      `"${p.createdAt}"`,
      `"${p.verifiedByAdminName || ''}"`,
      `"${p.verifiedAt || ''}"`,
      `"${p.rejectionReason || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sevaconnect_payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Payments exported to CSV successfully', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0a1824] p-5 rounded-2xl border border-teal-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-[#0df2a4] border border-teal-500/30">
              <CreditCard className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              UPI Payment Management &amp; Verification
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time tracking for official UPI ID: <strong className="text-teal-300 font-mono">ravikanhauli91@ptyes</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            onClick={() => fetchPayments(true)}
            disabled={isRefreshing}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh payment records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0df2a4]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCsv}
            className="py-2 px-3.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 text-teal-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#0df2a4]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsPhotoModalOpen(true)}
            className="py-2 px-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]"
            title="Edit / Remove Merchant Photo & UPI Profile"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>QR Photo &amp; Profile</span>
          </button>
        </div>
      </div>

      {/* 2. Statistical Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Payments */}
        <div className="p-3.5 rounded-2xl bg-[#07141f] border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400">Total Payments</span>
          <div className="mt-2 text-xl font-black text-white">{stats?.totalPayments ?? payments.length}</div>
          <span className="text-[10px] text-slate-500 mt-1">{stats?.totalTransactions ?? payments.length} logged records</span>
        </div>

        {/* Verified / Paid Amount */}
        <div className="p-3.5 rounded-2xl bg-[#07141f] border border-emerald-500/30 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified Paid
          </span>
          <div className="mt-2 text-xl font-black text-emerald-400">
            ₹{(stats?.totalVerifiedAmount ?? 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Confirmed received</span>
        </div>

        {/* Pending Amount */}
        <div className="p-3.5 rounded-2xl bg-[#07141f] border border-amber-500/30 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" /> Pending Verification
          </span>
          <div className="mt-2 text-xl font-black text-amber-400">
            ₹{(stats?.totalPendingAmount ?? 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Requires review</span>
        </div>

        {/* Rejected Amount */}
        <div className="p-3.5 rounded-2xl bg-[#07141f] border border-rose-500/30 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-400" /> Rejected Amount
          </span>
          <div className="mt-2 text-xl font-black text-rose-400">
            ₹{(stats?.totalRejectedAmount ?? 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Declined transfers</span>
        </div>

        {/* Total Transactions */}
        <div className="p-3.5 rounded-2xl bg-[#07141f] border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400">Transactions</span>
          <div className="mt-2 text-xl font-black text-teal-300">{stats?.totalTransactions ?? payments.length}</div>
          <span className="text-[10px] text-slate-500 mt-1">All time counts</span>
        </div>

        {/* Today's Payments */}
        <div className="p-3.5 rounded-2xl bg-[#07141f] border border-teal-500/30 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#0df2a4] flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Today's Flow
          </span>
          <div className="mt-2 text-lg font-black text-white">
            ₹{(stats?.todayPaymentsAmount ?? 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-teal-400 mt-1">{stats?.todayPaymentsCount ?? 0} today entries</span>
        </div>

        {/* This Month's Payments */}
        <div className="p-3.5 rounded-2xl bg-[#07141f] border border-teal-500/30 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-teal-300 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Month Flow
          </span>
          <div className="mt-2 text-lg font-black text-white">
            ₹{(stats?.thisMonthPaymentsAmount ?? 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-teal-400 mt-1">{stats?.thisMonthPaymentsCount ?? 0} month entries</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#091b26] border border-teal-900/50 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Customer, UTR, Booking ID..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#051118] border border-slate-800 focus:border-teal-500 text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#051118] border border-slate-800 focus:border-teal-500 text-slate-200 outline-none transition-all cursor-pointer font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING VERIFICATION">Pending Verification</option>
              <option value="VERIFIED / PAID">Verified / Paid</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Date Range Dropdown */}
          <div>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#051118] border border-slate-800 focus:border-teal-500 text-slate-200 outline-none transition-all cursor-pointer font-medium"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today Only</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">This Month</option>
            </select>
          </div>

          {/* Service Dropdown */}
          <div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#051118] border border-slate-800 focus:border-teal-500 text-slate-200 outline-none transition-all cursor-pointer font-medium truncate"
            >
              <option value="ALL">All Services &amp; Plans</option>
              {uniqueServices.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
          <span>Showing <strong className="text-white font-bold">{filteredPayments.length}</strong> of {payments.length} payments</span>
          {(searchQuery || statusFilter !== 'ALL' || dateRangeFilter !== 'ALL' || serviceFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setDateRangeFilter('ALL');
                setServiceFilter('ALL');
              }}
              className="text-[#0df2a4] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Payments Table */}
      <div className="rounded-2xl border border-teal-900/40 bg-[#07131b] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#030a0f] text-[11px] text-slate-400 uppercase tracking-wider border-b border-teal-950">
              <tr>
                <th className="py-3.5 px-4 font-bold">Payment ID &amp; Date</th>
                <th className="py-3.5 px-4 font-bold">Customer Details</th>
                <th className="py-3.5 px-4 font-bold">Service / Booking</th>
                <th className="py-3.5 px-4 font-bold">Amount</th>
                <th className="py-3.5 px-4 font-bold">UTR / Reference</th>
                <th className="py-3.5 px-4 font-bold">Receipt</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0df2a4] mb-2" />
                    <span>Loading payment transactions...</span>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-300">No payment records found</p>
                    <p className="text-xs text-slate-500 mt-1">Try changing your search keywords or filter criteria</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isPending = p.status === 'PENDING VERIFICATION';
                  const isVerified = p.status === 'VERIFIED / PAID';
                  const isRejected = p.status === 'REJECTED';

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                      {/* 1. Payment ID & Date */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white tracking-tight">{p.id}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(p.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          <span className="text-slate-500">
                            {new Date(p.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      {/* 2. Customer Details */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200">{p.customerName || 'Customer'}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[170px]">{p.customerEmail}</div>
                        {p.customerPhone && (
                          <div className="text-[10px] text-teal-400 font-mono">{p.customerPhone}</div>
                        )}
                      </td>

                      {/* 3. Service / Booking */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-white truncate max-w-[190px]" title={p.serviceOrPlan}>
                          {p.serviceOrPlan || 'Standard Service'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Ref: <span className="text-teal-300 font-semibold">{p.bookingCode || p.bookingId}</span>
                        </div>
                      </td>

                      {/* 4. Amount */}
                      <td className="py-3 px-4">
                        <div className="font-black text-sm text-[#0df2a4] font-mono">₹{p.amount}</div>
                        <div className="text-[10px] text-slate-500 font-mono">to: {p.upiId}</div>
                      </td>

                      {/* 5. UTR / Reference */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white bg-[#030e14] py-1 px-2 rounded-lg border border-slate-800 w-fit">
                          <span className="select-all">{p.utr}</span>
                          <button
                            onClick={() => copyText(p.utr, 'UTR')}
                            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy UTR"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* 6. Receipt Screenshot */}
                      <td className="py-3 px-4">
                        {p.screenshotUrl ? (
                          <button
                            onClick={() => setScreenshotModalUrl(p.screenshotUrl!)}
                            className="relative group block w-10 h-10 rounded-lg overflow-hidden border border-teal-500/40 hover:border-[#0df2a4] transition-all cursor-pointer shadow-sm"
                            title="Click to view full receipt"
                          >
                            <img
                              src={p.screenshotUrl}
                              alt="Receipt"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">No image</span>
                        )}
                      </td>

                      {/* 7. Status Badge */}
                      <td className="py-3 px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 font-bold text-[11px] animate-pulse">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                        {isVerified && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified / Paid
                            </span>
                            {p.verifiedByAdminName && (
                              <div className="text-[10px] text-slate-400 mt-1">
                                By: <strong className="text-slate-300">{p.verifiedByAdminName}</strong>
                              </div>
                            )}
                          </div>
                        )}
                        {isRejected && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/40 text-rose-300 font-bold text-[11px]">
                              <XCircle className="w-3 h-3 text-rose-400" /> Rejected
                            </span>
                            {p.rejectionReason && (
                              <div className="text-[10px] text-rose-400/90 mt-1 truncate max-w-[140px]" title={p.rejectionReason}>
                                {p.rejectionReason}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 8. Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View details */}
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="View Full Payment Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Verify Button (active if pending or rejected) */}
                          {!isVerified && (
                            <button
                              onClick={() => {
                                setVerifyingPayment(p);
                                setAdminRemarks('');
                              }}
                              className="py-1 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                              title="Verify Payment in Bank Records"
                            >
                              <Check className="w-3 h-3" />
                              <span>Verify</span>
                            </button>
                          )}

                          {/* Reject Button (active if pending) */}
                          {isPending && (
                            <button
                              onClick={() => {
                                setRejectingPayment(p);
                                setRejectionReason('');
                                setAdminRemarks('');
                              }}
                              className="py-1 px-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                              title="Reject Fake or Unsettled UTR"
                            >
                              <X className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODAL 1: VIEW DETAILS & AUDIT TRAIL */}
      {/* ==================================================== */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-[#091b26] border border-teal-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-5 animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-teal-900/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#0df2a4]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Payment Record Details</h3>
                  <p className="text-xs font-mono text-teal-300">{selectedPayment.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick summary grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#040e14] border border-slate-800">
                <span className="text-slate-400">Customer</span>
                <div className="font-bold text-white text-sm mt-0.5">{selectedPayment.customerName}</div>
                <div className="text-slate-400 truncate">{selectedPayment.customerEmail}</div>
                {selectedPayment.customerPhone && <div className="text-teal-400 font-mono">{selectedPayment.customerPhone}</div>}
              </div>

              <div className="p-3 rounded-xl bg-[#040e14] border border-slate-800">
                <span className="text-slate-400">Service &amp; Amount</span>
                <div className="font-bold text-white text-sm mt-0.5">{selectedPayment.serviceOrPlan}</div>
                <div className="text-xl font-black text-[#0df2a4] font-mono mt-1">₹{selectedPayment.amount}</div>
              </div>
            </div>

            {/* UTR & Account */}
            <div className="p-3.5 rounded-xl bg-[#040e14] border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Order / Booking ID:</span>
                <span className="font-mono font-bold text-teal-300">{selectedPayment.bookingCode || selectedPayment.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target UPI ID:</span>
                <span className="font-mono font-bold text-white">{selectedPayment.upiId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Submitted UTR:</span>
                <span className="font-mono font-bold text-[#0df2a4]">{selectedPayment.utr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Status:</span>
                <span className={`font-bold ${
                  selectedPayment.status === 'VERIFIED / PAID' ? 'text-emerald-400' :
                  selectedPayment.status === 'REJECTED' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {selectedPayment.status}
                </span>
              </div>
              {selectedPayment.verifiedByAdminName && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Verified By Admin:</span>
                  <span className="font-semibold text-slate-200">{selectedPayment.verifiedByAdminName}</span>
                </div>
              )}
              {selectedPayment.verifiedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Verified Timestamp:</span>
                  <span className="text-slate-300">{new Date(selectedPayment.verifiedAt).toLocaleString('en-IN')}</span>
                </div>
              )}
              {selectedPayment.rejectionReason && (
                <div className="flex justify-between">
                  <span className="text-rose-400">Rejection Reason:</span>
                  <span className="font-medium text-rose-300 text-right max-w-xs">{selectedPayment.rejectionReason}</span>
                </div>
              )}
              {selectedPayment.adminRemarks && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Admin Remarks:</span>
                  <span className="italic text-slate-300 text-right max-w-xs">{selectedPayment.adminRemarks}</span>
                </div>
              )}
            </div>

            {/* Audit History Trail */}
            {selectedPayment.history && selectedPayment.history.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Audit Trail</h4>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedPayment.history.map((h, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#040e14] border border-slate-800 text-[11px] flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0df2a4] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between text-slate-400">
                          <strong className="text-slate-200">{h.status}</strong>
                          <span>{new Date(h.changedAt).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="text-slate-300 mt-0.5">{h.note}</div>
                        <div className="text-[10px] text-slate-500">By: {h.changedBy}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Screenshot preview button if available */}
            {selectedPayment.screenshotUrl && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    setScreenshotModalUrl(selectedPayment.screenshotUrl!);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Attached Receipt Screenshot</span>
                </button>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPayment(null)}
                className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: FULL-SIZE SCREENSHOT PREVIEW */}
      {/* ==================================================== */}
      {screenshotModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="relative max-w-2xl w-full bg-[#0a1824] rounded-3xl border border-teal-500/40 p-4 shadow-2xl flex flex-col items-center animate-fadeIn">
            <div className="w-full flex items-center justify-between pb-3 border-b border-teal-900/60 mb-3 text-xs text-slate-300">
              <span className="font-bold flex items-center gap-1.5 text-white">
                <Eye className="w-4 h-4 text-[#0df2a4]" /> Customer Payment Screenshot
              </span>
              <button
                onClick={() => setScreenshotModalUrl(null)}
                className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full max-h-[75vh] overflow-auto rounded-xl bg-black flex items-center justify-center p-2">
              <img
                src={screenshotModalUrl}
                alt="Payment Receipt"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>

            <div className="w-full pt-3 flex justify-end">
              <button
                onClick={() => setScreenshotModalUrl(null)}
                className="py-2 px-6 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-[#0df2a4] text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: VERIFY PAYMENT CONFIRMATION */}
      {/* ==================================================== */}
      {verifyingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#091b26] border border-emerald-500/40 rounded-3xl p-5 shadow-2xl text-white space-y-4 animate-fadeIn">
            
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Payment Verification</h3>
                <p className="text-xs text-slate-400">Mark booking payment as PAID</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#040e14] border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Payment ID:</span>
                <span className="font-mono font-bold text-white">{verifyingPayment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-semibold text-slate-200">{verifyingPayment.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">UTR / Ref:</span>
                <span className="font-mono font-bold text-[#0df2a4]">{verifyingPayment.utr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="text-base font-black text-emerald-400">₹{verifyingPayment.amount}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Admin Remarks / Note <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="e.g. Verified in Axis Bank merchant statement #7291"
                className="w-full py-2.5 px-3 rounded-xl bg-[#040e14] border border-slate-800 focus:border-emerald-500 text-white text-xs outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setVerifyingPayment(null)}
                disabled={isActionPending}
                className="py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-white/5 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerify}
                disabled={isActionPending}
                className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                {isActionPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Confirm &amp; Mark Paid</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: REJECT PAYMENT (WITH REASON) */}
      {/* ==================================================== */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#091b26] border border-rose-500/40 rounded-3xl p-5 shadow-2xl text-white space-y-4 animate-fadeIn">
            
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reject Payment</h3>
                <p className="text-xs text-slate-400">Declined transfer will be logged and shown to customer</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#040e14] border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Payment ID:</span>
                <span className="font-mono font-bold text-white">{rejectingPayment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">UTR / Ref:</span>
                <span className="font-mono font-bold text-rose-300">{rejectingPayment.utr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-black text-white">₹{rejectingPayment.amount}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-rose-300 font-semibold mb-1">
                Rejection Reason <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. UTR not found in bank statement, invalid transaction, or amount mismatch."
                rows={3}
                required
                className="w-full py-2.5 px-3 rounded-xl bg-[#040e14] border border-rose-500/50 focus:border-rose-400 text-white text-xs outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectingPayment(null)}
                disabled={isActionPending}
                className="py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-white/5 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isActionPending || !rejectionReason.trim()}
                className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/30 disabled:opacity-50 active:scale-95"
              >
                {isActionPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merchant Photo & Profile Settings Modal */}
      <MerchantPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />

    </div>
  );
}
