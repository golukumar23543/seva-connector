import React, { useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  UserCheck,
  FileCheck,
  AlertCircle,
  Phone,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';

interface AadhaarVerifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking?: () => void;
}

export function AadhaarVerifiedModal({
  isOpen,
  onClose,
  onOpenBooking,
}: AadhaarVerifiedModalProps) {
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
      title: 'Government Aadhaar e-KYC Verification',
      tag: 'Identity Verification',
      description:
        'Every technician undergoes mandatory UIDAI Aadhaar e-KYC authentication before their profile is approved on the platform. We verify legal identity, permanent residence, and linked mobile credentials.',
      badge: 'Govt. Verified',
      badgeColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    },
    {
      id: 2,
      title: 'Police & Criminal Record Background Check',
      tag: 'Safety Screening',
      description:
        'Technicians must provide a clean police verification certificate and undergo third-party criminal record checks. Only professionals with clean records are allowed to visit customer homes.',
      badge: 'Police Cleared',
      badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    },
    {
      id: 3,
      title: 'Trade Skill & Practical Certification',
      tag: 'Skill Testing',
      description:
        'Beyond identity, each professional completes a rigorous trade test evaluated by senior technical supervisors to ensure proficient handling of electrical, plumbing, and appliance systems.',
      badge: 'Certified Pro',
      badgeColor: 'text-[#0df2a4] bg-[#0df2a4]/10 border-[#0df2a4]/30',
    },
    {
      id: 4,
      title: 'Mandatory Uniform & Digital/Physical ID Card',
      tag: 'Doorstep Protocol',
      description:
        'Every technician arrives in the official SevaConnect uniform wearing a photo ID card equipped with a verifiable QR code. Customers can scan the card to verify active employment.',
      badge: 'Badge Protected',
      badgeColor: 'text-teal-300 bg-teal-400/10 border-teal-400/30',
    },
    {
      id: 5,
      title: '4-Digit Secure Job Start OTP',
      tag: 'Zero Unauthorized Entry',
      description:
        'Service begins only after the customer confirms the technician’s credentials and shares the 4-digit Job Start OTP sent to the customer’s phone. This guarantees that only the assigned technician enters.',
      badge: 'OTP Protected',
      badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    },
    {
      id: 6,
      title: 'Continuous Star Rating & Safety Audits',
      tag: 'Quality Standard',
      description:
        'Technicians maintain an active rating above 4.5/5.0 stars. Any behavioral complaint or safety report triggers an immediate automated account freeze pending central operations review.',
      badge: '4.5+ Star Threshold',
      badgeColor: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    },
    {
      id: 7,
      title: '24/7 Safety Helpline & Supervisor Escalation',
      tag: 'Emergency Support',
      description:
        'Our central control desk is active throughout all visits. Customers have one-tap access to connect directly with an operations supervisor if any concern arises during service.',
      badge: '24/7 Escalation',
      badgeColor: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
    },
  ];

  return (
    <div
      id="aadhaar-verified-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="aadhaar-verified-modal-card"
        className="relative w-full max-w-2xl bg-[#08151f] border-2 border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-cyan-500/20 bg-gradient-to-r from-[#091e2b] via-[#081824] to-[#06121b] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-400/15 text-cyan-400 border border-cyan-400/30 font-mono">
                  Trust & Safety Policy
                </span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
                100% Aadhaar Verified
              </h2>
              <p className="text-xs text-slate-300">
                Background Checked &amp; Police Clearance Protocol
              </p>
            </div>
          </div>

          <button
            id="btn-close-aadhaar-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#050e15] border border-cyan-500/30 text-slate-400 hover:text-white hover:bg-cyan-500/20 transition-all flex items-center justify-center cursor-pointer shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#050c12] border-b border-cyan-500/15 text-center text-xs shrink-0 font-mono">
          <div className="p-2 rounded-xl bg-[#08151f] border border-cyan-500/20">
            <p className="text-[10px] text-slate-400">UIDAI e-KYC</p>
            <p className="font-bold text-cyan-400 mt-0.5">100% Validated</p>
          </div>
          <div className="p-2 rounded-xl bg-[#08151f] border border-cyan-500/20">
            <p className="text-[10px] text-slate-400">Police Check</p>
            <p className="font-bold text-emerald-400 mt-0.5">Verified Clean</p>
          </div>
          <div className="p-2 rounded-xl bg-[#08151f] border border-cyan-500/20">
            <p className="text-[10px] text-slate-400">OTP Auth</p>
            <p className="font-bold text-amber-400 mt-0.5">Job Start Code</p>
          </div>
          <div className="p-2 rounded-xl bg-[#08151f] border border-cyan-500/20">
            <p className="text-[10px] text-slate-400">Min Rating</p>
            <p className="font-bold text-[#0df2a4] mt-0.5">4.5 / 5.0 Stars</p>
          </div>
        </div>

        {/* Scrollable Note Points Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3 text-xs text-cyan-200 leading-relaxed">
            <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Customer Security First:</strong> Every technician entering your home is strictly vetted through government databases and police clearance records. You always have 100% visibility over who visits your home.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Essential Verification Policy Notes (7 Key Points)
            </h3>

            {notePoints.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-2xl bg-[#050c12] border border-cyan-500/20 hover:border-cyan-500/50 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[10px] font-mono font-black flex items-center justify-center shrink-0">
                      {note.id}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors font-display">
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
        <div className="p-4 sm:p-5 border-t border-cyan-500/20 bg-[#050e15] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <a
            href="tel:8709107808"
            className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 font-medium transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Safety Desk: +91 8709107808</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              id="btn-close-aadhaar-footer"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#08151f] hover:bg-[#0c202e] border border-cyan-500/30 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Close
            </button>

            {onOpenBooking && (
              <button
                id="btn-book-verified-technician"
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Book Verified Pro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
