import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import type { Booking, BookingStatus, Review, PaymentRecord } from '../types.ts';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  Star,
  X,
  ChevronRight,
  ArrowRight,
  Search,
  RotateCcw,
  Sparkles,
  Phone,
  ShieldCheck,
  Truck,
  Wrench,
  Printer,
  Download,
  Copy,
  Check,
  Camera,
  User as UserIcon,
  Edit3,
  CreditCard,
  QrCode,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { ViewProfileModal } from '../components/profile/ViewProfileModal.tsx';
import { EditProfileModal } from '../components/profile/EditProfileModal.tsx';
import { UpiPaymentModal } from '../components/UpiPaymentModal.tsx';
import { NotificationsPopover } from '../components/NotificationsPopover.tsx';

interface CustomerDashboardProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenBooking: () => void;
}

export function CustomerDashboard({ onNavigate, onOpenBooking }: CustomerDashboardProps) {
  const { user, authHeaders } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected booking for timeline/details modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Review modal state
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Cancellation modal state
  const [cancelBookingTarget, setCancelBookingTarget] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of plans / Issue resolved');
  const [cancelling, setCancelling] = useState(false);

  // Printing slip state
  const [printingBooking, setPrintingBooking] = useState<Booking | null>(null);
  const [copied, setCopied] = useState(false);

  // Profile modals
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  // Payments states
  const [activeNavTab, setActiveNavTab] = useState<'BOOKINGS' | 'PAYMENTS'>('BOOKINGS');
  const [myPayments, setMyPayments] = useState<PaymentRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);

  const handlePrintSlip = () => {
    try {
      window.print();
    } catch {
      showToast('Print dialog unavailable. You can download or copy the slip below.', 'info');
    }
  };

  const handleCopySlip = (b: Booking) => {
    const text = `===========================================
SEVA CONNECTER - OFFICIAL BOOKING RECEIPT
Booking Code: #${b.bookingCode}
Date Placed: ${new Date(b.createdAt).toLocaleString('en-IN')}
-------------------------------------------
CUSTOMER DETAILS:
Name: ${b.customerName || user?.name || 'Customer'}
Phone: ${b.customerPhone || user?.phone || 'N/A'}
Address: ${b.address}, ${b.area}, ${b.city} - ${b.pincode}

SERVICE & TECHNICIAN:
Service: ${b.serviceName}
Technician: ${b.providerName}
Appointment: ${b.date} at ${b.timeSlot}
Work Description: ${b.problemDescription || 'Standard Doorstep Service'}

BILLING BREAKDOWN:
Inspection & Labor Base: ₹${b.estimatedPrice}
Doorstep Safety & Platform: ₹${b.platformFee}
GST / Taxes (18%): ₹${b.taxAmount}
-------------------------------------------
TOTAL AMOUNT: ₹${b.totalAmount}
Payment Mode: ${b.paymentMethod} (${b.paymentStatus})
-------------------------------------------
VERIFICATION OTP: ${b.bookingCode.slice(-4) || '8294'}
30-Day Doorstep Guarantee Included
Helpline: +91 98290 11111 | support@sevaconnect.in
===========================================`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Booking details copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSlip = (b: Booking) => {
    const text = `===========================================
SEVA CONNECTER - OFFICIAL BOOKING RECEIPT
Booking Reference: #${b.bookingCode}
Placed: ${new Date(b.createdAt).toLocaleString('en-IN')}
Status: ${b.status}
-------------------------------------------
CUSTOMER & LOCATION:
Name: ${b.customerName || user?.name || 'Customer'}
Phone: ${b.customerPhone || user?.phone || 'N/A'}
Address: ${b.address}, ${b.area}, ${b.city} - ${b.pincode}

TECHNICIAN & SERVICE:
Provider: ${b.providerName}
Category: ${b.serviceName}
Date & Slot: ${b.date} (${b.timeSlot})
Notes: ${b.problemDescription || 'Standard inspection'}

ITEMIZED CHARGES:
1. Base Inspection & Labor Fee: ₹${b.estimatedPrice}
2. Doorstep Safety & Platform:   ₹${b.platformFee}
3. Taxes (18% GST):              ₹${b.taxAmount}
-------------------------------------------
TOTAL AMOUNT:                    ₹${b.totalAmount}
Payment Mode:                    ${b.paymentMethod}
Payment Status:                  ${b.paymentStatus}
-------------------------------------------
SECURITY OTP: ${b.bookingCode.slice(-4) || '8294'}
30-Day Doorstep Re-work Guarantee
Helpline: +91 98290 11111 | support@sevaconnect.in
===========================================`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SevaConnecter-Receipt-${b.bookingCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Order slip downloaded successfully!', 'success');
  };

  const fetchCustomerBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPayments = async () => {
    if (!user) return;
    setLoadingPayments(true);
    try {
      const res = await fetch('/api/payments/my-payments', {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setMyPayments(data.payments || []);
      }
    } catch (err) {
      console.error('Failed to load my payments:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    fetchCustomerBookings();
    fetchMyPayments();
  }, [user]);

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking || !reviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          bookingId: reviewBooking.id,
          rating: ratingVal,
          reviewText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');

      showToast('Thank you! Your verified review has been submitted.', 'success');
      setReviewBooking(null);
      setReviewText('');
      fetchCustomerBookings();
    } catch (err: any) {
      showToast(err.message || 'Review failed', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Cancel Booking
  const handleConfirmCancel = async () => {
    if (!cancelBookingTarget) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${cancelBookingTarget.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          status: 'CANCELLED',
          cancellationReason: cancelReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel booking');

      showToast(`Booking #${cancelBookingTarget.bookingCode} cancelled.`, 'info');
      setCancelBookingTarget(null);
      if (selectedBooking?.id === cancelBookingTarget.id) {
        setSelectedBooking(data);
      }
      fetchCustomerBookings();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel', 'error');
    } finally {
      setCancelling(false);
    }
  };

  // Metrics
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(
    (b) =>
      b.status === 'PENDING' ||
      b.status === 'ACCEPTED' ||
      b.status === 'PROVIDER_ON_THE_WAY' ||
      b.status === 'IN_PROGRESS'
  );
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED');
  const totalSpent = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  // Filtered list
  let filtered = bookings;
  if (statusFilter === 'ACTIVE') {
    filtered = activeBookings;
  } else if (statusFilter === 'COMPLETED') {
    filtered = completedBookings;
  } else if (statusFilter === 'CANCELLED') {
    filtered = cancelledBookings;
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.bookingCode.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q) ||
        b.providerName.toLowerCase().includes(q)
    );
  }

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" /> Awaiting Partner
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-sky-400" /> Partner Confirmed
          </span>
        );
      case 'PROVIDER_ON_THE_WAY':
        return (
          <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 animate-pulse">
            <Truck className="w-3 h-3 text-cyan-400" /> On The Way
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
            <Wrench className="w-3 h-3 text-purple-400" /> Service In Progress
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#0df2a4]" /> Job Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
            <X className="w-3 h-3 text-rose-400" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#0df2a4] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0df2a4]" />
            CUSTOMER DASHBOARD
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
            My Bookings &amp; Service History
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Track technician dispatch, view past invoices, and manage your verified profile.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <NotificationsPopover
            onNavigateBooking={() => fetchCustomerBookings()}
            onNavigateDashboard={(dash) => onNavigate(dash)}
          />

          <button
            onClick={() => setViewProfileOpen(true)}
            className="px-4 py-2.5 bg-[#091723] hover:bg-[#0f273b] text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-teal-500/30 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <UserIcon className="w-4 h-4 text-[#0df2a4]" />
            <span>My Profile</span>
          </button>

          <button
            onClick={onOpenBooking}
            className="px-5 py-2.5 bg-[#0df2a4] hover:bg-[#0be097] text-slate-950 text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(13,242,164,0.3)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Book New Service</span>
          </button>
        </div>
      </div>

      {/* Customer VIP Profile Banner */}
      <div className="bg-gradient-to-r from-[#0c2433] via-[#091b26] to-[#0c2433] rounded-2xl border border-teal-500/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4 text-center sm:text-left w-full sm:w-auto">
          <div
            className="relative cursor-pointer group shrink-0 mx-auto sm:mx-0"
            onClick={() => setViewProfileOpen(true)}
            title="Click to view or change photo"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#0df2a4] shadow-[0_0_15px_rgba(13,242,164,0.3)] group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-[#0df2a4]/20 border border-[#0df2a4] flex items-center justify-center text-xl font-black text-[#0df2a4] group-hover:scale-105 transition-transform">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 bg-[#0df2a4] text-slate-950 rounded-full shadow-md">
              <Camera className="w-3 h-3" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                {user?.name || 'Customer'}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                VIP Member
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono truncate">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => setViewProfileOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold text-[#0df2a4] bg-[#07141e] hover:bg-[#0c2232] border border-teal-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>View Profile</span>
          </button>

          <button
            onClick={() => setViewProfileOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-[#0df2a4] hover:bg-[#00f5c4] shadow-[0_0_15px_rgba(13,242,164,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Add / Change Photo</span>
          </button>

          <button
            onClick={() => setEditProfileOpen(true)}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-[#07141e] hover:bg-[#0c2232] border border-teal-500/30 transition-all cursor-pointer"
            title="Edit Profile Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#091723]/90 p-4 sm:p-5 rounded-2xl border border-teal-500/20 shadow-lg backdrop-blur-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Orders
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
            {totalBookings}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Lifetime requests placed</span>
        </div>

        <div className="bg-[#091723]/90 p-4 sm:p-5 rounded-2xl border border-cyan-500/30 shadow-lg backdrop-blur-sm">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
            Active / Upcoming
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-cyan-300 font-display mt-1">
            {activeBookings.length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Technician assigned / en-route</span>
        </div>

        <div className="bg-[#091723]/90 p-4 sm:p-5 rounded-2xl border border-emerald-500/30 shadow-lg backdrop-blur-sm">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Completed
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#0df2a4] font-display mt-1">
            {completedBookings.length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Backed by 30-day warranty</span>
        </div>

        <div className="bg-[#091723]/90 p-4 sm:p-5 rounded-2xl border border-teal-500/30 shadow-lg backdrop-blur-sm">
          <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
            Total Amount Spent
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-teal-300 font-display mt-1">
            ₹{totalSpent}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Paid after doorstep service</span>
        </div>
      </div>

      {/* Primary Section Switcher: Bookings vs UPI Payments */}
      <div className="flex items-center gap-3 border-b border-teal-900/40 pb-3">
        <button
          onClick={() => setActiveNavTab('BOOKINGS')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeNavTab === 'BOOKINGS'
              ? 'bg-[#0df2a4] text-slate-950 shadow-[0_0_15px_rgba(13,242,164,0.3)]'
              : 'bg-[#091723] text-slate-300 hover:text-white border border-teal-900/50 hover:bg-[#0d2232]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Bookings ({bookings.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveNavTab('PAYMENTS');
            fetchMyPayments();
          }}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeNavTab === 'PAYMENTS'
              ? 'bg-[#0df2a4] text-slate-950 shadow-[0_0_15px_rgba(13,242,164,0.3)]'
              : 'bg-[#091723] text-slate-300 hover:text-white border border-teal-900/50 hover:bg-[#0d2232]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>My UPI Payments ({myPayments.length})</span>
        </button>
      </div>

      {activeNavTab === 'BOOKINGS' ? (
        <>
          {/* Filter Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-900/40 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#0df2a4] text-slate-950 font-bold shadow-[0_0_12px_rgba(13,242,164,0.3)]'
                : 'bg-[#091723] text-slate-300 hover:text-white border border-teal-900/50 hover:bg-[#0d2232]'
            }`}
          >
            All ({totalBookings})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'ACTIVE'
                ? 'bg-[#0df2a4] text-slate-950 font-bold shadow-[0_0_12px_rgba(13,242,164,0.3)]'
                : 'bg-[#091723] text-slate-300 hover:text-white border border-teal-900/50 hover:bg-[#0d2232]'
            }`}
          >
            Active & En-Route ({activeBookings.length})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'COMPLETED'
                ? 'bg-[#0df2a4] text-slate-950 font-bold shadow-[0_0_12px_rgba(13,242,164,0.3)]'
                : 'bg-[#091723] text-slate-300 hover:text-white border border-teal-900/50 hover:bg-[#0d2232]'
            }`}
          >
            Completed ({completedBookings.length})
          </button>
          <button
            onClick={() => setStatusFilter('CANCELLED')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'CANCELLED'
                ? 'bg-rose-500 text-white font-bold shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'bg-[#091723] text-slate-300 hover:text-white border border-teal-900/50 hover:bg-[#0d2232]'
            }`}
          >
            Cancelled ({cancelledBookings.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-teal-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking ID or service..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#091723] border border-teal-500/25 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0df2a4]"
          />
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-[#0df2a4] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading your service bookings...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#091723] rounded-2xl border border-teal-500/20 p-12 text-center max-w-md mx-auto space-y-3">
          <Calendar className="w-10 h-10 text-teal-500/40 mx-auto" />
          <h3 className="font-bold text-white text-sm">No bookings found in this view</h3>
          <p className="text-xs text-slate-400">
            You don&apos;t have any service orders matching the selected filter.
          </p>
          <button
            onClick={onOpenBooking}
            className="px-4 py-2 bg-[#0df2a4] hover:bg-[#0be097] text-slate-950 rounded-xl text-xs font-bold cursor-pointer transition-all"
          >
            Book a Verified Technician
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="bg-[#091723] rounded-2xl border border-teal-500/20 hover:border-teal-500/40 shadow-lg transition-all overflow-hidden"
            >
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Code, Service, Partner Info */}
                <div className="flex items-start gap-4">
                  <img
                    src={
                      booking.providerAvatar ||
                      'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={booking.providerName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-500/30 shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0df2a4] bg-[#0df2a4]/10 border border-[#0df2a4]/30 px-2.5 py-0.5 rounded-md">
                        #{booking.bookingCode}
                      </span>
                      {getStatusBadge(booking.status)}
                    </div>

                    <h3 className="font-bold text-white text-base mt-1.5">{booking.serviceName}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Partner: <strong className="text-white">{booking.providerName}</strong>
                      {booking.providerPhone && (
                        <span className="ml-2 text-teal-300 font-mono">({booking.providerPhone})</span>
                      )}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        <span className="text-slate-200">{booking.date}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span className="text-slate-200">{booking.timeSlot}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-400" />
                        <span className="text-slate-200">{booking.area}, {booking.city}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Price & Lifecycle Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-teal-900/40">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Total Bill
                    </span>
                    <p className="text-lg font-bold text-[#0df2a4] font-display">₹{booking.totalAmount}</p>
                    <div className="flex items-center gap-1.5 md:justify-end mt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">{booking.paymentMethod}</span>
                      {booking.paymentStatus === 'PAID' ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          PAID
                        </span>
                      ) : booking.paymentStatus === 'PENDING' ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          VERIFYING
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                          UNPAID
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {booking.paymentStatus !== 'PAID' && (
                      <button
                        onClick={() => setPayingBooking(booking)}
                        className="px-3 py-1.5 bg-[#00baf2] hover:bg-[#009bd0] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        title="Scan QR & Pay via UPI"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay with UPI</span>
                      </button>
                    )}

                    <button
                      onClick={() => setPrintingBooking(booking)}
                      className="px-2.5 py-1.5 bg-[#0d2232] hover:bg-[#133249] text-teal-300 text-xs font-semibold rounded-xl border border-teal-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Print Order Slip / Receipt"
                    >
                      <Printer className="w-3.5 h-3.5 text-teal-400" />
                      <span>Print Slip</span>
                    </button>

                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="px-3 py-1.5 bg-[#0df2a4] hover:bg-[#0be097] text-slate-950 text-xs font-bold rounded-xl shadow-[0_0_10px_rgba(13,242,164,0.2)] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Track Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* If completed and not reviewed yet */}
                    {booking.status === 'COMPLETED' && !booking.review && (
                      <button
                        onClick={() => {
                          setReviewBooking(booking);
                          setRatingVal(5);
                          setReviewText('');
                        }}
                        className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>Rate Partner</span>
                      </button>
                    )}

                    {/* If completed and reviewed */}
                    {booking.status === 'COMPLETED' && booking.review && (
                      <span className="text-xs text-amber-300 font-bold bg-amber-500/15 px-2 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1">
                        ★ {booking.review.rating} Rated
                      </span>
                    )}

                    {/* Cancel button if pending or accepted */}
                    {(booking.status === 'PENDING' || booking.status === 'ACCEPTED') && (
                      <button
                        onClick={() => setCancelBookingTarget(booking)}
                        className="px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl font-medium transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Problem excerpt */}
              {booking.problemDescription && (
                <div className="px-5 py-2.5 bg-[#061019] border-t border-teal-900/30 text-xs text-slate-300 flex items-center gap-2">
                  <span className="font-semibold text-teal-400 shrink-0">Issue Reported:</span>
                  <span className="truncate italic text-slate-300">&quot;{booking.problemDescription}&quot;</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
        </>
      ) : (
        /* MY PAYMENTS TAB */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#091723] p-5 rounded-2xl border border-teal-500/20">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0df2a4]" />
                UPI Payment History &amp; Verification Status
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Official merchant payments made to <strong className="text-white font-mono">ravikanhauli91@ptyes</strong>
              </p>
            </div>

            <button
              onClick={fetchMyPayments}
              disabled={loadingPayments}
              className="px-4 py-2 bg-[#061019] hover:bg-[#0c202d] text-teal-300 hover:text-white border border-teal-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPayments ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>

          {/* Quick Info Alert */}
          <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-sky-200">
            <AlertCircle className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-white">How UPI Verification Works:</p>
              <p className="text-slate-300 leading-relaxed">
                When you submit your 12-digit UPI UTR number, your payment status is set to <strong className="text-amber-300">PENDING VERIFICATION</strong>.
                Our accounts desk verifies incoming bank credits against this UTR. Once confirmed, your payment is marked as <strong className="text-emerald-300">VERIFIED / PAID</strong> and your booking status updates immediately.
              </p>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#091723] p-4 rounded-xl border border-teal-500/20">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Submitted</span>
              <p className="text-xl font-bold text-white font-mono mt-1">{myPayments.length}</p>
            </div>
            <div className="bg-[#091723] p-4 rounded-xl border border-emerald-500/30">
              <span className="text-[11px] text-emerald-400 font-semibold uppercase">Verified / Paid</span>
              <p className="text-xl font-bold text-emerald-300 font-mono mt-1">
                {myPayments.filter((p) => p.status === 'VERIFIED').length}
              </p>
            </div>
            <div className="bg-[#091723] p-4 rounded-xl border border-amber-500/30">
              <span className="text-[11px] text-amber-400 font-semibold uppercase">Pending Verification</span>
              <p className="text-xl font-bold text-amber-300 font-mono mt-1">
                {myPayments.filter((p) => p.status === 'PENDING').length}
              </p>
            </div>
            <div className="bg-[#091723] p-4 rounded-xl border border-rose-500/30">
              <span className="text-[11px] text-rose-400 font-semibold uppercase">Rejected</span>
              <p className="text-xl font-bold text-rose-300 font-mono mt-1">
                {myPayments.filter((p) => p.status === 'REJECTED').length}
              </p>
            </div>
          </div>

          {/* List of Payments */}
          {loadingPayments ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <div className="w-8 h-8 border-2 border-[#0df2a4] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading payment history...
            </div>
          ) : myPayments.length === 0 ? (
            <div className="bg-[#091723] rounded-2xl border border-teal-500/20 p-12 text-center max-w-md mx-auto space-y-3">
              <CreditCard className="w-10 h-10 text-teal-500/40 mx-auto" />
              <h3 className="font-bold text-white text-sm">No payment records found</h3>
              <p className="text-xs text-slate-400">
                You haven&apos;t submitted any UPI payments yet. To pay for an existing booking, switch to the &quot;My Bookings&quot; tab and tap &quot;Pay with UPI&quot;.
              </p>
              <button
                onClick={() => setActiveNavTab('BOOKINGS')}
                className="px-4 py-2 bg-[#0df2a4] hover:bg-[#0be097] text-slate-950 rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                View My Bookings
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myPayments.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#091723] rounded-2xl border border-teal-500/20 hover:border-teal-500/40 p-5 shadow-lg transition-all space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-900/40 pb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0df2a4] bg-[#0df2a4]/10 border border-[#0df2a4]/30 px-2 py-0.5 rounded">
                          PAY #{p.id.slice(0, 8)}
                        </span>
                        {p.bookingCode && (
                          <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                            Booking #{p.bookingCode}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {new Date(p.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{p.serviceName}</h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Amount</span>
                        <p className="text-lg font-bold text-[#0df2a4] font-display">₹{p.amount}</p>
                      </div>

                      <div>
                        {p.status === 'VERIFIED' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            VERIFIED / PAID
                          </span>
                        )}
                        {p.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs animate-pulse">
                            <Clock className="w-4 h-4 text-amber-400" />
                            PENDING VERIFICATION
                          </span>
                        )}
                        {p.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold text-xs">
                            <XCircle className="w-4 h-4 text-rose-400" />
                            REJECTED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#061019] p-3.5 rounded-xl border border-teal-900/40 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">UPI ID Credited</span>
                      <span className="font-mono text-white font-bold">{p.upiId}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Submitted UTR / Ref No.</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[#0df2a4] font-bold tracking-wider">{p.utrNumber}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(p.utrNumber);
                            showToast('UTR copied to clipboard', 'info');
                          }}
                          className="p-1 hover:bg-teal-500/20 text-slate-400 hover:text-teal-300 rounded transition-colors cursor-pointer"
                          title="Copy UTR"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payment Mode</span>
                      <span className="text-slate-200">{p.paymentMethod}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Verification Desk</span>
                      <span className="text-slate-200">
                        {p.status === 'VERIFIED'
                          ? `Verified by ${p.verifiedByAdminName || 'Super Admin'}`
                          : p.status === 'REJECTED'
                          ? 'Rejected by Accounts Desk'
                          : 'Awaiting Bank Audit'}
                      </span>
                    </div>
                  </div>

                  {/* Remarks & Rejection Reason */}
                  {p.status === 'VERIFIED' && p.adminRemarks && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Admin Note:</strong> {p.adminRemarks}</span>
                    </div>
                  )}

                  {p.status === 'REJECTED' && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-200 space-y-1">
                      <div className="flex items-center gap-2 font-bold text-rose-300">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Rejection Reason: {p.rejectionReason || 'Transaction not found in merchant bank records'}</span>
                      </div>
                      {p.adminRemarks && (
                        <p className="text-rose-300/80 text-[11px] pl-6">
                          <strong>Admin remarks:</strong> {p.adminRemarks}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 pl-6 pt-1">
                        Please check your UPI app statement for the correct 12-digit UTR number or retry the transaction.
                      </p>
                    </div>
                  )}

                  {/* If Screenshot Attached */}
                  {p.screenshotUrl && (
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-xs text-slate-400">Attached Receipt:</span>
                      <a
                        href={p.screenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#0df2a4] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Payment Screenshot</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ORDER TRACKING & LIFECYCLE TIMELINE */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#091723] w-full max-w-xl rounded-2xl shadow-2xl border border-teal-500/30 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-teal-900/40 bg-[#061019]">
              <div>
                <span className="text-xs font-mono font-bold text-[#0df2a4]">
                  #{selectedBooking.bookingCode}
                </span>
                <h3 className="text-base font-bold text-white font-display">
                  Live Service Tracking & Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Partner Card */}
              <div className="p-4 bg-[#0d2232] rounded-2xl border border-teal-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedBooking.providerAvatar}
                    alt={selectedBooking.providerName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-teal-500/30"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{selectedBooking.providerName}</h4>
                    <p className="text-xs text-[#0df2a4] font-medium">{selectedBooking.serviceName}</p>
                    <p className="text-[11px] text-slate-300 font-mono">{selectedBooking.providerPhone}</p>
                  </div>
                </div>
                {getStatusBadge(selectedBooking.status)}
              </div>

              {/* Status Timeline History */}
              <div>
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-3">
                  Service Lifecycle History
                </h4>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-900/50">
                  {selectedBooking.statusHistory?.map((stepItem, idx) => (
                    <div key={stepItem.id || idx} className="relative">
                      <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#091723] border-2 border-[#0df2a4] flex items-center justify-center" />
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white capitalize">
                            {stepItem.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(stepItem.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            ,{' '}
                            {new Date(stepItem.timestamp).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{stepItem.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address & Booking Info */}
              <div className="p-4 bg-[#061019] rounded-2xl border border-teal-900/40 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Service Address:</span>
                  <span className="font-medium text-white text-right">
                    {selectedBooking.address}, {selectedBooking.area}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled Time:</span>
                  <span className="font-medium text-white">
                    {selectedBooking.date} • {selectedBooking.timeSlot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status:</span>
                  <span className="font-bold text-[#0df2a4] capitalize">
                    {selectedBooking.paymentStatus} ({selectedBooking.paymentMethod})
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-teal-900/40 text-sm font-bold text-white">
                  <span>Total Bill:</span>
                  <span className="text-[#0df2a4]">₹{selectedBooking.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-teal-900/40 bg-[#061019] flex items-center justify-between">
              <button
                onClick={() => {
                  setPrintingBooking(selectedBooking);
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 bg-[#0d2232] hover:bg-[#133249] text-teal-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-teal-500/30 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Slip</span>
              </button>
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 bg-[#0df2a4] text-slate-950 rounded-xl text-xs font-bold hover:bg-[#0be097] cursor-pointer transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RATE & REVIEW */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#091723] w-full max-w-md rounded-2xl shadow-2xl border border-teal-500/30 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-teal-900/40 bg-[#061019] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Rate Your Experience</h3>
                <p className="text-xs text-slate-400">Service: {reviewBooking.serviceName}</p>
              </div>
              <button
                onClick={() => setReviewBooking(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
              <div className="text-center">
                <span className="text-xs text-slate-300 block mb-2">How would you rate the technician?</span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingVal(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= ratingVal
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-400 mt-1 block">
                  {ratingVal === 5 && 'Excellent (5 Stars)'}
                  {ratingVal === 4 && 'Very Good (4 Stars)'}
                  {ratingVal === 3 && 'Average (3 Stars)'}
                  {ratingVal === 2 && 'Poor (2 Stars)'}
                  {ratingVal === 1 && 'Terrible (1 Star)'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Write Your Review
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details about on-time arrival, tool cleanliness, pricing transparency..."
                  className="w-full p-3 bg-[#061019] text-white placeholder:text-slate-500 border border-teal-900/50 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0df2a4]/40"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 bg-[#0df2a4] hover:bg-[#0be097] text-slate-950 text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(13,242,164,0.3)] cursor-pointer transition-all"
              >
                {submittingReview ? 'Submitting...' : 'Post Verified Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CANCEL BOOKING CONFIRMATION */}
      {cancelBookingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#091723] w-full max-w-sm rounded-2xl shadow-2xl border border-rose-500/30 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-white text-base">Cancel Service Booking?</h3>
              <p className="text-xs text-slate-300 mt-1">
                Are you sure you want to cancel booking #{cancelBookingTarget.bookingCode}?
              </p>
            </div>

            <div className="text-left text-xs">
              <label className="block text-slate-300 font-semibold mb-1">Reason for cancellation:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-[#061019] text-white border border-teal-900/50 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0df2a4]"
              >
                <option value="Change of plans / Issue resolved">Issue resolved on my own</option>
                <option value="Need to reschedule to another date">Need to reschedule</option>
                <option value="Found an alternate provider">Booked someone else</option>
                <option value="Accidental booking">Accidental booking</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCancelBookingTarget(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-[#0d2232] hover:bg-[#133249] border border-teal-500/20 cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PRINTABLE OFFICIAL ORDER RECEIPT */}
      {printingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header with actions */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm">Official Booking Receipt</h3>
                  <p className="text-[11px] text-slate-400">Order #{printingBooking.bookingCode}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSlip(printingBooking)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                  title="Download receipt text file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopySlip(printingBooking)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                  title="Copy slip details"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintingBooking(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Paper Slip */}
            <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto printable-order-slip bg-white text-slate-900">
              {/* Slip Header */}
              <div className="border-b-2 border-dashed border-slate-300 pb-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                      SC
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-950 tracking-tight">SEVA CONNECTER</h2>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        Doorstep Multi-Service Platform
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2">
                    Helpline: +91 98290 11111 • support@sevaconnect.in
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-bold uppercase tracking-wider mb-1">
                    Confirmed Order
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-900">
                    ID: #{printingBooking.bookingCode}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Booked: {new Date(printingBooking.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Service & Technician summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Technician Assigned
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{printingBooking.providerName}</p>
                  <p className="text-slate-600">{printingBooking.serviceName}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Phone: {printingBooking.providerPhone}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Scheduled Appointment
                  </span>
                  <p className="font-bold text-indigo-700 text-sm">
                    {printingBooking.date} • {printingBooking.timeSlot}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-700">Security OTP:</span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 font-mono font-extrabold text-xs rounded border border-indigo-200">
                      {printingBooking.bookingCode.slice(-4) || '8294'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    (Share only after technician finishes work)
                  </p>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="mb-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                  Customer & Doorstep Location
                </span>
                <p className="font-bold text-slate-900">
                  {printingBooking.customerName || user?.name || 'Customer'}
                  {printingBooking.customerPhone ? ` • ${printingBooking.customerPhone}` : ''}
                </p>
                <p className="text-slate-700 mt-0.5">
                  {printingBooking.address}, {printingBooking.area}, {printingBooking.city} - {printingBooking.pincode}
                </p>
                {printingBooking.problemDescription && (
                  <p className="text-[11px] text-slate-600 mt-1 italic">
                    Notes: "{printingBooking.problemDescription}"
                  </p>
                )}
              </div>

              {/* Itemized Billing Table */}
              <div className="mb-5">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2.5 text-slate-800">
                        <span className="font-semibold block">{printingBooking.serviceName}</span>
                        <span className="text-[10px] text-slate-500">
                          Standard Doorstep Inspection & Initial Labor
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-semibold text-slate-900">
                        ₹{printingBooking.estimatedPrice}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-600">
                        Doorstep Safety & Quality Assurance Fee
                      </td>
                      <td className="py-2 text-right font-medium text-slate-700">
                        ₹{printingBooking.platformFee}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-600">
                        Applicable Taxes (18% GST)
                      </td>
                      <td className="py-2 text-right font-medium text-slate-700">
                        ₹{printingBooking.taxAmount}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900">
                      <th className="py-3 text-sm font-bold text-slate-950">
                        Grand Total Payable
                        <span className="block text-[10px] font-normal text-slate-500">
                          Mode: {printingBooking.paymentMethod} • Status: {printingBooking.paymentStatus}
                        </span>
                      </th>
                      <th className="py-3 text-right text-base font-black text-indigo-700">
                        ₹{printingBooking.totalAmount}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Guarantee Footer */}
              <div className="pt-4 border-t border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-700">
                    Seva Connecter 30-Day Service Re-work Guarantee
                  </span>
                </div>
                <div className="text-slate-400 font-mono text-[10px]">
                  Authorized Computer-Generated Invoice
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
              <span className="text-xs text-slate-500">
                Print on paper or save as PDF for your home records.
              </span>
              <button
                type="button"
                onClick={() => setPrintingBooking(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile View Modal */}
      <ViewProfileModal
        isOpen={viewProfileOpen}
        onClose={() => setViewProfileOpen(false)}
        onOpenEdit={() => {
          setViewProfileOpen(false);
          setEditProfileOpen(true);
        }}
        user={user}
      />

      {/* Customer Profile Edit Modal */}
      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        onSuccess={() => {
          setEditProfileOpen(false);
          setViewProfileOpen(true);
        }}
        user={user}
      />

      {/* Customer UPI Payment Modal */}
      {payingBooking && (
        <UpiPaymentModal
          isOpen={!!payingBooking}
          booking={payingBooking}
          onClose={() => setPayingBooking(null)}
          onPaymentSubmitted={() => {
            fetchCustomerBookings();
            fetchMyPayments();
          }}
        />
      )}
    </div>
  );
}
