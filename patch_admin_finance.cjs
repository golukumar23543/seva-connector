const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminFinance.tsx', 'utf8');

// 1. Add useState, useEffect import if needed
if (!code.includes('useEffect')) {
  code = code.replace(/import React, { useState } from 'react';/, "import React, { useState, useEffect } from 'react';");
}

// 2. Add lucide icons Eye
code = code.replace(/CheckCircle2, Clock } from 'lucide-react';/, "CheckCircle2, Clock, Eye } from 'lucide-react';");

// 3. Add state
const stateTarget = `const completedBookings = bookings.filter(b => b.status === 'COMPLETED');`;
const stateReplacement = `const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  
  const [upiPayments, setUpiPayments] = useState<any[]>([]);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('seva_upi_payments') || '[]');
    setUpiPayments(data);
  }, []);
  
  const updatePaymentStatus = (id: string, status: string) => {
    const updated = upiPayments.map(p => p.id === id ? { ...p, status } : p);
    setUpiPayments(updated);
    localStorage.setItem('seva_upi_payments', JSON.stringify(updated));
  };`;

code = code.replace(stateTarget, stateReplacement);

// 4. Add the UPI table before the last closing </div> of the component
const tableReplacement = `
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
                      <span className={\`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider \${
                        p.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        p.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }\`}>
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
`;

code = code.replace(/    <\/div>\s*<\/div>\s*<\/div>\s*\);\s*}\s*$/, tableReplacement);

fs.writeFileSync('src/pages/admin/AdminFinance.tsx', code);
console.log("Patched AdminFinance.tsx");
