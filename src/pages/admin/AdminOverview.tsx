import React from 'react';
import { 
  Users, 
  Briefcase, 
  Wrench, 
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import type { Booking } from '../../types.ts';

interface AdminOverviewProps {
  analytics: any;
  bookings: Booking[];
}

export function AdminOverview({ analytics, bookings }: AdminOverviewProps) {
  return (
    <div className="space-y-6">
      
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard 
          title="Total Users" 
          value={analytics.totalUsersCount || 0} 
          icon={Users}
          color="text-blue-400"
          bg="bg-blue-400/10"
        />
        <KPICard 
          title="Service Providers" 
          value={analytics.activeProvidersCount || 0} 
          icon={Briefcase}
          color="text-amber-400"
          bg="bg-amber-400/10"
        />
        <KPICard 
          title="Total Bookings" 
          value={analytics.totalBookings || 0} 
          icon={CalendarDays}
          color="text-emerald-400"
          bg="bg-emerald-400/10"
        />
        <KPICard 
          title="Total Revenue" 
          value={`₹${analytics.totalGrossBookingValue || 0}`} 
          icon={TrendingUp}
          color="text-[#0df2a4]"
          bg="bg-[#0df2a4]/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Distribution */}
        <div className="bg-[#061017] border border-teal-900/40 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6">Booking Status Distribution</h2>
          <div className="space-y-4">
            {Object.entries(analytics.bookingsByStatus || {}).map(([status, count]: any) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300 capitalize">
                  {status.replace(/_/g, ' ')}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-white font-mono text-xs">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Required */}
        <div className="bg-[#061017] border border-teal-900/40 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6">Action Required</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-400">Pending Approvals</h4>
                <p className="text-xs text-slate-400 mt-1">
                  You have {analytics.pendingApprovalsCount || 0} service provider profiles waiting for verification.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <div className="p-2 bg-rose-500/20 rounded-lg shrink-0">
                <MessageSquareWarning className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-400">Open Complaints</h4>
                <p className="text-xs text-slate-400 mt-1">
                  There are 3 unresolved customer complaints requiring attention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function KPICard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-[#061017] border border-teal-900/40 rounded-2xl p-6 shadow-xl flex items-start gap-4 relative overflow-hidden group">
      <div className={`p-3 rounded-xl ${bg} shrink-0`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className={`text-2xl sm:text-3xl font-black font-mono mt-1 tracking-tight ${color}`}>
          {value}
        </p>
      </div>
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
    </div>
  );
}

function MessageSquareWarning(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M12 7v2" />
      <path d="M12 13h.01" />
    </svg>
  )
}
