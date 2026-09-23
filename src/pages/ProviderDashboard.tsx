import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import type { Booking, ProviderProfile, BookingStatus } from '../types.ts';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  IndianRupee,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Truck,
  Wrench,
  X,
  Phone,
  Settings,
  Calendar,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { NotificationsPopover } from '../components/NotificationsPopover.tsx';

export function ProviderDashboard() {
  const { user, authHeaders } = useAuth();
  const { showToast } = useToast();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Status Note modal
  const [statusModalTarget, setStatusModalTarget] = useState<{
    booking: Booking;
    targetStatus: BookingStatus;
  } | null>(null);
  const [statusNote, setStatusNote] = useState('');

  // Profile Edit modal
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editPrice, setEditPrice] = useState(299);
  const [editAreas, setEditAreas] = useState('');
  const [editHours, setEditHours] = useState('');

  const fetchDashboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/provider/dashboard', {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
        if (data.profile) {
          setEditBio(data.profile.bio || '');
          setEditPrice(data.profile.pricingStartingAt || 299);
          setEditAreas(data.profile.serviceAreas?.join(', ') || '');
          setEditHours(data.profile.workingHours || '09:00 AM - 08:00 PM');
        }
      }
    } catch (err) {
      console.error('Failed to load provider dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  // Toggle Online/Offline
  const handleToggleAvailability = async () => {
    if (!dashboardData?.profile) return;
    const current = dashboardData.profile.availabilityStatus;
    const nextStatus = current === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE';

    try {
      const res = await fetch('/api/providers/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        showToast(
          nextStatus === 'AVAILABLE' ? 'You are now Online & Available for jobs' : 'You are now Offline',
          'info'
        );
        fetchDashboard();
      }
    } catch {
      showToast('Failed to change availability status', 'error');
    }
  };

  // Perform Status Transition
  const handleApplyStatusChange = async () => {
    if (!statusModalTarget) return;

    setUpdatingStatus(statusModalTarget.booking.id);
    try {
      const res = await fetch(`/api/bookings/${statusModalTarget.booking.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          status: statusModalTarget.targetStatus,
          note: statusNote || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status update failed');

      showToast(`Order #${statusModalTarget.booking.bookingCode} updated to ${statusModalTarget.targetStatus}`, 'success');
      setStatusModalTarget(null);
      setStatusNote('');
      fetchDashboard();
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Save profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const areaList = editAreas.split(',').map((a) => a.trim()).filter(Boolean);
      const res = await fetch('/api/providers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          bio: editBio,
          pricingStartingAt: Number(editPrice),
          serviceAreas: areaList,
          workingHours: editHours,
        }),
      });

      if (res.ok) {
        showToast('Partner profile updated successfully', 'success');
        setEditProfileOpen(false);
        fetchDashboard();
      }
    } catch {
      showToast('Failed to save profile', 'error');
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading Partner Portal...
      </div>
    );
  }

  const { profile, pendingRequests, activeJobs, completedJobs } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Verification Status Banner */}
      {profile.verificationStatus === 'PENDING' && (
        <div className="p-4 bg-amber-500/15 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-white">Account Verification In Progress</h4>
              <p className="text-amber-300/90 mt-0.5">
                Our operations team is currently validating your trade certifications and government ID. You will be able to receive incoming customer orders once approved by Admin.
              </p>
            </div>
          </div>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full font-bold uppercase text-[10px] self-start sm:self-auto shrink-0">
            Pending Review
          </span>
        </div>
      )}

      {profile.verificationStatus === 'APPROVED' && (
        <div className="p-4 bg-emerald-500/15 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-200 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#0df2a4] shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-white">Verified Partner Status Active</h4>
              <p className="text-emerald-300/90 mt-0.5">
                Your profile is live on SevaConnect marketplace for customers in {profile.serviceAreas?.join(', ')}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={handleToggleAvailability}
              className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                profile.availabilityStatus === 'AVAILABLE'
                  ? 'bg-[#0df2a4] text-slate-950 shadow-[0_0_12px_rgba(13,242,164,0.3)]'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${profile.availabilityStatus === 'AVAILABLE' ? 'bg-slate-950 animate-ping' : 'bg-slate-500'}`} />
              <span>{profile.availabilityStatus === 'AVAILABLE' ? 'Online & Ready' : 'Offline / Busy'}</span>
            </button>
            <button
              onClick={() => setEditProfileOpen(true)}
              className="p-2 bg-[#0d2232] border border-teal-500/30 hover:bg-[#133249] rounded-xl text-teal-300 transition-colors cursor-pointer"
              title="Edit Profile Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-[#091723]/90 rounded-2xl border border-teal-500/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <img
            src={
              profile.user?.avatarUrl ||
              'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
            }
            alt={profile.user?.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-teal-500/30 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold font-display text-white">
                {profile.user?.name}
              </h1>
              <span className="text-[10px] font-bold bg-[#0df2a4]/10 text-[#0df2a4] border border-[#0df2a4]/30 px-2 py-0.5 rounded">
                {profile.serviceCategory}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Contact: <span className="font-mono text-teal-300">{profile.user?.phone}</span> • {profile.user?.email}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {profile.rating} ({profile.reviewCount} customer reviews)
              </span>
              <span>•</span>
              <span className="text-slate-200">{profile.completedJobsCount} Jobs Completed</span>
              <span>•</span>
              <span className="text-teal-300 font-semibold">Base Rate: ₹{profile.pricingStartingAt}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <NotificationsPopover
            onNavigateDashboard={() => fetchDashboard()}
          />
          <button
            onClick={() => setEditProfileOpen(true)}
            className="px-4 py-2 bg-[#0d2232] border border-teal-500/30 hover:bg-[#133249] rounded-xl text-xs font-semibold text-teal-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Profile & Rates</span>
          </button>
        </div>
      </div>

      {/* 4 Revenue & Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#091723]/90 p-5 rounded-2xl border border-teal-500/20 shadow-lg backdrop-blur-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Gross Bookings
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
            ₹{dashboardData.grossBookingAmount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Total service value generated</span>
        </div>

        <div className="bg-[#091723]/90 p-5 rounded-2xl border border-rose-500/30 shadow-lg backdrop-blur-sm">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
            Platform Fee (10%)
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-rose-400 font-display mt-1">
            ₹{dashboardData.platformCommissionDeducted}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Transparent 10% platform share</span>
        </div>

        <div className="bg-[#091723]/90 p-5 rounded-2xl border border-emerald-500/30 shadow-lg backdrop-blur-sm">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Net Partner Take-Home
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#0df2a4] font-display mt-1">
            ₹{dashboardData.netEarnings}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Direct technician earnings</span>
        </div>

        <div className="bg-[#091723]/90 p-5 rounded-2xl border border-teal-500/30 shadow-lg backdrop-blur-sm">
          <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
            Unique Customers
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-teal-300 font-display mt-1">
            {dashboardData.uniqueCustomers}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Repeat clientele in Patna District</span>
        </div>
      </div>

      {/* SECTION 1: PENDING JOB REQUESTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span>New Booking Requests</span>
            {pendingRequests.length > 0 && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingRequests.length} pending
              </span>
            )}
          </h2>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="bg-[#091723] rounded-2xl border border-teal-500/20 p-8 text-center text-xs text-slate-400">
            No incoming pending requests at the moment. Keep your status Online to receive orders.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((b: Booking) => (
              <div
                key={b.id}
                className="bg-[#091723] rounded-2xl border border-amber-500/30 p-5 shadow-lg flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#0df2a4] bg-[#0df2a4]/10 border border-[#0df2a4]/30 px-2 py-0.5 rounded">
                      #{b.bookingCode}
                    </span>
                    <span className="font-bold text-[#0df2a4] text-sm">₹{b.totalAmount}</span>
                  </div>

                  <h3 className="font-bold text-white text-base mt-2">{b.serviceName}</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Customer: <strong className="text-white">{b.customerName}</strong> ({b.customerPhone})
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Slot: <strong className="text-slate-200">{b.date} • {b.timeSlot}</strong>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Address: <span className="text-slate-200">{b.address}, {b.area}</span>
                  </p>

                  {b.problemDescription && (
                    <div className="mt-3 p-2.5 bg-[#061019] rounded-xl text-xs text-slate-300 italic border border-teal-900/40">
                      &quot;{b.problemDescription}&quot;
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-teal-900/40">
                  <button
                    onClick={() =>
                      setStatusModalTarget({
                        booking: b,
                        targetStatus: 'ACCEPTED',
                      })
                    }
                    className="flex-1 py-2 bg-[#0df2a4] hover:bg-[#0be097] text-slate-950 rounded-xl text-xs font-bold shadow-[0_0_12px_rgba(13,242,164,0.3)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept Job</span>
                  </button>

                  <button
                    onClick={() =>
                      setStatusModalTarget({
                        booking: b,
                        targetStatus: 'CANCELLED',
                      })
                    }
                    className="py-2 px-3 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: ACTIVE JOBS (DISPATCH & WORK LIFECYCLE) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <span>Active & En-Route Jobs</span>
          {activeJobs.length > 0 && (
            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold px-2 py-0.5 rounded-full">
              {activeJobs.length} in progress
            </span>
          )}
        </h2>

        {activeJobs.length === 0 ? (
          <div className="bg-[#091723] rounded-2xl border border-teal-500/20 p-8 text-center text-xs text-slate-400">
            No active jobs in execution right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeJobs.map((b: Booking) => (
              <div
                key={b.id}
                className="bg-[#091723] rounded-2xl border border-teal-500/30 p-5 shadow-lg flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#0df2a4] bg-[#0df2a4]/10 border border-[#0df2a4]/30 px-2 py-0.5 rounded">
                      #{b.bookingCode}
                    </span>
                    <span className="text-xs font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-full capitalize">
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base mt-2">{b.serviceName}</h3>
                  <div className="text-xs text-slate-300 space-y-0.5 mt-1">
                    <p>
                      Client: <strong className="text-white">{b.customerName}</strong> ({b.customerPhone})
                    </p>
                    <p>
                      Location: <strong className="text-white">{b.address}, {b.area}</strong>
                    </p>
                    <p>
                      Scheduled: <strong className="text-teal-300">{b.date} • {b.timeSlot}</strong>
                    </p>
                  </div>

                  {b.problemDescription && (
                    <div className="mt-3 p-2.5 bg-[#061019] rounded-xl text-xs text-slate-300 italic border border-teal-900/40">
                      &quot;{b.problemDescription}&quot;
                    </div>
                  )}
                </div>

                {/* Progressive Lifecycle State Buttons */}
                <div className="pt-3 border-t border-teal-900/40 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {b.status === 'ACCEPTED' && (
                      <button
                        onClick={() =>
                          setStatusModalTarget({
                            booking: b,
                            targetStatus: 'PROVIDER_ON_THE_WAY',
                          })
                        }
                        className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>I Am On The Way</span>
                      </button>
                    )}

                    {b.status === 'PROVIDER_ON_THE_WAY' && (
                      <button
                        onClick={() =>
                          setStatusModalTarget({
                            booking: b,
                            targetStatus: 'IN_PROGRESS',
                          })
                        }
                        className="flex-1 py-2 bg-[#0df2a4] hover:bg-[#0be097] text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Reached & Start Job</span>
                      </button>
                    )}

                    {b.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() =>
                          setStatusModalTarget({
                            booking: b,
                            targetStatus: 'COMPLETED',
                          })
                        }
                        className="flex-1 py-2 bg-[#0df2a4] hover:bg-[#0be097] text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(13,242,164,0.3)] cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Job Completed & Collect Payment</span>
                      </button>
                    )}

                    <button
                      onClick={() =>
                        setStatusModalTarget({
                          booking: b,
                          targetStatus: 'CANCELLED',
                        })
                      }
                      className="py-2 px-3 text-rose-400 hover:bg-rose-500/15 border border-rose-500/20 rounded-xl text-xs font-medium cursor-pointer"
                    >
                      Cancel Job
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: RECENT COMPLETED JOBS & REVIEWS */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-display">
          Recent Completed Orders & Customer Ratings
        </h2>

        {completedJobs.length === 0 ? (
          <div className="bg-[#091723] rounded-2xl border border-teal-500/20 p-8 text-center text-xs text-slate-400">
            No completed jobs logged yet.
          </div>
        ) : (
          <div className="space-y-3">
            {completedJobs.map((b: Booking) => (
              <div
                key={b.id}
                className="bg-[#091723] rounded-2xl border border-teal-500/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0df2a4] bg-[#0df2a4]/10 border border-[#0df2a4]/30 px-2 py-0.5 rounded">
                      #{b.bookingCode}
                    </span>
                    <span className="font-bold text-white text-sm">{b.serviceName}</span>
                    <span className="text-emerald-300 font-semibold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Completed
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1">
                    Customer: {b.customerName} • {b.date} • ₹{b.estimatedPrice} (+₹{b.platformCommission} commission)
                  </p>
                  {b.review && (
                    <div className="mt-2 p-2.5 bg-[#061019] border border-amber-500/30 rounded-xl flex items-start gap-2 text-slate-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-amber-400">{b.review.rating}★ Rating: </span>
                        <span className="italic text-slate-300">&quot;{b.review.reviewText}&quot;</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">Net Payout</span>
                  <span className="text-base font-bold text-[#0df2a4] font-display">
                    ₹{b.providerEarnings}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: UPDATE STATUS CONFIRMATION WITH NOTE */}
      {statusModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#091723] w-full max-w-md rounded-2xl shadow-2xl border border-teal-500/30 p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-teal-900/40">
              <h3 className="font-bold text-white text-sm">
                Confirm Status: {statusModalTarget.targetStatus.replace(/_/g, ' ')}
              </h3>
              <button
                onClick={() => setStatusModalTarget(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Updating Order #{statusModalTarget.booking.bookingCode} for customer{' '}
              <strong className="text-white">{statusModalTarget.booking.customerName}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Optional Status Update Note for Customer:
              </label>
              <textarea
                rows={2}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g. Dispatched with spare capacitor, reached locality..."
                className="w-full p-2.5 bg-[#061019] border border-teal-900/50 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#0df2a4]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStatusModalTarget(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-[#0d2232] hover:bg-[#133249] border border-teal-500/20 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyStatusChange}
                disabled={Boolean(updatingStatus)}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-[#0df2a4] hover:bg-[#0be097] text-slate-950 shadow-[0_0_12px_rgba(13,242,164,0.3)] cursor-pointer"
              >
                {updatingStatus ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PARTNER PROFILE & RATES */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#091723] w-full max-w-lg rounded-2xl shadow-2xl border border-teal-500/30 p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-teal-900/40">
              <h3 className="font-bold text-white text-base font-display">
                Edit Partner Profile & Coverage
              </h3>
              <button
                onClick={() => setEditProfileOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Starting Fee / Inspection Charge (₹)
                </label>
                <input
                  type="number"
                  min={99}
                  step={50}
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#061019] border border-teal-900/50 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#0df2a4]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Service Localities (comma separated)
                </label>
                <input
                  type="text"
                  value={editAreas}
                  onChange={(e) => setEditAreas(e.target.value)}
                  placeholder="Mansarovar, Malviya Nagar, Vaishali Nagar"
                  className="w-full p-2.5 bg-[#061019] border border-teal-900/50 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#0df2a4]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Working Hours</label>
                <input
                  type="text"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  placeholder="08:30 AM - 08:00 PM"
                  className="w-full p-2.5 bg-[#061019] border border-teal-900/50 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#0df2a4]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Professional Bio & Trade Experience
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full p-2.5 bg-[#061019] border border-teal-900/50 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#0df2a4]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-[#0d2232] hover:bg-[#133249] border border-teal-500/20 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-[#0df2a4] hover:bg-[#0be097] text-slate-950 shadow-[0_0_12px_rgba(13,242,164,0.3)] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
