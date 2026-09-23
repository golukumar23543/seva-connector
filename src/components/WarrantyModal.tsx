import React, { useEffect } from 'react';
import {
  X,
  RefreshCw,
  CheckCircle2,
  Award,
  Clock,
  ShieldCheck,
  Phone,
  ArrowRight,
  AlertTriangle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface WarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking?: () => void;
}

export function WarrantyModal({
  isOpen,
  onClose,
  onOpenBooking,
}: WarrantyModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const notePoints = [
    {
      id: 1,
      title: '7-Day Complete Coverage Window',
      tag: 'Duration',
      description:
        'Your service warranty starts immediately upon successful job completion and final payment, remaining fully active for 7 consecutive calendar days (168 hours).',
      badge: '7 Full Days',
      badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    },
    {
      id: 2,
      title: '100% Free Doorstep Re-Visit',
      tag: 'Zero Visit Charges',
      description:
        'If the repaired appliance or technical issue recurs within 7 days, our certified technician returns to your home completely free of charge. You do not pay any visitation or travel fee.',
      badge: '₹0 Re-visit Fee',
      badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    },
    {
      id: 3,
      title: 'Zero Labour & Zero Inspection Fees',
      tag: 'No Hidden Costs',
      description:
        'All re-inspection diagnostics and rework labor are 100% complimentary. If the technician needs to re-tighten, adjust, or re-solder the original repair, you pay absolutely zero.',
      badge: 'Zero Labour Fee',
      badgeColor: 'text-[#0df2a4] bg-[#0df2a4]/10 border-[#0df2a4]/30',
    },
    {
      id: 4,
      title: 'Priority Dispatch Re-Assignment',
      tag: 'Express Queue',
      description:
        'Warranty re-service requests are routed through our priority emergency queue. A senior supervisor or the original lead pro is dispatched on priority (average arrival within 45–60 mins).',
      badge: 'Priority Queue',
      badgeColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    },
    {
      id: 5,
      title: 'Genuine Spare Parts Warranty Protection',
      tag: 'Hardware Guarantee',
      description:
        'Any genuine replacement parts purchased through SevaConnect carry their respective manufacturer warranties (typically 3 to 12 months), protected against manufacturing defects.',
      badge: 'Up to 12 Months',
      badgeColor: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    },
    {
      id: 6,
      title: 'Instant 1-Tap Claim in Customer Dashboard',
      tag: 'Easy Filing',
      description:
        'Claiming your warranty is hassle-free. Go to Customer Dashboard > Completed Bookings > "Claim Free Warranty", or call our dispatch desk directly with your Booking Code.',
      badge: 'Instant Claim',
      badgeColor: 'text-teal-300 bg-teal-400/10 border-teal-400/30',
    },
    {
      id: 7,
      title: 'Transparent Fair-Use Policy',
      tag: 'Fair Terms',
      description:
        'The warranty covers the exact scope of work completed. New unrelated electrical surges, external water damage, physical impacts, or third-party tampering are not covered under free re-visit.',
      badge: 'Clear Terms',
      badgeColor: 'text-slate-300 bg-slate-800 border-slate-700',
    },
  ];

  return (
    <div
      id="warranty-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="warranty-modal-card"
        className="relative w-full max-w-2xl bg-[#08151f] border-2 border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-amber-500/20 bg-gradient-to-r from-[#1f1707] via-[#171309] to-[#08151f] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <RefreshCw className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400/15 text-amber-400 border border-amber-400/30 font-mono">
                  Warranty Guarantee
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
                7-Day Free Warranty
              </h2>
              <p className="text-xs text-slate-300">
                100% Free Doorstep Re-Visit If Issue Not Resolved
              </p>
            </div>
          </div>

          <button
            id="btn-close-warranty-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#050e15] border border-amber-500/30 text-slate-400 hover:text-white hover:bg-amber-500/20 transition-all flex items-center justify-center cursor-pointer shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#050c12] border-b border-amber-500/15 text-center text-xs shrink-0 font-mono">
          <div className="p-2 rounded-xl bg-[#08151f] border border-amber-500/20">
            <p className="text-[10px] text-slate-400">Coverage</p>
            <p className="font-bold text-amber-400 mt-0.5">7 Full Days</p>
          </div>
          <div className="p-2 rounded-xl bg-[#08151f] border border-amber-500/20">
            <p className="text-[10px] text-slate-400">Re-visit Fee</p>
            <p className="font-bold text-emerald-400 mt-0.5">₹0 (Free)</p>
          </div>
          <div className="p-2 rounded-xl bg-[#08151f] border border-amber-500/20">
            <p className="text-[10px] text-slate-400">Labour Charge</p>
            <p className="font-bold text-[#0df2a4] mt-0.5">Zero Charges</p>
          </div>
          <div className="p-2 rounded-xl bg-[#08151f] border border-amber-500/20">
            <p className="text-[10px] text-slate-400">Resolution</p>
            <p className="font-bold text-cyan-400 mt-0.5">Priority Dispatch</p>
          </div>
        </div>

        {/* Scrollable Note Points Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200 leading-relaxed">
            <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Founder’s Quality Promise:</strong> If our repair doesn't solve your issue completely, we send our top technician back to your home for free. You only pay once your job is completed to perfection.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Essential Warranty Policy Notes (7 Key Points)
            </h3>

            {notePoints.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-2xl bg-[#050c12] border border-amber-500/20 hover:border-amber-500/50 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-black flex items-center justify-center shrink-0">
                      {note.id}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors font-display">
                      {note.title}
                    </h4>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${note.badgeColor}`}
                  >
                    {note.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-7">
                  {note.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-amber-500/20 bg-[#050e15] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <a
            href="tel:8709107808"
            className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1.5 font-medium transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Warranty Desk: +91 8709107808</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              id="btn-close-warranty-footer"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#08151f] hover:bg-[#0c202e] border border-amber-500/30 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Close
            </button>

            {onOpenBooking && (
              <button
                id="btn-book-warranty-service"
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Book Guaranteed Service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
