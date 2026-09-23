import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Banknote,
  QrCode,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Sparkles,
  Award,
  Check,
  Zap,
  Copy,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useMerchantConfig } from '../context/MerchantConfigContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { UpiPaymentModal } from '../components/UpiPaymentModal.tsx';

interface CashSatisfactionPageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenBooking: (serviceId?: string, providerId?: string) => void;
}

export function CashSatisfactionPage({ onNavigate, onOpenBooking }: CashSatisfactionPageProps) {
  const { merchantUpiId, merchantPayeeName } = useMerchantConfig();
  const { showToast } = useToast();
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const effectiveUpiId = merchantUpiId || 'ravikanhauli91@ptyes';
  const effectivePayee = merchantPayeeName || 'Ravi Kumar';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(effectiveUpiId);
    setCopiedUpi(true);
    showToast(`UPI ID copied: ${effectiveUpiId}`, 'success');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const notePoints = [
    {
      number: '01',
      title: 'Zero Advance Policy',
      highlight: 'Never pay even ₹1 in advance before the service begins.',
      description:
        'Under SevaConnect’s strict consumer protection rules, our partner technicians will first arrive at your doorstep and carry out a standard diagnostic inspection. Technicians are strictly prohibited from demanding any upfront fees or advance cash before starting the job.',
      icon: Banknote,
      badge: '100% Zero Advance',
      color: 'from-amber-500/20 to-amber-600/5',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
    },
    {
      number: '02',
      title: 'Thorough Inspection & Live Trial',
      highlight: 'Inspect, operate, and verify the service with your own eyes before settling the bill.',
      description:
        'Once the technician concludes the service, test the equipment and workmanship thoroughly in their presence:\n• AC Service/Repair: Check cooling performance, airflow, and verify zero refrigerant gas leaks.\n• Plumbing Work: Inspect water pressure, shutoff valves, and check pipe joints for any leaks.\n• Electrical Work: Test all switches, wiring, circuit breakers, and verify stable current.\n• Home Appliances: Run a live test cycle on washing machines, refrigerators, microwaves, or RO water purifiers.',
      icon: CheckCircle2,
      badge: 'Live Testing First',
      color: 'from-blue-500/10 to-transparent',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
    },
    {
      number: '03',
      title: 'Exact Transparent Invoicing',
      highlight: 'Only pay the exact amount stated in your official SevaConnect digital invoice or SMS.',
      description:
        'Never pay unrecorded verbal charges or arbitrary surcharges. When the service is complete, you will receive an official digital invoice via SMS and in-app. If replacement spare parts were required, ensure they are registered on the official bill with MRP confirmation.',
      icon: ShieldCheck,
      badge: 'System Invoice Only',
      color: 'from-indigo-500/10 to-transparent',
      borderColor: 'border-indigo-500/30',
      textColor: 'text-indigo-400',
    },
    {
      number: '04',
      title: 'Flexible Payment Mode: Cash or UPI / QR',
      highlight: 'Pay in cash directly to the technician or scan the official UPI QR code instantly.',
      description:
        `Customers can choose to pay the service partner directly in physical cash or scan our verified SevaConnect UPI QR code (${effectiveUpiId}) using Google Pay, PhonePe, Paytm, BHIM, or Net Banking. Both payment options provide an instant official digital receipt.`,
      icon: QrCode,
      badge: 'Cash or Digital QR',
      color: 'from-blue-500/10 to-transparent',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-300',
    },
    {
      number: '05',
      title: '7-Day Free Labor Revisit Warranty',
      highlight: 'Free complimentary revisit if the same issue reoccurs within 7 days.',
      description:
        'If the repaired appliance or fixture exhibits the same malfunction within 7 days of service completion, SevaConnect will dispatch the technician or a senior supervisor for a free warranty revisit with zero labor charges.',
      icon: Award,
      badge: '7-Day Protection',
      color: 'from-amber-500/10 to-transparent',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
    },
    {
      number: '06',
      title: 'OTP & Job Closure Verification',
      highlight: 'Share your 4-digit service closure OTP only after you are 100% satisfied.',
      description:
        'Only share your 4-digit completion code with the technician after all work has been thoroughly tested and approved by you. Sharing this OTP officially marks the booking as COMPLETED and automatically activates your 7-day labor warranty.',
      icon: Zap,
      badge: 'OTP Protected Closure',
      color: 'from-purple-500/20 to-purple-600/5',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
    },
    {
      number: '07',
      title: 'Anti-Extortion & Grievance Helpline',
      highlight: 'If any technician demands unauthorized charges or behaves inappropriately, contact Admin immediately.',
      description:
        'If any technician demands upfront advance cash, displays unprofessional conduct, or attempts to overcharge beyond the app estimate, stop the service immediately and contact our Admin Helpline at +91 8709107808 or ambitiongolu@gmail.com. Our safety team will intervene within 15 minutes.',
      icon: AlertCircle,
      badge: 'Direct Admin Helpline',
      color: 'from-rose-500/20 to-rose-600/5',
      borderColor: 'border-rose-500/30',
      textColor: 'text-rose-400',
    },
  ];

  const faqs = [
    {
      q: 'Do I have to pay any advance or visitation fee before work starts?',
      a: 'No, absolutely not. SevaConnect strictly enforces a Zero Advance & Cash After Satisfaction policy. You only pay once the technician arrives, diagnoses the problem, completes the repair, and you have personally verified the results.',
    },
    {
      q: 'What should I do if I am not satisfied with the technician’s work?',
      a: 'If the repair or service does not meet your expectations, ask the technician to rectify it immediately and do NOT share your completion OTP. If the issue persists, call our Admin Helpline at +91 8709107808. We will promptly dispatch a senior technician or provide a full resolution.',
    },
    {
      q: 'Can I pay via Google Pay, PhonePe, or Paytm instead of physical cash?',
      a: 'Yes, absolutely! You can choose to pay the technician in physical cash, or scan our official SevaConnect UPI QR code using any UPI app (Google Pay, PhonePe, Paytm, BHIM) for an instant cashless transaction.',
    },
    {
      q: 'How do I claim the 7-day labor warranty?',
      a: 'If the same issue reoccurs within 7 days of booking completion, simply open your Customer Dashboard and click "Book Revisit", or call our helpline at +91 8709107808 with your Booking ID for a free priority inspection.',
    },
    {
      q: 'Are replacement spare parts included in the standard service charges?',
      a: 'Standard service charges cover professional labor and repair diagnosis. If any spare part needs replacement (e.g., AC capacitor, plumbing valve, switchboard component), the technician will present genuine parts with transparent MRP pricing and only install them after your explicit prior approval.',
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-blue-500 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e293b] hover:bg-[#334155] border border-slate-700 text-blue-400 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUpiModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan UPI QR Code</span>
            </button>
            <button
              onClick={() => onOpenBooking()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black transition-all cursor-pointer shadow-[0_4px_16px_rgba(37,99,235,0.4)]"
            >
              <span>Book Service</span>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-blue-500/30 p-8 sm:p-12 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Official Customer Protection Policy</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Cash After Satisfaction <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-amber-400">
                Work Done, 100% Satisfaction — Only Then Pay!
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              At SevaConnect, customer trust and safety are our highest priorities. We have eliminated upfront guesswork and advance charges across home and commercial repair services.
              <strong> You do not pay a single rupee until you have personally inspected, tested, and approved the workmanship.</strong>
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-slate-800 text-center">
                <div className="text-xl font-black text-amber-400">₹0</div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Advance Required</div>
                <div className="text-[10px] text-slate-500">Zero Upfront Fees</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-slate-800 text-center">
                <div className="text-xl font-black text-blue-400">100%</div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Live Inspection</div>
                <div className="text-[10px] text-slate-500">Verify Before Paying</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-slate-800 text-center">
                <div className="text-xl font-black text-indigo-400">7 Days</div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Labor Warranty</div>
                <div className="text-[10px] text-slate-500">Free Revisit Protection</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-slate-800 text-center">
                <div className="text-xl font-black text-blue-400">Cash / UPI</div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Payment Modes</div>
                <div className="text-[10px] text-slate-500">Cash or Digital QR</div>
              </div>
            </div>
          </div>
        </div>

        {/* Note Points */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Transparency Guidelines</span>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Key Policy Note Points</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Please follow these 7 customer protection and payment rules when your technician arrives
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {notePoints.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl bg-[#0f172a] border ${item.borderColor} shadow-lg transition-all hover:translate-y-[-2px] hover:shadow-xl`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#1e293b] border border-slate-700/60 flex flex-col items-center justify-center shrink-0 shadow-md">
                      <span className="text-[10px] font-mono font-bold text-slate-400">NOTE</span>
                      <span className={`text-sm font-black ${item.textColor}`}>{item.number}</span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${item.textColor}`} />
                          <span>{item.title}</span>
                        </h3>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-[#1e293b] ${item.borderColor} ${item.textColor}`}>
                          {item.badge}
                        </span>
                      </div>

                      <div className={`text-xs font-semibold ${item.textColor} bg-[#1e293b]/80 px-3 py-1.5 rounded-xl border border-white/5`}>
                        👉 {item.highlight}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line pt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* UPI QR & Payment Mode Showcase Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-blue-500/30 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 flex-1 text-center lg:text-left">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center justify-center lg:justify-start gap-1.5">
                <QrCode className="w-4 h-4 text-blue-400" />
                <span>Instant Cashless &amp; Cash Payment Options</span>
              </span>
              <h3 className="text-2xl font-black text-white">
                Pay via Official SevaConnect UPI QR Code
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Once the service is completed to your satisfaction, you can pay the technician in physical cash or scan our official QR code using Google Pay, PhonePe, Paytm, or BHIM UPI.
              </p>

              {/* UPI ID Copy Pill */}
              <div className="inline-flex items-center gap-2 bg-[#1e293b] border border-slate-700 rounded-xl p-2 pr-3 max-w-full">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse ml-1" />
                <span className="text-[11px] font-bold text-slate-400">Official UPI ID:</span>
                <span className="text-xs font-mono font-bold text-blue-400 select-all truncate">
                  {effectiveUpiId}
                </span>
                <button
                  onClick={handleCopyUpi}
                  className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 transition-colors cursor-pointer ml-1"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Verified Payee: <strong className="text-white">{effectivePayee}</strong> (SevaConnect Official)
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setUpiModalOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Open &amp; Scan UPI QR Code</span>
              </button>

              <button
                onClick={() => onOpenBooking()}
                className="px-6 py-3.5 rounded-xl bg-[#1e293b] hover:bg-[#334155] border border-slate-700 text-blue-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Book a Service Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="rounded-3xl bg-[#0f172a] border border-slate-800 p-6 sm:p-8 space-y-4">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Frequently Asked Questions</span>
            <h3 className="text-xl font-bold text-white mt-1">Customer FAQs &amp; Clarity Guidelines</h3>
          </div>

          <div className="space-y-3 pt-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl bg-[#1e293b] border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-4 text-left font-bold text-sm text-white flex items-center justify-between gap-3 hover:bg-[#334155]/50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {openFaq === index ? (
                    <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="p-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800 bg-[#0f172a]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Admin Helpline Support Bar */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-blue-950/80 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Need Help or Facing Any Issue with Service Partner?</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Our Admin Support Team is available on call &amp; WhatsApp: <strong>+91 8709107808</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="tel:8709107808"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Helpline</span>
            </a>
            <a
              href="https://wa.me/918709107808"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

      </div>

      {/* Modal for viewing UPI QR */}
      <UpiPaymentModal
        isOpen={upiModalOpen}
        onClose={() => setUpiModalOpen(false)}
      />
    </div>
  );
}
