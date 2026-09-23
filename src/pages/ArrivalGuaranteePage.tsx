import React, { useState } from 'react';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  MapPin,
  Phone,
  MessageSquare,
  Zap,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  Compass,
} from 'lucide-react';

interface ArrivalGuaranteePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenBooking: (serviceId?: string, providerId?: string) => void;
  selectedCity: string;
  selectedArea: string;
}

export function ArrivalGuaranteePage({
  onNavigate,
  onOpenBooking,
  selectedCity,
  selectedArea,
}: ArrivalGuaranteePageProps) {
  const [selectedLocality, setSelectedLocality] = useState(
    selectedArea || 'Boring Road'
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const localityEstimates: Record<string, { eta: string; density: string; status: string }> = {
    // Patna Urban Localities
    'Boring Road': { eta: '20-30 mins', density: 'High (16 active pros)', status: 'Optimal Dispatch' },
    'Kankarbagh': { eta: '25-35 mins', density: 'High (14 active pros)', status: 'Optimal Dispatch' },
    'Bailey Road': { eta: '22-32 mins', density: 'Ultra Fast (15 active pros)', status: 'Express Hub' },
    'Raja Bazar': { eta: '25-35 mins', density: 'High (12 active pros)', status: 'Optimal Dispatch' },
    'Danapur': { eta: '30-40 mins', density: 'Moderate (11 active pros)', status: 'Active Dispatch' },
    'Patliputra Colony': { eta: '20-30 mins', density: 'Ultra Fast (14 active pros)', status: 'Express Hub' },
    'Ashiana Nagar': { eta: '25-35 mins', density: 'High (10 active pros)', status: 'Optimal Dispatch' },
    'Fraser Road': { eta: '20-30 mins', density: 'High (12 active pros)', status: 'Optimal Dispatch' },
    'Rajendra Nagar': { eta: '25-35 mins', density: 'High (11 active pros)', status: 'Optimal Dispatch' },
    'Saguna More': { eta: '25-35 mins', density: 'High (10 active pros)', status: 'Optimal Dispatch' },
    'Digha': { eta: '28-38 mins', density: 'Moderate (9 active pros)', status: 'Active Dispatch' },
    'Khagaul': { eta: '30-40 mins', density: 'Moderate (8 active pros)', status: 'Active Dispatch' },
    'Phulwari Sharif': { eta: '28-38 mins', density: 'Moderate (10 active pros)', status: 'Active Dispatch' },
    'Patna City': { eta: '30-40 mins', density: 'High (12 active pros)', status: 'Active Dispatch' },

    // Patna District Blocks & Rural Villages (हर गाँव)
    'Bihta (बिहटा)': { eta: '35-45 mins', density: 'Active (8 village mobile units)', status: 'Rural Express' },
    'Naubatpur (नौबतपुर)': { eta: '35-45 mins', density: 'Active (7 village mobile units)', status: 'Rural Express' },
    'Maner (मनेर)': { eta: '35-45 mins', density: 'Active (6 village mobile units)', status: 'Rural Express' },
    'Fatuha (फतुहा)': { eta: '30-42 mins', density: 'Active (8 village mobile units)', status: 'Rural Express' },
    'Bakhtiyarpur (बख्तियारपुर)': { eta: '35-45 mins', density: 'Active (6 village mobile units)', status: 'Rural Express' },
    'Masaurhi (मसौढ़ी)': { eta: '35-45 mins', density: 'Active (7 village mobile units)', status: 'Rural Express' },
    'Paliganj (पालीगंज)': { eta: '38-45 mins', density: 'Active (6 village mobile units)', status: 'Rural Express' },
    'Bikram (विक्रम)': { eta: '35-45 mins', density: 'Active (6 village mobile units)', status: 'Rural Express' },
    'Sampatchak (संपतचक)': { eta: '28-38 mins', density: 'High (9 village mobile units)', status: 'Rural Express' },
    'Punpun (पुनपुन)': { eta: '32-42 mins', density: 'Active (7 village mobile units)', status: 'Rural Express' },
    'Barh (बाढ़)': { eta: '38-45 mins', density: 'Active (6 village mobile units)', status: 'Rural Express' },
    'Mokama (मोकामा)': { eta: '38-45 mins', density: 'Active (5 village mobile units)', status: 'Rural Express' },
  };

  const currentEstimate = localityEstimates[selectedLocality] || {
    eta: '30-45 mins',
    density: 'Active coverage',
    status: 'Standard Express',
  };

  const notePoints = [
    {
      id: 1,
      tag: '01. Instant Dispatch',
      title: 'Real-Time Pro Allocation',
      description:
        'Upon booking placement, our automated matching engine instantly assigns the highest-rated certified technician within a 3–5 km radius of your location.',
      details:
        'Technician dispatch occurs within 5 minutes of booking confirmation. You receive live SMS and in-app updates with the technician’s name, contact number, and live status.',
      badge: 'Under 5 Mins',
      badgeColor: 'text-[#0df2a4] bg-[#0df2a4]/10 border-[#0df2a4]/30',
    },
    {
      id: 2,
      tag: '02. 45-Min SLA Window',
      title: 'Official Timer Calculation',
      description:
        'The 45-minute arrival window begins the moment your booking is confirmed and accepted by the partner technician.',
      details:
        'Our doorstep technicians travel on fully equipped electric two-wheelers with complete service toolkits and essential genuine spare parts to eliminate delays.',
      badge: 'Guaranteed Doorstep',
      badgeColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    },
    {
      id: 3,
      tag: '03. Operational Timings',
      title: 'Operating Hours & Service Slots (7:00 AM - 10:00 PM)',
      description:
        'The 45-Minute Express Arrival guarantee operates continuously from 7:00 AM to 10:00 PM, 365 days a year.',
      details:
        'Orders placed outside these hours (e.g. at night) can be pre-scheduled for the earliest priority 7:00 AM - 8:00 AM early morning emergency dispatch.',
      badge: '7 AM - 10 PM',
      badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    },
    {
      id: 4,
      tag: '04. Late Arrival Penalty',
      title: '₹50 Delay Compensation Policy',
      description:
        'If our partner technician arrives after 45 minutes due to preventable transit delays, we credit ₹50 directly off your service bill.',
      details:
        'No questions asked. The arrival timestamp is recorded when you provide the 4-digit Job Start OTP upon the technician’s physical arrival at your premises.',
      badge: '₹50 Compensation',
      badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    },
    {
      id: 5,
      tag: '05. Customer Reachability',
      title: 'Customer Contact & Entry Guidance',
      description:
        'Customers must keep their registered mobile phone reachable to provide gated society entry or landmark guidance.',
      details:
        'If the technician is delayed due to incorrect address information, repeated unanswered calls (minimum 3 attempts), or delayed gate permissions, the timer pause policy applies.',
      badge: 'Mandatory Note',
      badgeColor: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
    },
    {
      id: 6,
      tag: '06. Force Majeure Clause',
      title: 'Severe Weather & Traffic Exemptions',
      description:
        'Exceptions apply during unseasonal road waterlogging, major highway diversions, VIP security closures, or municipal curfews.',
      details:
        'In such rare eventualities, our central dispatch desk contacts you immediately to provide transparent transit tracking and offer free rescheduling if preferred.',
      badge: 'Fair Policy',
      badgeColor: 'text-slate-300 bg-slate-800 border-slate-700',
    },
    {
      id: 7,
      tag: '07. Verified Identity & Safety',
      title: 'Aadhaar Verified & OTP Secure',
      description:
        'Every visiting technician carries verified Aadhaar identification and wears official SevaConnect technician uniforms.',
      details:
        'Work begins only after you enter the 4-digit service start code sent to your phone, ensuring 100% authorization and personal safety at your doorstep.',
      badge: '100% Aadhaar Verified',
      badgeColor: 'text-teal-300 bg-teal-400/10 border-teal-400/30',
    },
    {
      id: 8,
      tag: '08. Zero Advance Payment',
      title: 'Pay After Complete Satisfaction',
      description:
        'No advance fee is required for 45-min arrival. You only pay once the technician finishes the service to your complete satisfaction.',
      details:
        'Pay conveniently via UPI QR code (Paytm, PhonePe, GPay), Cash on Delivery, or Net Banking after job inspection.',
      badge: 'Zero Advance',
      badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    },
  ];

  const faqs = [
    {
      q: 'Does 45-Minute Arrival cost extra charges?',
      a: 'No! Our 45-Minute Express Arrival is included at regular standard rates. We do not charge extra emergency surcharge fees during normal operational hours (7 AM - 10 PM).',
    },
    {
      q: 'What happens if the technician takes 55 minutes to reach?',
      a: 'If the delay is due to our transit or partner allocation, an instant ₹50 discount is applied directly on your final invoice. Simply verify the arrival timestamp with your booking code.',
    },
    {
      q: 'How do I track the arriving technician?',
      a: 'Upon booking confirmation, you can see the technician details and assigned hub on your screen. You can also call the technician directly with one click.',
    },
    {
      q: 'Can I cancel if the technician is delayed?',
      a: 'Yes, if the technician exceeds the 45-minute window and you cannot wait, you have full freedom to cancel with zero cancellation fees.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070e14] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a1721] hover:bg-[#0e2433] border border-teal-500/30 text-teal-300 hover:text-[#0df2a4] transition-all text-sm font-semibold cursor-pointer shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#08151f] px-3.5 py-1.5 rounded-full border border-teal-500/20">
            <span className="w-2 h-2 rounded-full bg-[#0df2a4] animate-pulse" />
            <span>Live Dispatch Active in {selectedCity}</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#081722] via-[#091b29] to-[#050e15] border-2 border-teal-500/40 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-[0_0_45px_rgba(13,242,164,0.15)]">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#0df2a4]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0df2a4]/15 border border-[#0df2a4]/40 text-[#0df2a4] text-xs font-black uppercase tracking-wider font-mono">
              <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
              <span>OFFICIAL SERVICE GUARANTEE • 45-MIN DOORSTEP SLA</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-tight">
              45-Minute Arrival Guarantee
              <span className="block text-2xl sm:text-3xl lg:text-4xl text-[#0df2a4] mt-1 font-extrabold font-sans">
                Doorstep Technician SLA & Guidelines
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              When a repair emergency strikes, every minute matters. SevaConnect’s hyper-local cluster network connects your home with background-verified, local technicians within 45 minutes across primary city zones.
            </p>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onOpenBooking()}
                className="px-6 py-3 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(13,242,164,0.4)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Book 45-Min Express Service Now</span>
              </button>

              <button
                onClick={() => onNavigate('search')}
                className="px-5 py-3 rounded-xl bg-[#08151f] hover:bg-[#0d2230] border border-teal-500/30 text-teal-300 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Browse Services</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Stats Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#08151f] border border-teal-500/30 shadow-lg">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg. Dispatch Speed</p>
            <p className="text-2xl sm:text-3xl font-black text-[#0df2a4] font-mono mt-1">4.8 Mins</p>
            <p className="text-[11px] text-teal-300/80 mt-1">From order to technician transit</p>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-[#08151f] border border-teal-500/30 shadow-lg">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">On-Time Arrival Rate</p>
            <p className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono mt-1">98.4%</p>
            <p className="text-[11px] text-slate-400 mt-1">Measured across 12,000+ bookings</p>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-[#08151f] border border-teal-500/30 shadow-lg">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Delay Compensation</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">₹50 Credit</p>
            <p className="text-[11px] text-slate-400 mt-1">Automatic waiver on invoice</p>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-[#08151f] border border-teal-500/30 shadow-lg">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Operational Hours</p>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">7 AM - 10 PM</p>
            <p className="text-[11px] text-slate-400 mt-1">7 days a week nonstop</p>
          </div>
        </div>

        {/* 4-Step Timeline: How the 45-Min Delivery Works */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#08151f] border border-teal-500/30 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-500/20 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white font-display flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0df2a4]" />
                <span>4-Stage Dispatch & Arrival Timeline</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Transparency at every minute of your technician's transit.
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#0df2a4] bg-[#0df2a4]/10 border border-[#0df2a4]/30 px-3 py-1 rounded-full w-fit">
              SLA Standard: 45 Mins Max
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            <div className="p-4 rounded-2xl bg-[#061017] border border-teal-500/20 relative">
              <span className="text-xs font-mono font-bold text-slate-400">STAGE 01 • MIN 00</span>
              <h4 className="text-sm font-bold text-white mt-1">Booking Confirmed</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                You place an instant booking with your address and service requirement.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#061017] border border-teal-500/20 relative">
              <span className="text-xs font-mono font-bold text-[#0df2a4]">STAGE 02 • MIN 05</span>
              <h4 className="text-sm font-bold text-white mt-1">Nearest Pro Assigned</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Nearest certified technician in your local cluster accepts and packs necessary spares.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#061017] border border-teal-500/20 relative">
              <span className="text-xs font-mono font-bold text-cyan-400">STAGE 03 • MIN 15</span>
              <h4 className="text-sm font-bold text-white mt-1">En Route on 2-Wheeler</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Technician dispatches via optimal navigation routes with live status tracking.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#061017] border border-[#0df2a4]/40 bg-[#0df2a4]/5 relative">
              <span className="text-xs font-mono font-bold text-emerald-400">STAGE 04 • MIN 45</span>
              <h4 className="text-sm font-bold text-white mt-1">Doorstep Ring & OTP</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Technician rings bell in uniform with ID badge. You share OTP to start the job.
              </p>
            </div>
          </div>
        </div>

        {/* Live Locality Arrival Estimator */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#081824] to-[#0b1f2d] border border-teal-500/30 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-display flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0df2a4]" />
                <span>Check Live Arrival ETA for Your Area</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current active technician clusters in {selectedCity}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Select Locality:</label>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="bg-[#061017] border border-teal-500/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#0df2a4]"
              >
                {Object.keys(localityEstimates).map((loc) => (
                  <option key={loc} value={loc} className="bg-[#08151f] text-white">
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#050c12] border border-teal-500/20 items-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Estimated Arrival ETA</span>
              <p className="text-xl sm:text-2xl font-black text-[#0df2a4] font-mono">{currentEstimate.eta}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Technician Density</span>
              <p className="text-sm font-bold text-slate-200">{currentEstimate.density}</p>
            </div>
            <div className="flex justify-start sm:justify-end">
              <button
                onClick={() => onOpenBooking()}
                className="px-4 py-2 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Book in {selectedLocality} &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* IMPORTANT NOTES & GUIDELINES */}
        <div className="space-y-6">
          <div className="border-b border-teal-500/20 pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0df2a4]/10 text-[#0df2a4] border border-[#0df2a4]/30 text-xs font-bold font-mono uppercase mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>KEY POLICY NOTES • TERMS & GUIDELINES</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display">
              8 Essential Rules of the 45-Min Arrival Guarantee
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Please review these key points regarding service commitments, late arrival compensation, and coverage limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {notePoints.map((note) => (
              <div
                key={note.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#08151f] border border-teal-500/20 hover:border-teal-500/50 transition-all flex flex-col justify-between shadow-lg group hover:bg-[#091a27]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-teal-400/80">{note.tag}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${note.badgeColor}`}>
                      {note.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-display group-hover:text-[#0df2a4] transition-colors">
                    {note.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                    {note.description}
                  </p>

                  <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-teal-500/10">
                    {note.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#08151f] border border-teal-500/30 space-y-5 shadow-xl">
          <h3 className="text-lg sm:text-xl font-black text-white font-display">
            Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-teal-500/20 bg-[#061017] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-white hover:text-[#0df2a4] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#0df2a4] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-teal-500/10 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Support Desk Banner */}
        <div className="rounded-3xl bg-[#08151f] border-2 border-[#0df2a4]/40 p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <h3 className="text-xl sm:text-2xl font-black text-white font-display">
            Need an Immediate Technician Right Now?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Our Patna District central dispatch desk is currently live covering all city sectors, blocks, and rural village clusters with 45-minute arrival SLA. Connect directly with an operations supervisor for urgent priority response.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onOpenBooking()}
              className="px-6 py-3 rounded-full bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(13,242,164,0.4)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Book 45-Min Arrival Service</span>
            </button>

            <a
              href="tel:8709107808"
              className="px-6 py-3 rounded-full bg-[#061017] hover:bg-[#0a1b26] border border-teal-500/40 text-teal-300 hover:text-[#0df2a4] font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Helpline: 8709107808</span>
            </a>

            <a
              href="https://wa.me/918709107808"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-full bg-[#061017] hover:bg-[#0a1b26] border border-emerald-500/40 text-emerald-400 font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Dispatch</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
