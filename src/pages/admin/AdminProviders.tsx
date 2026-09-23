import React, { useState } from 'react';
import { Search, Filter, CheckCircle2, XCircle, Eye, ShieldCheck, ShieldAlert } from 'lucide-react';

interface AdminProvidersProps {
  providers: any[];
  onVerifyProvider: (providerId: string, status: 'APPROVED' | 'REJECTED') => void;
}

export function AdminProviders({ providers, onVerifyProvider }: AdminProvidersProps) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredProviders = providers.filter(p => {
    if (filter !== 'ALL' && p.verificationStatus !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.user?.name?.toLowerCase().includes(q) ||
        p.serviceCategory?.toLowerCase().includes(q) ||
        p.user?.phone?.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Service Providers</h2>
          <p className="text-sm text-slate-400">Manage technicians, approvals, and performance.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search providers..."
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
              <option value="APPROVED">Verified</option>
              <option value="PENDING">Pending Approval</option>
              <option value="REJECTED">Suspended/Rejected</option>
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
                <th className="px-6 py-4 font-semibold">Provider</th>
                <th className="px-6 py-4 font-semibold">Category & Exp.</th>
                <th className="px-6 py-4 font-semibold">Performance</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-900/20">
              {filteredProviders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No service providers found.
                  </td>
                </tr>
              ) : (
                filteredProviders.map((p) => (
                  <tr key={p.userId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={p.user?.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'} 
                          alt={p.user?.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/20"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {p.user?.name}
                            {p.verificationStatus === 'APPROVED' && <ShieldCheck className="w-3.5 h-3.5 text-[#0df2a4]" />}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">{p.user?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#0df2a4]">{p.serviceCategory}</div>
                      <div className="text-xs text-slate-500">{p.experienceYears} Years Exp.</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-amber-400 flex items-center gap-1">
                        ★ {p.rating} <span className="text-slate-500 font-normal text-xs">({p.reviewCount})</span>
                      </div>
                      <div className="text-xs text-slate-500">{p.completedJobsCount} Jobs Completed</div>
                    </td>
                    <td className="px-6 py-4">
                      {p.verificationStatus === 'APPROVED' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-max">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : p.verificationStatus === 'PENDING' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 w-max">
                          <ShieldAlert className="w-3.5 h-3.5" /> Pending
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 w-max">
                          <XCircle className="w-3.5 h-3.5" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.verificationStatus !== 'APPROVED' && (
                          <button 
                            onClick={() => onVerifyProvider(p.userId, 'APPROVED')}
                            className="px-3 py-1.5 bg-[#0df2a4]/10 hover:bg-[#0df2a4]/20 text-[#0df2a4] font-semibold rounded-lg text-xs transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {p.verificationStatus === 'APPROVED' && (
                          <button 
                            onClick={() => onVerifyProvider(p.userId, 'REJECTED')}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold rounded-lg text-xs transition-colors"
                          >
                            Suspend
                          </button>
                        )}
                        <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
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
