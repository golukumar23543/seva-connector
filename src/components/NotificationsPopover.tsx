import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import type { NotificationItem } from '../types.ts';
import {
  Bell,
  Check,
  Clock,
  ExternalLink,
  Trash2,
  Tag,
  Zap,
  Calendar,
  Truck,
  ShieldCheck,
  Megaphone,
  LogIn,
  RotateCw,
  Info
} from 'lucide-react';

interface NotificationsPopoverProps {
  onNavigateBooking?: (bookingId?: string) => void;
  onNavigateDashboard?: (target: string) => void;
  onOpenAuthModal?: () => void;
  className?: string;
}

export function NotificationsPopover({
  onNavigateBooking,
  onNavigateDashboard,
  onOpenAuthModal,
  className = '',
}: NotificationsPopoverProps) {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'OFFERS' | 'ORDERS'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'UNREAD') return !n.isRead;
    if (activeFilter === 'OFFERS') return n.type === 'OFFER' || n.type === 'ANNOUNCEMENT';
    if (activeFilter === 'ORDERS') return n.type === 'BOOKING_CREATED' || n.type === 'STATUS_CHANGED';
    return true;
  });

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'OFFER':
        return <Tag className="w-4 h-4 text-amber-400" />;
      case 'BOOKING_CREATED':
        return <Calendar className="w-4 h-4 text-sky-400" />;
      case 'STATUS_CHANGED':
        return <Truck className="w-4 h-4 text-[#0df2a4]" />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-4 h-4 text-teal-400" />;
      case 'VERIFICATION':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'REVIEW':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      default:
        return <Bell className="w-4 h-4 text-teal-400" />;
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    if (!n.isRead) {
      markAsRead(n.id);
    }
    setIsOpen(false);

    if (n.link) {
      if (n.link.includes('booking') && onNavigateBooking) {
        onNavigateBooking();
      } else if (n.link.includes('provider') && onNavigateDashboard) {
        onNavigateDashboard('provider-dashboard');
      } else if (n.link.includes('admin') && onNavigateDashboard) {
        onNavigateDashboard('admin-dashboard');
      } else if (n.link.startsWith('/#')) {
        const elem = document.querySelector(n.link.replace('/', ''));
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      } else if (n.link.startsWith('#')) {
        const elem = document.querySelector(n.link);
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Sleek Notification Bell Button (Matches user screenshot: dark circular surface with crisp bell) */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        title="Notifications & Platform Alerts"
        aria-label="View notifications"
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-[#0a1721] border border-slate-700/70 hover:border-[#0df2a4]/70 hover:bg-[#102433] text-slate-300 hover:text-white transition-all shadow-md group cursor-pointer shrink-0"
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-300 group-hover:text-[#0df2a4] transition-colors" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-[#07131e] shadow-lg animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-[330px] sm:w-[410px] max-w-[92vw] bg-[#07141f]/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-teal-500/30 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-200">
          {/* Header */}
          <div className="p-3.5 border-b border-teal-900/40 bg-[#091b29]/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 text-[#0df2a4]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-xs sm:text-sm tracking-tight">Notifications</h4>
                  {unreadCount > 0 ? (
                    <span className="text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.2 rounded-full">
                      {unreadCount} Unread
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">All caught up</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchNotifications()}
                title="Refresh notifications"
                className={`p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors cursor-pointer ${
                  isLoading ? 'animate-spin text-[#0df2a4]' : ''
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-[11px] font-semibold text-[#0df2a4] hover:text-[#00f5c4] bg-[#0df2a4]/10 hover:bg-[#0df2a4]/20 border border-[#0df2a4]/30 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark read</span>
                </button>
              )}
            </div>
          </div>

          {/* Guest User Friendly Notice if not logged in */}
          {!user && (
            <div className="p-3 bg-gradient-to-r from-teal-950/60 via-slate-900/60 to-teal-950/60 border-b border-teal-500/20 flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#0df2a4]/15 border border-[#0df2a4]/40 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-3 h-3 text-[#0df2a4]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-300 leading-snug">
                  Viewing platform broadcasts &amp; offers. Log in to sync your personal bookings &amp; payment notifications!
                </p>
                {onOpenAuthModal && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAuthModal();
                    }}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-extrabold text-slate-950 bg-[#0df2a4] hover:bg-[#00f5c4] px-2.5 py-1 rounded-md transition-all shadow-sm cursor-pointer"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Login / Sign Up</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-2 bg-[#06111a] border-b border-teal-900/30 overflow-x-auto text-[11px]">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'ALL'
                  ? 'bg-teal-500/20 text-[#0df2a4] border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('UNREAD')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'UNREAD'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveFilter('OFFERS')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'OFFERS'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Offers &amp; News
            </button>
            {user && (
              <button
                onClick={() => setActiveFilter('ORDERS')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === 'ORDERS'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                My Bookings
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-84 overflow-y-auto divide-y divide-teal-900/20 scrollbar-thin scrollbar-thumb-teal-800">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-xs font-bold text-slate-300">No notifications found</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  {activeFilter === 'UNREAD'
                    ? 'You have read all current notifications.'
                    : 'All platform updates and booking alerts will appear here.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 text-xs transition-all relative group flex items-start gap-3 hover:bg-[#0c202e]/80 cursor-pointer ${
                    !n.isRead
                      ? 'bg-teal-950/30 border-l-2 border-[#0df2a4]'
                      : 'border-l-2 border-transparent opacity-85 hover:opacity-100'
                  }`}
                  onClick={() => handleNotificationClick(n)}
                >
                  {/* Icon Avatar */}
                  <div className="w-8 h-8 rounded-xl bg-[#091924] border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {getNotificationIcon(n.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-bold text-white text-xs truncate">
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#0df2a4] shrink-0 animate-ping" />
                      )}
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.8 h-2.8 text-teal-400" />
                        <span>{formatTimestamp(n.createdAt)}</span>
                      </span>

                      {n.type === 'OFFER' && (
                        <span className="text-amber-400 font-bold uppercase tracking-wider text-[9px] bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                          PROMO
                        </span>
                      )}
                      {(n.type === 'BOOKING_CREATED' || n.type === 'STATUS_CHANGED') && (
                        <span className="text-sky-400 font-bold uppercase tracking-wider text-[9px] bg-sky-400/10 px-1.5 py-0.2 rounded border border-sky-400/20">
                          ORDER
                        </span>
                      )}
                      {n.userId === 'ALL' && (
                        <span className="text-teal-400 font-bold uppercase tracking-wider text-[9px] bg-teal-400/10 px-1.5 py-0.2 rounded border border-teal-400/20">
                          BROADCAST
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions on hover */}
                  <div
                    className="absolute right-2 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        title="Mark as read"
                        className="p-1 rounded-md bg-teal-500/20 hover:bg-teal-500/40 text-[#0df2a4] transition-colors cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(n.id)}
                      title="Dismiss notification"
                      className="p-1 rounded-md bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2.5 border-t border-teal-900/40 bg-[#06111a] flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0df2a4] animate-pulse"></span>
              <span>Live System Alerts Active</span>
            </span>

            {user?.role === 'CUSTOMER' && onNavigateBooking && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateBooking();
                }}
                className="text-[#0df2a4] hover:underline font-bold flex items-center gap-1"
              >
                <span>My Bookings</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
