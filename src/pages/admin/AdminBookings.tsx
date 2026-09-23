import React, { useState } from 'react';
import { Search, Filter, Eye, MoreVertical } from 'lucide-react';
import type { Booking } from '../../types.ts';

interface AdminBookingsProps {
  bookings: Booking[];
}

export function AdminBookings({ bookings }: AdminBookingsProps) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredBookings = bookings.filter(b => {
    if (filter !== 'ALL' && b.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.bookingCode.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.providerName.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Booking Management</h2>
          <p className="text-sm text-slate-400">View and manage all service requests.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-[#061017] border border-teal-900/40 rounded-xl text-sm text-white focus:border-[#0df2a4] outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-[#061017] border border-teal-900/40 rounded-xl text-sm text-white focus:border-[#0df2a4] outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="PROVIDER_ON_THE_WAY">On The Way</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#061017] border border-teal-900/40 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0a1824] border-b border-teal-900/40 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Booking ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Service / Provider</th>
                <th className="px-6 py-4 font-semibold">Schedule</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-900/20">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No bookings found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-[#0df2a4]">#{b.bookingCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{b.customerName}</div>
                      <div className="text-xs text-slate-500 font-mono">{b.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{b.serviceName}</div>
                      <div className="text-xs text-slate-500">{b.providerName || 'Unassigned'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300 font-mono">{b.date}</div>
                      <div className="text-xs text-slate-500 font-mono">{b.timeSlot}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white font-mono">₹{b.totalAmount}</div>
                      <div className="text-xs text-slate-500">{b.paymentMethod === 'ONLINE' ? 'Paid Online' : 'Cash'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let colors = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  
  if (status === 'COMPLETED') colors = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  else if (status === 'PENDING') colors = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  else if (status === 'CANCELLED') colors = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  else if (status === 'ACCEPTED' || status === 'IN_PROGRESS' || status === 'PROVIDER_ON_THE_WAY') 
    colors = 'bg-blue-500/10 text-blue-400 border-blue-500/20';

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${colors}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
