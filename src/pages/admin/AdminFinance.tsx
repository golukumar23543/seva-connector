import React, { useState, useEffect } from 'react';
import { Search, Download, IndianRupee, ArrowUpRight, CheckCircle2, Clock, Eye, ShieldCheck, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { Booking } from '../../types.ts';

interface AdminFinanceProps {
  analytics: any;
  bookings: Booking[];
}

export function AdminFinance({ analytics, bookings }: AdminFinanceProps) {
  const { authHeaders } = useAuth();
  const [search, setSearch] = useState('');

  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  
  const [upiPayments, setUpiPayments] = useState<any[]>([]);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/payments', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUpiPayments(data);
        return;
      }
    } catch (err) {
      console.error('Error fetching payments in finance:', err);
    }
    const data = JSON.parse(localStorage.getItem('seva_upi_payments') || '[]');
    setUpiPayments(data);
  };

  useEffect(() => {
    fetchPayments();
  }, []);
  
  const updatePaymentStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/payments/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status: status === 'VERIFIED' ? 'PAID' : 'REJECTED' }),
      });
      if (res.ok) {
        fetchPayments();
        return;
      }
    } catch (err) {
      console.error('Error verifying payment in finance:', err);
    }

    const updated = upiPayments.map(p => p.id === id ? { ...p, status } : p);
    setUpiPayments(updated);
    localStorage.setItem('seva_upi_payments', JSON.stringify(updated));
  };
  
  const filteredLedger = completedBookings.filter(b => {
    if (search) {
      const q = search.toLowerCase();
      return (
        b.bookingCode.toLowerCase().includes(q) ||
        b.providerName.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Financial Ledger & Payouts</h2>
          <p className="text-sm text-slate-400">Track marketplace revenue, commissions, and provider payouts.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0a1824] border border-teal-900/40 hover:border-[#0df2a4]/50 text-white font-medium rounded-xl text-sm transition-colors">
            <Download className="w-4 h-4 text-[#0df2a4]" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#061017] to-[#0a1824] border border-teal-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <IndianRupee className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-400 mb-1">Gross Processed Value</p>
            <p className="text-3xl font-black font-mono text-white tracking-tight">₹{analytics.totalGrossBookingValue || 0}</p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14.5% vs last month</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#061017] to-[#0a1824] border border-[#0df2a4]/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(13,242,164,0.1)] relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-medium text-[#0df2a4] mb-1">Net Platform Revenue (10%)</p>
            <p className="text-3xl font-black font-mono text-[#0df2a4] tracking-tight">₹{analytics.totalCommissionEarned || 0}</p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+8.2% vs last month</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#061017] to-[#0a1824] border border-teal-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-400 mb-1">Partner Payouts (90%)</p>
            <p className="text-3xl font-black font-mono text-white tracking-tight">
              ₹{(analytics.totalGrossBookingValue || 0) - (analytics.totalCommissionEarned || 0)}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>All settlements completed</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#061017] to-[#0a1824] border border-teal-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-400 mb-1">Pending Escrow</p>
            <p className="text-3xl font-black font-mono text-white tracking-tight">
              ₹{bookings.filter(b => b.status === 'IN_PROGRESS' || b.status === 'PROVIDER_ON_THE_WAY' || b.status === 'ACCEPTED').reduce((sum, b) => sum + (b.totalAmount || 0), 0)}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Funds locked in active orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-[#061017] border border-teal-900/40 rounded-2xl overflow-hidden shadow-xl mt-8">
        <div className="p-5 border-b border-teal-900/40 flex items-center justify-between bg-[#0a1824]">
          <h3 className="font-bold text-white">Completed Order Settlements</h3>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search ID, Provider..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-[#061017] border border-teal-900/40 rounded-lg text-sm text-white focus:border-[#0df2a4] outline-none transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0a1824] border-b border-teal-900/40 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Transaction Ref</th>
                <th className="px-6 py-4">Date Settled</th>
                <th className="px-6 py-4">Provider / Service</th>
                <th className="px-6 py-4 text-right">Gross Amount</th>
                <th className="px-6 py-4 text-right">Platform Fee (10%)</th>
                <th className="px-6 py-4 text-right">Net Payout</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-900/20">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-white">TXN-{b.bookingCode}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {new Date(b.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{b.providerName}</div>
                      <div className="text-xs text-slate-500">{b.serviceName}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-300">
                      ₹{b.totalAmount}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-[#0df2a4]">
                      ₹{b.platformCommission}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-white">
                      ₹{b.providerEarnings}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                        Settled
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct UPI Payments Table */}
      <div className="bg-[#061017] border border-teal-900/40 rounded-2xl overflow-hidden shadow-xl mt-8">
        <div className="p-5 border-b border-teal-900/40 flex items-center justify-between bg-[#0a1824]">
          <div>
            <h3 className="font-bold text-white">Direct UPI Payments (Pay After Satisfaction)</h3>
            <p className="text-xs text-slate-400 mt-1">Payments submitted directly by customers via QR code.</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0a1824] border-b border-teal-900/40 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Payment ID</th>
                <th className="px-6 py-4">Date / Time</th>
                <th className="px-6 py-4">UTR Number</th>
                <th className="px-6 py-4 text-center">Proof</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-900/20">
              {upiPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No direct UPI payments found.
                  </td>
                </tr>
              ) : (
                upiPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-white">{p.id}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                      {new Date(p.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-teal-300">
                      {p.utr}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedProof(p.proofFile)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Proof
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        p.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center justify-center gap-2">
                      {p.status === 'VERIFYING' && (
                        <>
                          <button onClick={() => updatePaymentStatus(p.id, 'VERIFIED')} className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded text-xs font-bold">Approve</button>
                          <button onClick={() => updatePaymentStatus(p.id, 'REJECTED')} className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded text-xs font-bold">Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#020508]/90 backdrop-blur-sm" onClick={() => setSelectedProof(null)}>
          <div className="relative max-w-3xl max-h-[90vh] bg-[#0a1824] rounded-2xl border border-teal-500/30 p-2 overflow-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            {selectedProof.startsWith('data:image') ? (
              <img src={selectedProof} alt="Payment Proof" className="max-w-full max-h-[85vh] rounded-xl object-contain" />
            ) : (
              <iframe src={selectedProof} className="w-full h-[85vh] rounded-xl bg-white" title="PDF Proof" />
            )}
            <button onClick={() => setSelectedProof(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-rose-500/80 transition-colors">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
