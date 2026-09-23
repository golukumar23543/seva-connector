import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import type { NotificationItem, UserRole } from '../../types.ts';
import {
  Bell,
  Send,
  Trash2,
  CheckCircle,
  Megaphone,
  Tag,
  ShieldAlert,
  Users,
  Search,
  RotateCw,
  ExternalLink,
  Calendar,
  Sparkles,
  Clock,
  Radio
} from 'lucide-react';

export function AdminNotifications() {
  const { authHeaders } = useAuth();
  const { showToast } = useToast();
  const { fetchNotifications: refreshGlobalNotifications } = useNotifications();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ANNOUNCEMENT' | 'OFFER' | 'SYSTEM' | 'BOOKING_CREATED'>('ALL');

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<UserRole | 'ALL'>('ALL');
  const [notificationType, setNotificationType] = useState<NotificationItem['type']>('ANNOUNCEMENT');
  const [actionLink, setActionLink] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('HIGH');

  // Fetch all notifications for admin
  const loadAdminNotifications = async () => {
    setIsLoading(true);
    try {
      const headers = typeof authHeaders === 'function' ? authHeaders() : authHeaders || {};
      const res = await fetch('/api/admin/notifications', { headers });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to load admin notifications', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminNotifications();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Please enter both title and message for the broadcast notification', 'error');
      return;
    }

    setIsSending(true);
    try {
      const headers = typeof authHeaders === 'function' ? authHeaders() : authHeaders || {};
      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type: notificationType,
          role: targetAudience,
          link: actionLink.trim() || undefined,
          priority,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to broadcast notification');

      showToast('Notification successfully broadcasted to users!', 'success');
      setTitle('');
      setMessage('');
      setActionLink('');
      loadAdminNotifications();
      refreshGlobalNotifications();
    } catch (err: any) {
      showToast(err.message || 'Error broadcasting notification', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification from the system?')) return;
    try {
      const headers = typeof authHeaders === 'function' ? authHeaders() : authHeaders || {};
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        showToast('Notification removed successfully', 'success');
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        refreshGlobalNotifications();
      }
    } catch (err) {
      showToast('Failed to delete notification', 'error');
    }
  };

  const applyTemplate = (tmpl: { title: string; message: string; type: NotificationItem['type']; link?: string }) => {
    setTitle(tmpl.title);
    setMessage(tmpl.message);
    setNotificationType(tmpl.type);
    if (tmpl.link) setActionLink(tmpl.link);
  };

  // Quick Preset Templates
  const templates = [
    {
      title: '⚡ Flat ₹150 OFF Welcome Discount: SEVA150',
      message: 'Use promo code SEVA150 on your booking above ₹499. Instant doorstep discount applied at checkout!',
      type: 'OFFER' as const,
      link: '/#packages-section',
    },
    {
      title: '🎉 45-Minute Rapid Doorstep Dispatch Guarantee',
      message: 'Need urgent electrical, AC, plumbing or appliance repair? Our verified experts reach within 45 mins.',
      type: 'ANNOUNCEMENT' as const,
      link: '/#services-section',
    },
    {
      title: '🛡️ 100% Police & Biometric KYC Verified Technicians',
      message: 'All SevaConnect service technicians carry biometric photo ID cards and adhere to safety & hygiene protocols.',
      type: 'SYSTEM' as const,
    },
    {
      title: '💳 UPI QR & Cashless Payments Active',
      message: 'Pay instantly via PhonePe, Google Pay, Paytm or BHIM UPI directly on completion of doorstep repair.',
      type: 'ANNOUNCEMENT' as const,
    },
  ];

  // Filtered List
  const filteredList = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || n.type === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#091b29] via-[#0b2234] to-[#07131e] p-6 rounded-2xl border border-teal-500/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0df2a4] uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-[#0df2a4] animate-pulse" />
            <span>Real-Time Broadcast Console</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>System Notifications &amp; Alerts</span>
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Send real-time alerts, festival discounts, and service announcements. Notifications reach all active visitors and are automatically displayed to users whenever they log in.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-[#061017] border border-teal-500/30 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total In System</div>
            <div className="text-xl font-black text-[#0df2a4]">{notifications.length}</div>
          </div>
          <button
            onClick={loadAdminNotifications}
            className="p-2.5 rounded-xl bg-[#0a1721] hover:bg-[#112431] border border-teal-500/30 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Refresh list"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#0df2a4]' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Broadcast Composer Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#091824] rounded-2xl border border-teal-500/30 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-teal-900/40">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-[#0df2a4]" />
                <span>Broadcast New Notification</span>
              </h3>
              <span className="text-[10px] font-bold bg-[#0df2a4]/15 text-[#0df2a4] px-2 py-0.5 rounded-full border border-[#0df2a4]/30">
                Live Push
              </span>
            </div>

            {/* Quick Templates */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Quick Preset Templates</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {templates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyTemplate(tmpl)}
                    className="text-[10px] font-medium bg-[#061017] hover:bg-[#0c202e] border border-teal-500/20 hover:border-[#0df2a4]/40 text-slate-300 hover:text-white px-2 py-1 rounded-lg transition-all cursor-pointer"
                  >
                    {tmpl.title.slice(0, 24)}...
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3.5 text-xs">
              {/* Target Audience */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Target Audience
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ALL', label: '👥 All Users & Guests' },
                    { id: 'CUSTOMER', label: '👤 Customers Only' },
                    { id: 'PROVIDER', label: '🔧 Partners Only' },
                    { id: 'ADMIN', label: '🛡️ Admin Team' },
                  ].map((aud) => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setTargetAudience(aud.id as any)}
                      className={`p-2 rounded-xl text-left font-semibold border transition-all cursor-pointer ${
                        targetAudience === aud.id
                          ? 'bg-[#0df2a4]/15 text-[#0df2a4] border-[#0df2a4]/50'
                          : 'bg-[#06111a] text-slate-400 border-slate-700/50 hover:bg-[#0c1f2c]'
                      }`}
                    >
                      {aud.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Type & Priority */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Category Type
                  </label>
                  <select
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#06111a] border border-slate-700/70 text-white focus:border-[#0df2a4] outline-none"
                  >
                    <option value="ANNOUNCEMENT">📢 Announcement</option>
                    <option value="OFFER">⚡ Offer / Promo</option>
                    <option value="SYSTEM">🛡️ System / Security</option>
                    <option value="BOOKING_CREATED">🛠️ Service Update</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#06111a] border border-slate-700/70 text-white focus:border-[#0df2a4] outline-none"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High (Alert badge)</option>
                    <option value="URGENT">Urgent (Red)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Notification Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🎉 Flat ₹150 OFF Monsoon Discount"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#06111a] border border-slate-700/70 text-white focus:border-[#0df2a4] outline-none placeholder:text-slate-600"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Notification Message *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write clear, engaging message for your users..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#06111a] border border-slate-700/70 text-white focus:border-[#0df2a4] outline-none placeholder:text-slate-600 resize-none"
                />
              </div>

              {/* Action Link */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Action Link / Target URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. /#services-section or /customer/bookings"
                  value={actionLink}
                  onChange={(e) => setActionLink(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#06111a] border border-slate-700/70 text-white focus:border-[#0df2a4] outline-none placeholder:text-slate-600 font-mono text-[11px]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(13,242,164,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Broadcasting...' : 'Broadcast to All Users'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Notifications Table & History */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#091824] rounded-2xl border border-teal-500/30 p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-teal-900/40">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#0df2a4]" />
                  <span>Notification Logs &amp; Delivery Status</span>
                </h3>
                <p className="text-[11px] text-slate-400">All alerts stored in database and delivered to users on login</p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#06111a] border border-slate-700/60 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#0df2a4]"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto text-xs pb-1">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'ANNOUNCEMENT', label: '📢 Announcements' },
                { id: 'OFFER', label: '⚡ Offers' },
                { id: 'SYSTEM', label: '🛡️ System' },
                { id: 'BOOKING_CREATED', label: '🛠️ Bookings' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === f.id
                      ? 'bg-[#0df2a4] text-slate-950 font-bold'
                      : 'bg-[#06111a] text-slate-400 hover:text-white border border-slate-700/40'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1 divide-y divide-teal-900/20">
              {filteredList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  No notifications matching filter.
                </div>
              ) : (
                filteredList.map((n) => (
                  <div
                    key={n.id}
                    className="pt-2.5 first:pt-0 p-3 rounded-xl hover:bg-[#0c202e] border border-transparent hover:border-teal-500/20 transition-all group flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#06111a] border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        {n.type === 'OFFER' ? (
                          <Tag className="w-4 h-4 text-amber-400" />
                        ) : n.type === 'ANNOUNCEMENT' ? (
                          <Megaphone className="w-4 h-4 text-teal-400" />
                        ) : (
                          <Bell className="w-4 h-4 text-[#0df2a4]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-xs">{n.title}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded uppercase bg-teal-500/10 text-[#0df2a4] border border-teal-500/20">
                            {n.userId === 'ALL' ? 'BROADCAST (ALL)' : `User: ${n.userId.slice(0, 10)}`}
                          </span>
                          {n.role && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded uppercase bg-slate-800 text-slate-300">
                              {n.role}
                            </span>
                          )}
                        </div>

                        <p className="text-slate-300 text-xs mt-1 leading-relaxed">{n.message}</p>

                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-teal-400" />
                            <span>{new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </span>

                          {n.link && (
                            <span className="text-[#0df2a4] flex items-center gap-0.5 truncate max-w-[200px]">
                              <span>{n.link}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete action */}
                    <button
                      onClick={() => handleDelete(n.id)}
                      title="Delete from system"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
