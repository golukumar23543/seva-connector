import React, { useState, useEffect } from 'react';
import {
  Wrench,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  Search,
  ArrowRight,
  Sparkles,
  Zap,
  Droplets,
  Tv,
  Hammer,
  Paintbrush,
  Smartphone,
  Laptop,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CreditCard,
  UserCheck,
  Send,
  Calendar,
  Layers,
  MapPin,
  RefreshCw,
  Award,
  Wallet,
  Crown,
  Play,
  Pause,
  Settings,
  Eye,
} from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo.tsx';
import { UpiPaymentModal } from '../components/UpiPaymentModal.tsx';
import { AadhaarVerifiedModal } from '../components/AadhaarVerifiedModal.tsx';
import { WarrantyModal } from '../components/WarrantyModal.tsx';
import { ServiceNetworkAnimation } from '../components/ServiceNetworkAnimation.tsx';
import { ScrollReveal } from '../components/ScrollReveal.tsx';
import { useMerchantConfig } from '../context/MerchantConfigContext.tsx';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenBooking: (serviceId?: string, providerId?: string) => void;
  onOpenProviderDetail: (providerId: string) => void;
  onOpenAuth: (tab?: 'login' | 'register-customer' | 'register-provider') => void;
  selectedCity: string;
  selectedArea: string;
}

export function HomePage({
  onNavigate,
  onOpenBooking,
  onOpenAuth,
  selectedCity,
  selectedArea,
}: HomePageProps) {
  const { merchantUpiId } = useMerchantConfig();

  // 1. Search state
  const [heroSearchQuery, setHeroSearchQuery] = useState('');

  // 2. Package carousel & Music Player state
  const [packageIndex, setPackageIndex] = useState(0);
  const [showPackageDetails, setShowPackageDetails] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [displayDuration, setDisplayDuration] = useState(5);

  // Auto-play effect matching duration from image
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setPackageIndex((prev) => (prev + 1) % 3);
    }, displayDuration * 1000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, displayDuration]);

  // 3. FAQ search & accordion state
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // 4. Dispatch Desk form state
  const [dispatchForm, setDispatchForm] = useState({
    name: '',
    phone: '',
    service: 'Electrician',
    locality: selectedArea || 'Patna',
    issue: '',
  });
  const [dispatchSubmitted, setDispatchSubmitted] = useState(false);

  // 5. Scroll to top button visibility & parallax scroll tracking
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [aadhaarModalOpen, setAadhaarModalOpen] = useState(false);
  const [warrantyModalOpen, setWarrantyModalOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setShowScrollTop(currentScroll > 400);

      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(currentScroll);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Popular search pills
  const popularSearches = [
    'Electrician',
    'Plumber',
    'AC Technician',
    'RO Technician',
    'House Cleaning',
  ];

  // 12 Featured Services Data (matching video 12-card grid)
  const servicesList = [
    {
      id: 'srv-1',
      title: 'Electrician',
      badge: 'FAST 45M',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: Zap,
      iconColor: 'text-yellow-400',
      price: '₹199',
      desc: 'Wiring, Switches, Fan, MCB & Short-Circuit Fix',
      bullets: [
        'Short-circuit & Wiring diagnosis',
        'Switchboard & MCB replacement',
      ],
      category: 'Electrician',
    },
    {
      id: 'srv-2',
      title: 'Plumber',
      badge: 'POPULAR',
      badgeColor: 'bg-[#0df2a4]/20 text-[#0df2a4] border-[#0df2a4]/40',
      icon: Droplets,
      iconColor: 'text-sky-400',
      price: '₹249',
      desc: 'Pipe Leakage, Tap Fitting, Basin & Tank Repair',
      bullets: [
        'Concealed pipe leak arrest',
        'Tap, shower & basin fitting',
      ],
      category: 'Plumber',
    },
    {
      id: 'srv-3',
      title: 'AC Specialist',
      badge: 'WARRANTY',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      icon: RefreshCw,
      iconColor: 'text-cyan-400',
      price: '₹499',
      desc: 'Gas Refill, Deep Foam Jet Cleaning & PCB Repair',
      bullets: [
        'High-pressure foam jet wash',
        'Gas leak diagnosis & charging',
      ],
      category: 'AC Specialist',
    },
    {
      id: 'srv-4',
      title: 'Refrigerator Care',
      badge: 'POPULAR',
      badgeColor: 'bg-[#0df2a4]/20 text-[#0df2a4] border-[#0df2a4]/40',
      icon: Tv,
      iconColor: 'text-blue-400',
      price: '₹349',
      desc: 'Single & Double Door Cooling Repair & Gas Refill',
      bullets: [
        'Low cooling & Thermostat fix',
        'Gas leakage & compressor check',
      ],
      category: 'Appliance Repair',
    },
    {
      id: 'srv-5',
      title: 'Washing Machine',
      badge: '',
      icon: RefreshCw,
      iconColor: 'text-teal-400',
      price: '₹349',
      desc: 'Top & Front Load Motor, Drum & Drain Solutions',
      bullets: [
        'Drum spin & vibration balance',
        'Water drain & inlet valve fix',
      ],
      category: 'Appliance Repair',
    },
    {
      id: 'srv-6',
      title: 'RO Water Purifier',
      badge: '',
      icon: Droplets,
      iconColor: 'text-cyan-300',
      price: '₹299',
      desc: 'Filter Replacement, Membrane & TDS Calibration',
      bullets: [
        'Pre-filter & carbon cartridge',
        'RO membrane & booster pump',
      ],
      category: 'RO Water Purifier',
    },
    {
      id: 'srv-7',
      title: 'Laptop & Computer',
      badge: 'HARDWARE',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: Laptop,
      iconColor: 'text-purple-400',
      price: '₹299',
      desc: 'OS Install, Screen, Keyboard & Motherboard',
      bullets: [
        'OS reinstall & SSD upgrade',
        'Screen display & hinge fix',
      ],
      category: 'Electronics',
    },
    {
      id: 'srv-8',
      title: 'Mobile Repair',
      badge: '',
      icon: Smartphone,
      iconColor: 'text-rose-400',
      price: '₹299',
      desc: 'Display Replacement, Battery & Charging Port',
      bullets: [
        'Original folder screen change',
        'Battery health & charging jack',
      ],
      category: 'Electronics',
    },
    {
      id: 'srv-9',
      title: 'TV & Display',
      badge: '',
      icon: Tv,
      iconColor: 'text-indigo-400',
      price: '₹249',
      desc: 'LED/LCD Wall Mount, Motherboard & Sound',
      bullets: [
        'Wall mount bracket installation',
        'Backlight & panel repair',
      ],
      category: 'Electronics',
    },
    {
      id: 'srv-10',
      title: 'House Deep Cleaning',
      badge: '',
      icon: Sparkles,
      iconColor: 'text-emerald-400',
      price: '₹999',
      desc: 'Deep Kitchen, Bathroom, Sofa & Full Home Scrub',
      bullets: [
        'Bathroom hard water descaling',
        'Kitchen degreasing & sanitization',
      ],
      category: 'House Deep Cleaning',
    },
    {
      id: 'srv-11',
      title: 'Painting & Waterproofing',
      badge: 'TOP RATED',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: Paintbrush,
      iconColor: 'text-amber-400',
      price: '₹1,499',
      desc: 'Interior, Exterior, Texture & Damp Treatment',
      bullets: [
        'Wall dampness & seepage proof',
        'Putty smoothening & primer coat',
      ],
      category: 'Painting & Waterproofing',
    },
    {
      id: 'srv-12',
      title: 'Carpenter & Woodwork',
      badge: '',
      icon: Hammer,
      iconColor: 'text-amber-500',
      price: '₹249',
      desc: 'Door Locks, Modular Kitchen & Furniture Repair',
      bullets: [
        'Door lock, hinge & latch fix',
        'Wardrobe & drawer alignment',
      ],
      category: 'Carpenter & Woodwork',
    },
  ];

  // Subscription Care Packages Data
  const packagesList = [
    {
      id: 'pkg-annual-shield',
      name: 'Home Care Annual Shield',
      tag: 'MOST POPULAR',
      iconBadge: '👑 VIP',
      discount: 'SAVE 33%',
      originalPrice: '₹1,499',
      price: '₹999',
      period: '/ per year',
      subtitle: 'Complete year-round electrical, plumbing & RO maintenance protection',
      features: [
        '4 free preventive health check visits',
        'Priority 30-min arrival guarantee',
        '15% discount on genuine replacement spares',
        '30-day extended labor rework warranty',
      ],
      detailedFeatures: [
        {
          title: '4 Free Preventive Health Check Visits',
          desc: 'Quarterly comprehensive inspection across electrical, plumbing & RO water purifier',
        },
        {
          title: 'Priority 30-Min Arrival Guarantee',
          desc: 'Instant VIP queue bypass with dedicated emergency technician dispatch',
        },
        {
          title: '15% Discount on Genuine Spare Parts',
          desc: '100% brand-certified OEM components with official manufacturer warranty',
        },
        {
          title: '30-Day Extended Labor Rework Warranty',
          desc: 'Zero-cost repeat inspection and labor coverage if any issue recurs',
        },
      ],
    },
    {
      id: 'pkg-ac-summer',
      name: 'AC Summer Cool Protector',
      tag: 'SEASONAL DEAL',
      iconBadge: '❄️ COOL',
      discount: 'SAVE 33%',
      originalPrice: '₹1,199',
      price: '₹799',
      period: '/ season',
      subtitle: 'Dedicated foam jet wash, gas top-up & electrical PCB safeguard',
      features: [
        '2 full-pressure indoor foam jet cleans',
        'Outdoor unit fin chemical degreasing',
        'Amperage, wiring & capacitor load audit',
        'Priority summer breakdown response',
      ],
      detailedFeatures: [
        {
          title: '2 Full-Pressure Indoor Foam Jet Cleans',
          desc: 'Deep high-pressure coil wash removing accumulated dust, mold & fungus',
        },
        {
          title: 'Outdoor Condenser Chemical Degreasing',
          desc: 'High-efficiency heat exchange restoration for maximum cooling efficiency',
        },
        {
          title: 'Amperage, Wiring & Gas Pressure Audit',
          desc: 'Refrigerant pressure measurement and motor capacitor stability test',
        },
        {
          title: 'Priority Summer Breakdown Response',
          desc: 'Guaranteed same-day emergency cooling resolution during peak heat',
        },
      ],
    },
    {
      id: 'pkg-electrical-audit',
      name: 'Full Home Electrical Audit',
      tag: 'SAFETY SHIELD',
      iconBadge: '⚡ AUDIT',
      discount: 'SAVE 33%',
      originalPrice: '₹899',
      price: '₹599',
      period: '/ one-time',
      subtitle: 'Comprehensive short-circuit, earthing, and load balancing diagnostics',
      features: [
        'Earth leakage and neutral voltage test',
        'MCB trip sensitivity and rating check',
        'Inverter, stabilizer & heavy appliance audit',
        'Official safety certificate & report',
      ],
      detailedFeatures: [
        {
          title: 'Earth Leakage & Neutral Voltage Testing',
          desc: 'Eliminates dangerous electric shocks, body currents, and neutral fluctuations',
        },
        {
          title: 'MCB Trip Sensitivity & Load Balancing',
          desc: 'Short-circuit surge immunity audit preventing wiring overheating & fires',
        },
        {
          title: 'Inverter, Stabilizer & Heavy Load Check',
          desc: 'High-load appliance wiring inspection (Geyser, AC, refrigerator, oven)',
        },
        {
          title: 'Official Digital Safety Report & Certificate',
          desc: 'Comprehensive certified sign-off documentation for home security and insurance',
        },
      ],
    },
  ];

  // FAQ list with searchable questions
  const faqs = [
    {
      q: 'How fast can a certified technician arrive at my doorstep?',
      a: 'Our average doorstep arrival time across Patna and major Bihar districts is just 45 minutes from booking confirmation. You receive live updates and technician contact details directly via WhatsApp.',
    },
    {
      q: 'Are all technicians background checked and Aadhaar-verified?',
      a: 'Yes, every trade professional on SevaConnect undergoes strict 3-tier verification including biometric Aadhaar authentication, trade skill verification, and local police verification for complete household safety.',
    },
    {
      q: 'How does payment work? Do I need to pay any advance fee?',
      a: 'No advance payment is required! You only pay after the service has been completed to your 100% satisfaction. You can pay via UPI (Google Pay, PhonePe, Paytm), cash, or card, and receive an instant digital invoice.',
    },
    {
      q: 'What if the issue persists or recurs after service?',
      a: 'All doorstep repairs are backed by our 7-Day to 30-Day Free Re-visit Guarantee. If the same problem recurs, our technician will visit and resolve it at zero additional labor cost.',
    },
    {
      q: 'How can I reach the Founder or customer helpline directly?',
      a: 'You can reach our dedicated Admin helpline at 8709107808 or message Admin Mr. Golu Prajapati and Co-Admin Alok Prajapati directly on WhatsApp at 8709107808 available 24/7.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      onNavigate('search', { search: heroSearchQuery.trim() });
    } else {
      onNavigate('search');
    }
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchForm.name || !dispatchForm.phone) return;
    setDispatchSubmitted(true);
  };

  return (
    <div className="bg-[#070e14] text-slate-100 min-h-screen selection:bg-[#0df2a4] selection:text-slate-950">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Reference Video Frame 00:00) */}
      {/* ========================================================================= */}
      <section className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-teal-500/20 overflow-hidden">
        {/* Subtle radial glow backgrounds */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0df2a4]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* LEFT COLUMN: Hero Copy, CTA Buttons, Search Bar & Popular Tags */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-display tracking-tight leading-[1.12]">
                Aapki Zarurat,
                <br />
                <span className="text-[#0df2a4] text-neon-cyan">
                  Hamara Samadhan
                </span>
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-normal">
                Certified Electricians, Plumbers, AC Specialists &amp; Technicians at your doorstep within 45 minutes across <strong>Patna District (All City Zones, Blocks &amp; Rural Villages / हर गाँव)</strong> with transparent upfront pricing.
              </p>

              {/* Service Exclusivity Banner */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/35 text-teal-300 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#0df2a4] shrink-0" />
                <span>Exclusive Service &amp; Offers for Patna District Residents (All Towns &amp; Villages)</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  onClick={() => onOpenBooking()}
                  className="px-6 sm:px-7 py-3.5 rounded-full bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-extrabold text-sm shadow-[0_0_25px_rgba(13,242,164,0.45)] hover:shadow-[0_0_35px_rgba(13,242,164,0.7)] transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-slate-950" />
                  <span>Book Service / Contact Us</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('search')}
                  className="px-6 sm:px-7 py-3.5 rounded-full bg-[#09151e] hover:bg-[#0f2332] text-slate-200 border border-teal-500/40 hover:border-[#0df2a4] text-sm font-bold transition-all flex items-center gap-2 group cursor-pointer shadow-md"
                >
                  <span>Explore Services</span>
                  <ArrowRight className="w-4 h-4 text-[#0df2a4] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Integrated Search Bar Panel matching Video Frame 00:00 */}
              <div className="pt-2">
                <form
                  onSubmit={handleHeroSearch}
                  className="p-2 sm:p-2.5 rounded-2xl bg-[#091621] border border-teal-500/30 hover:border-[#0df2a4]/60 shadow-[0_4px_25px_rgba(0,0,0,0.5)] transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3"
                >
                  {/* Location Segment */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#061017] border border-teal-500/20 text-xs text-slate-200 shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-[#0df2a4]" />
                    <span className="font-semibold">{selectedCity || 'Patna, Bihar'}</span>
                  </div>

                  {/* Input Query */}
                  <div className="relative flex-1 flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={heroSearchQuery}
                      onChange={(e) => setHeroSearchQuery(e.target.value)}
                      placeholder="Search a Service (e.g. Electrician, AC, Plumber...)"
                      className="w-full pl-9 pr-3 py-2 bg-transparent text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none"
                    />
                  </div>

                  {/* Search Submit Button */}
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(13,242,164,0.4)] transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Popular Searches Pills */}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                  <span className="text-slate-400 font-medium">Popular:</span>
                  {popularSearches.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onNavigate('search', { search: item })}
                      className="px-3 py-1 rounded-full bg-[#0a1721] hover:bg-[#0e2433] border border-teal-500/20 hover:border-[#0df2a4]/60 text-slate-300 hover:text-[#0df2a4] transition-all cursor-pointer text-[11px]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Futuristic Animated Service Network Hub */}
            <div className="lg:col-span-5 flex items-center justify-center py-4 lg:py-0">
              <ServiceNetworkAnimation
                onSelectCategory={(category) => onNavigate('search', { category })}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. TRUST & METRICS 4-CARD STRIP (Frames 00:00 - 00:01) */}
      {/* ========================================================================= */}
      <section className="py-8 border-b border-teal-500/20 bg-[#050c12] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: 45-Min Arrival with Note & Link to Webpage */}
            <ScrollReveal
              delay={0}
              distance={24}
              glowOnReveal={true}
              glowColor="rgba(13, 242, 164, 0.35)"
              className="h-full"
            >
              <div
                onClick={() => onNavigate("45-min-arrival")}
                className="cursor-pointer p-4 sm:p-5 rounded-2xl bg-[#08151f] hover:bg-[#0a1c2a] border border-teal-500/30 hover:border-[#0df2a4] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between gap-3 shadow-lg group hover:shadow-[0_12px_30px_rgba(13,242,164,0.28)] relative overflow-hidden h-full"
                title="Click to view 45-Min Arrival Guarantee Terms & Notes"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#0df2a4]/15 border border-[#0df2a4]/30 flex items-center justify-center text-[#0df2a4] group-hover:scale-110 group-hover:border-[#0df2a4]/60 group-hover:shadow-[0_0_16px_rgba(13,242,164,0.4)] transition-all duration-300 shrink-0">
                    <Clock className="w-6 h-6 animate-icon-breathe" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-extrabold text-white font-display group-hover:text-[#0df2a4] transition-colors">
                        45-Min Arrival
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-[#0df2a4]/15 text-[#0df2a4] border border-[#0df2a4]/30 font-mono group-hover:shadow-[0_0_10px_rgba(13,242,164,0.3)] transition-shadow">
                        Policy
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fastest doorstep technician in city
                    </p>
                  </div>
                </div>

                {/* Note points requested by user */}
                <div className="pt-2 border-t border-teal-500/20 flex flex-col gap-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-teal-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0df2a4] shrink-0 animate-ping" />
                    <span>Note: 5-Min dispatch • ₹50 credit if delayed</span>
                  </div>
                  <div className="text-[10px] text-slate-400 group-hover:text-[#0df2a4] transition-colors flex items-center justify-between font-mono">
                    <span>Click to view guarantee policy notes</span>
                    <span className="font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 2: 100% Aadhaar Verified with Note & Modal */}
            <ScrollReveal
              delay={120}
              distance={24}
              glowOnReveal={true}
              glowColor="rgba(6, 182, 212, 0.35)"
              className="h-full"
            >
              <div
                onClick={() => setAadhaarModalOpen(true)}
                className="cursor-pointer p-4 sm:p-5 rounded-2xl bg-[#08151f] hover:bg-[#0a1c2a] border border-teal-500/30 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between gap-3 shadow-lg group hover:shadow-[0_12px_30px_rgba(6,182,212,0.28)] relative overflow-hidden h-full"
                title="Click to view 100% Aadhaar Verification & Safety Notes"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:border-cyan-400/60 group-hover:shadow-[0_0_16px_rgba(6,182,212,0.4)] transition-all duration-300 shrink-0">
                    <ShieldCheck className="w-6 h-6 animate-icon-breathe" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-extrabold text-white font-display group-hover:text-cyan-300 transition-colors">
                        100% Aadhaar Verified
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-cyan-400/15 text-cyan-400 border border-cyan-400/30 font-mono group-hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-shadow">
                        Safety
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Background checked &amp; police verified
                    </p>
                  </div>
                </div>

                {/* Note points */}
                <div className="pt-2 border-t border-teal-500/20 flex flex-col gap-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 animate-ping" />
                    <span>Note: Govt. e-KYC • Police check • OTP entry</span>
                  </div>
                  <div className="text-[10px] text-slate-400 group-hover:text-cyan-300 transition-colors flex items-center justify-between font-mono">
                    <span>Click to view verification notes</span>
                    <span className="font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 3: Pay After Satisfaction */}
            <ScrollReveal
              delay={240}
              distance={24}
              glowOnReveal={true}
              glowColor="rgba(16, 185, 129, 0.35)"
              className="h-full"
            >
              <div
                onClick={() => setUpiModalOpen(true)}
                className="cursor-pointer p-4 sm:p-5 rounded-2xl bg-[#08151f] hover:bg-[#0a1c2a] border border-teal-500/30 hover:border-emerald-400 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between gap-3 shadow-lg group hover:shadow-[0_12px_30px_rgba(16,185,129,0.28)] relative overflow-hidden h-full"
                title="Click to view UPI Payment & QR Code"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:border-emerald-400/60 group-hover:shadow-[0_0_16px_rgba(16,185,129,0.4)] transition-all duration-300 shrink-0">
                    <Wallet className="w-6 h-6 animate-icon-breathe" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-extrabold text-white font-display group-hover:text-emerald-300 transition-colors">
                        Pay After Satisfaction
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-400/15 text-emerald-400 border border-emerald-400/30 font-mono group-hover:shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-shadow">
                        UPI / QR
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Zero advance payment required
                    </p>
                  </div>
                </div>

                {/* Note points */}
                <div className="pt-2 border-t border-teal-500/20 flex flex-col gap-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-ping" />
                    <span>Note: Inspect work first • Pay via QR/UPI/Cash</span>
                  </div>
                  <div className="text-[10px] text-slate-400 group-hover:text-emerald-300 transition-colors flex items-center justify-between font-mono">
                    <span>Click to view UPI QR code &amp; details</span>
                    <span className="font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 4: 7-Day Free Warranty with Note & Modal */}
            <ScrollReveal
              delay={360}
              distance={24}
              glowOnReveal={true}
              glowColor="rgba(245, 158, 11, 0.35)"
              className="h-full"
            >
              <div
                onClick={() => setWarrantyModalOpen(true)}
                className="cursor-pointer p-4 sm:p-5 rounded-2xl bg-[#08151f] hover:bg-[#0a1c2a] border border-teal-500/30 hover:border-amber-400 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between gap-3 shadow-lg group hover:shadow-[0_12px_30px_rgba(245,158,11,0.28)] relative overflow-hidden h-full"
                title="Click to view 7-Day Free Warranty Terms & Notes"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:border-amber-400/60 group-hover:shadow-[0_0_16px_rgba(245,158,11,0.4)] transition-all duration-300 shrink-0">
                    <RefreshCw className="w-6 h-6 animate-icon-breathe" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-extrabold text-white font-display group-hover:text-amber-300 transition-colors">
                        7-Day Free Warranty
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-400/15 text-amber-400 border border-amber-400/30 font-mono group-hover:shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-shadow">
                        Warranty
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Free re-visit if issue not resolved
                    </p>
                  </div>
                </div>

                {/* Note points */}
                <div className="pt-2 border-t border-teal-500/20 flex flex-col gap-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-ping" />
                    <span>Note: ₹0 re-visit fee • Zero labour charge</span>
                  </div>
                  <div className="text-[10px] text-slate-400 group-hover:text-amber-300 transition-colors flex items-center justify-between font-mono">
                    <span>Click to view warranty policy notes</span>
                    <span className="font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. 12 FEATURED SERVICES GRID (Frames 00:01 - 00:05) */}
      {/* ========================================================================= */}
      <section className="py-20 border-b border-teal-500/20 relative overflow-hidden" id="services-section">
        {/* Subtle Scroll Parallax Background Ambient Glow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-gradient-to-b from-[#0df2a4]/8 to-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10 transition-transform duration-100 ease-out"
          style={{
            transform: `translate3d(-50%, calc(-50% + ${(scrollY * 0.05).toFixed(1)}px), 0)`,
          }}
        />
        {/* Subtle decorative floating particles */}
        <div className="absolute top-12 right-12 w-2 h-2 rounded-full bg-[#0df2a4]/30 blur-[1px] animate-float-gentle pointer-events-none" />
        <div className="absolute bottom-16 left-12 w-2.5 h-2.5 rounded-full bg-cyan-400/25 blur-[1px] animate-float-gentle pointer-events-none" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header with Staggered Scroll Reveal */}
          <div className="text-center space-y-3 mb-12">
            <ScrollReveal delay={0} distance={14}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wider bg-[#0df2a4]/15 text-[#0df2a4] border border-[#0df2a4]/30 shadow-[0_0_12px_rgba(13,242,164,0.2)] uppercase font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>FEATURED CERTIFIED SERVICES</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={120} distance={22}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight">
                High-Quality Doorstep Trade Solutions
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={240} distance={16}>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
                Top-rated home repair and maintenance solutions with verified background checks and upfront rates.
              </p>
            </ScrollReveal>
          </div>

          {/* 12-Card Grid (4 cols on lg, 2 cols on md, 1 col on sm) with Staggered Entrance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicesList.map((service, index) => {
              const ServiceIcon = service.icon;
              // Stagger delay based on column and row position
              const staggerDelay = (index % 4) * 90 + Math.floor((index % 8) / 4) * 60;
              const isPopular = service.title === 'House Deep Cleaning';

              return (
                <ScrollReveal
                  key={service.id}
                  delay={staggerDelay}
                  distance={28}
                  duration={650}
                  className="h-full"
                >
                  <div
                    className={`bg-[#091621] hover:bg-[#0a1c2a] border ${
                      isPopular
                        ? 'border-[#0df2a4]/60 animate-pulse-subtle-glow'
                        : 'border-teal-500/25'
                    } hover:border-[#0df2a4] rounded-2xl p-5 shadow-xl hover:shadow-[0_12px_32px_rgba(13,242,164,0.22)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group h-full relative overflow-hidden`}
                  >
                    {/* Top: Icon + Badge */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-[#061017] border border-teal-500/30 flex items-center justify-center group-hover:scale-110 group-hover:border-[#0df2a4]/50 group-hover:shadow-[0_0_15px_rgba(13,242,164,0.35)] transition-all duration-300 shrink-0">
                          <ServiceIcon className={`w-5 h-5 ${service.iconColor} animate-icon-breathe`} />
                        </div>
                        {service.badge && (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${service.badgeColor} group-hover:shadow-[0_0_10px_rgba(13,242,164,0.3)] transition-shadow`}
                          >
                            {service.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-extrabold text-white font-display group-hover:text-[#0df2a4] transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {service.desc}
                      </p>

                      {/* 2 Bullet Points with Teal Checkmarks */}
                      <div className="mt-4 space-y-2 border-t border-teal-900/40 pt-3">
                        {service.bullets.map((bullet, bidx) => (
                          <div key={bidx} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0df2a4] shrink-0 mt-0.5" />
                            <span className="leading-tight">{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom: Price + Book Now Button */}
                    <div className="mt-5 pt-4 border-t border-teal-900/40 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Starts</span>
                        <span className="text-base font-extrabold text-[#0df2a4] font-mono">
                          {service.price}
                        </span>
                      </div>

                      <button
                        onClick={() => onOpenBooking(service.id)}
                        className="px-4 py-2 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-extrabold text-xs shadow-[0_0_15px_rgba(13,242,164,0.35)] hover:shadow-[0_0_22px_rgba(13,242,164,0.55)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>Book Now</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Centered Button: View All Services -> */}
          <ScrollReveal delay={180} distance={18} className="mt-12 text-center">
            <button
              onClick={() => onNavigate('search')}
              className="px-8 py-3.5 rounded-full bg-[#08151f] hover:bg-[#0e2230] text-slate-200 hover:text-[#0df2a4] border border-teal-500/40 hover:border-[#0df2a4] text-sm font-bold shadow-lg hover:shadow-[0_0_25px_rgba(13,242,164,0.3)] transition-all inline-flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
            >
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4 text-[#0df2a4]" />
            </button>
          </ScrollReveal>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. MAINTENANCE & CARE PACKAGES (Full-Screen 3D Cyber Tunnel Animation) */}
      {/* ========================================================================= */}
      <section className="min-h-screen w-full relative flex flex-col justify-center py-12 sm:py-16 border-b border-teal-500/20 overflow-hidden bg-[#02070a]" id="packages-section">
        {/* Full-Screen 3D Cyber Perspective Tunnel Background (Edge-to-Edge 100vw × 100vh) */}
        <div className="absolute inset-0 w-full h-full cyber-tunnel-viewport pointer-events-none overflow-hidden z-0">
          {/* Floor Moving Grid - Extends across entire screen width */}
          <div className="absolute inset-x-[-25%] bottom-0 h-[52%] tunnel-floor opacity-55" />
          {/* Ceiling Moving Grid - Extends across entire screen width */}
          <div className="absolute inset-x-[-25%] top-0 h-[52%] tunnel-ceiling opacity-40" />
          {/* Left Wall Moving Grid */}
          <div className="absolute left-0 top-[-25%] bottom-[-25%] w-[48%] tunnel-wall-left opacity-45" />
          {/* Right Wall Moving Grid */}
          <div className="absolute right-0 top-[-25%] bottom-[-25%] w-[48%] tunnel-wall-right opacity-45" />

          {/* Center Back Portal Frame */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-36 sm:w-80 sm:h-52 tunnel-portal" />

          {/* Horizontal Sweeping Laser Line */}
          <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#0df2a4] to-transparent shadow-[0_0_20px_#0df2a4] animate-laser-sweep pointer-events-none z-0" />

          {/* Concentric Rotating Cyber Circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] sm:w-[720px] sm:h-[720px] rounded-full border border-teal-500/25 animate-rotate-slow pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[540px] sm:h-[540px] rounded-full border border-[#0df2a4]/20 animate-rotate-slow-reverse pointer-events-none border-dashed" />

          {/* Radial Center Breathing Light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-[#0df2a4]/15 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />

          {/* Floating Luminous Ambient Particles */}
          <div className="absolute top-12 left-1/4 w-2 h-2 rounded-full bg-[#0df2a4] animate-particle-1 shadow-[0_0_12px_#0df2a4]" />
          <div className="absolute bottom-16 right-1/4 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-particle-2 shadow-[0_0_14px_#22d3ee]" />
          <div className="absolute top-1/3 right-12 w-2 h-2 rounded-full bg-emerald-400 animate-particle-3 shadow-[0_0_10px_#34d399]" />
          <div className="absolute bottom-1/3 left-12 w-2 h-2 rounded-full bg-teal-300 animate-particle-1 shadow-[0_0_10px_#5eead4]" />
          <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-[#0df2a4] animate-particle-2 shadow-[0_0_10px_#0df2a4]" />
          <div className="absolute bottom-1/4 right-1/3 w-2 h-2 rounded-full bg-cyan-300 animate-particle-3 shadow-[0_0_10px_#22d3ee]" />
        </div>

        {/* Top ambient lighting */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#0df2a4]/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center">
          {/* Subscription Section Content Wrapper (No enclosing box boundary - Floating directly over full-screen grid) */}
          <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center justify-between gap-6">
            {/* The Active Plan Card (Exact Matching Layout & Elements from Video 00:00 - 00:04) */}
            <div className="relative z-10 w-full max-w-2xl mx-auto my-auto bg-[#07131b]/95 border border-[#0df2a4]/70 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(13,242,164,0.35)] backdrop-blur-xl space-y-5 overflow-hidden">
              {/* Diagonal Light Shimmer Animation */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-card-shimmer pointer-events-none" />

              {/* Card Header Row: Red/Coral Start Badge on left + Price on right */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] flex items-center gap-1.5 font-mono cursor-default">
                    <span>➔</span>
                    <span>START NOW</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0df2a4]/20 text-[#0df2a4] border border-[#0df2a4]/50 font-mono">
                    {packagesList[packageIndex].tag}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 line-through mr-2 font-mono">
                    {packagesList[packageIndex].originalPrice}
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-[#0df2a4] font-mono tracking-tight drop-shadow-[0_0_12px_rgba(13,242,164,0.5)]">
                    {packagesList[packageIndex].price}
                  </span>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {packagesList[packageIndex].period}
                  </span>
                </div>
              </div>

              {/* Card Main Body: 2 Columns (Content on Left, 3D Pedestal on Right) */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Left Column: Title, Subtitle, Phone Strip, and 2 Stacked Action Buttons */}
                <div className="flex-1 w-full space-y-4 text-left">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
                      {packagesList[packageIndex].name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                      {packagesList[packageIndex].subtitle}
                    </p>
                  </div>

                  {/* Contact / Inquire strip matching the video's icon & label */}
                  <a
                    href="tel:8709107808"
                    className="inline-flex items-center gap-2 py-1.5 px-3 rounded-xl bg-[#041018] border border-teal-500/30 text-xs text-teal-300 hover:text-[#0df2a4] hover:border-[#0df2a4] transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#0df2a4] shrink-0" />
                    <span>
                      For inquiry &amp; booking: <strong className="text-white">8709107808</strong>
                    </span>
                  </a>

                  {/* Two Stacked Action Buttons (English Only) */}
                  <div className="space-y-2.5 pt-1">
                    {/* Top Button: Dark with Cyan/Teal border (View Details) */}
                    <button
                      onClick={() => setShowPackageDetails(!showPackageDetails)}
                      className="w-full py-3 px-4 rounded-xl bg-[#07131b] hover:bg-teal-950/60 border border-[#0df2a4] text-white hover:text-[#0df2a4] font-bold text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(13,242,164,0.2)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <Eye className="w-4 h-4 text-[#0df2a4]" />
                      <span>
                        {showPackageDetails ? 'Hide Plan Details' : 'View Plan Details & Breakdown'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#0df2a4] transition-transform duration-300 ${
                          showPackageDetails ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Bottom Button: Solid Vibrant Neon Green/Teal (Get It Now) */}
                    <button
                      onClick={() => onOpenBooking()}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(13,242,164,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                      <span>Get It Now • Subscribe</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>

                {/* Right Column: 3D Isometric Glowing Platform with Document & Shield (Matches Video) */}
                <div className="hidden sm:flex flex-col items-center justify-center w-40 shrink-0 relative animate-pedestal-float">
                  {/* Upward Volumetric Cyan Glow Cone */}
                  <div className="absolute bottom-6 w-32 h-36 bg-gradient-to-t from-[#0df2a4]/25 to-transparent blur-md rounded-full pointer-events-none" />

                  <svg viewBox="0 0 160 160" className="w-36 h-36 drop-shadow-[0_0_25px_rgba(13,242,164,0.5)]">
                    <defs>
                      <linearGradient id="pedestalBase" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0df2a4" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#063230" stopOpacity="0.9" />
                      </linearGradient>
                      <linearGradient id="pedestalTop" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1dfcca" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#08544e" stopOpacity="0.9" />
                      </linearGradient>
                      <linearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f8fafc" />
                        <stop offset="100%" stopColor="#cbd5e1" />
                      </linearGradient>
                      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0df2a4" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>

                    {/* Glowing Pedestal Shadow */}
                    <ellipse cx="80" cy="138" rx="55" ry="14" fill="#0df2a4" opacity="0.35" filter="blur(6px)" />

                    {/* Pedestal Bottom Cylinder */}
                    <path d="M35,120 L35,130 C35,138 125,138 125,130 L125,120 Z" fill="url(#pedestalBase)" />

                    {/* Pedestal Top Ellipse */}
                    <ellipse cx="80" cy="120" rx="45" ry="12" fill="url(#pedestalTop)" stroke="#0df2a4" strokeWidth="1.5" />
                    <ellipse cx="80" cy="120" rx="36" ry="8" fill="#072023" stroke="#0df2a4" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Floating Isometric Document Stack */}
                    {/* Back Paper */}
                    <path d="M55,62 L105,48 L115,82 L65,96 Z" fill="#94a3b8" opacity="0.8" />
                    {/* Middle Paper */}
                    <path d="M50,68 L100,54 L110,92 L60,106 Z" fill="#e2e8f0" />
                    {/* Front Paper Sheet */}
                    <path d="M46,74 L96,60 L104,98 L54,112 Z" fill="url(#paperGrad)" stroke="#0df2a4" strokeWidth="1.2" />

                    {/* Document Lines */}
                    <line x1="58" y1="74" x2="88" y2="65" stroke="#0df2a4" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="56" y1="82" x2="92" y2="72" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="58" y1="89" x2="90" y2="79" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="60" y1="96" x2="82" y2="89" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />

                    {/* Official Stamp / Seal on Paper */}
                    <circle cx="86" cy="94" r="7" fill="none" stroke="#0df2a4" strokeWidth="1.5" />
                    <path d="M83,94 L85,96 L89,92" fill="none" stroke="#0df2a4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Floating 3D VIP Shield */}
                    <g transform="translate(68, 22)">
                      <path d="M12,2 L22,6 L22,15 C22,22 12,28 12,28 C12,28 2,22 2,15 L2,6 Z" fill="url(#shieldGrad)" stroke="#ffffff" strokeWidth="1.2" filter="drop-shadow(0 0 6px rgba(13,242,164,0.8))" />
                      <path d="M7,14 L10,17 L17,10" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </g>

                    {/* Floating Sparkles */}
                    <circle cx="36" cy="50" r="1.5" fill="#0df2a4" />
                    <circle cx="124" cy="65" r="2" fill="#0df2a4" />
                    <circle cx="118" cy="38" r="1.5" fill="#22d3ee" />
                  </svg>
                </div>
              </div>

              {/* Expandable Features Accordion (Revealed on clicking "View Plan Details") */}
              {showPackageDetails && (
                <div className="border-t border-teal-900/60 pt-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs text-[#0df2a4] font-bold">
                    <span>What&apos;s Included in {packagesList[packageIndex].name}:</span>
                    <span className="text-slate-400 font-normal">Official Coverage</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {packagesList[packageIndex].detailedFeatures.map((feat, fidx) => (
                      <div
                        key={fidx}
                        className="p-2.5 rounded-xl bg-[#030c12] border border-teal-500/25 flex items-start gap-2.5"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#0df2a4]/15 border border-[#0df2a4]/40 flex items-center justify-center text-[#0df2a4] shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-100 block">{feat.title}</span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">{feat.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="py-2 px-3 rounded-xl bg-[#03090e] border border-teal-500/30 flex items-center justify-between text-[11px] text-slate-300">
                    <span className="flex items-center gap-1.5 text-teal-300 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0df2a4]" />
                      <span>7-Day 100% Money-Back Guarantee</span>
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300 font-medium">Cancel Anytime</span>
                  </div>
                </div>
              )}
            </div>

            {/* Exact Controller from User Screenshot: Prev, Play/Pause, Next + Dots + Display Duration */}
            <div className="relative z-20 mt-6 flex flex-col items-center gap-2.5">
              {/* 1. Circle Buttons Row (< , ⏸/▶ , >) */}
              <div className="flex items-center justify-center gap-3">
                {/* Previous Button */}
                <button
                  onClick={() => setPackageIndex((prev) => (prev > 0 ? prev - 1 : 2))}
                  className="w-11 h-11 rounded-full bg-[#1c2833]/90 border border-slate-700/70 text-slate-300 hover:text-white hover:border-teal-500/60 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md"
                  title="Previous"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Pause / Play Button */}
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="w-13 h-13 rounded-full bg-[#1c2833]/90 border border-slate-700/80 text-slate-200 hover:text-white hover:border-[#0df2a4] flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-lg"
                  title={isAutoPlaying ? 'Pause' : 'Play'}
                  aria-label={isAutoPlaying ? 'Pause' : 'Play'}
                >
                  {isAutoPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Next Button */}
                <button
                  onClick={() => setPackageIndex((prev) => (prev + 1) % 3)}
                  className="w-11 h-11 rounded-full bg-[#1c2833]/90 border border-slate-700/70 text-slate-300 hover:text-white hover:border-teal-500/60 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md"
                  title="Next"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* 2. Indicators Row: Inactive Dots & Active Cyan/Teal Pill */}
              <div className="flex items-center justify-center gap-3 my-1">
                {[0, 1, 2].map((idx) => {
                  const isActive = packageIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setPackageIndex(idx)}
                      className="cursor-pointer transition-all p-1"
                      aria-label={`Select item ${idx + 1}`}
                    >
                      {isActive ? (
                        <div className="w-9 h-3.5 rounded-full bg-[#00a3c4] shadow-[0_0_14px_rgba(0,163,196,0.8)] border border-[#00c8eb]/50" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-[#4a5f6e] hover:bg-slate-400 transition-colors" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 3. Display Duration Row: Dropdown Select + Label + Settings Icon */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-300 mt-1">
                <div className="relative inline-block">
                  <select
                    value={displayDuration}
                    onChange={(e) => setDisplayDuration(Number(e.target.value))}
                    className="appearance-none bg-[#1b2832] border border-slate-700/80 text-slate-200 text-xs rounded-xl pl-3 pr-7 py-1.5 outline-none cursor-pointer hover:border-teal-500/60 font-sans"
                  >
                    <option value={3}>3s</option>
                    <option value={5}>5s</option>
                    <option value={8}>8s</option>
                    <option value={10}>10s</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span className="text-slate-400 text-xs font-sans">Display duration:</span>
                <Settings className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. JOIN AS A SERVICE PARTNER BANNER (Frames 00:06 - 00:07) */}
      {/* ========================================================================= */}
      <section className="py-12 border-b border-teal-500/20 bg-[#061017]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#071720] via-[#091f2c] to-[#0a2737] border border-teal-500/40 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left max-w-2xl">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#0df2a4]/20 text-[#0df2a4] border border-[#0df2a4]/40 font-mono">
                JOIN AS A SERVICE PARTNER
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Are You an Electrician, Plumber, Carpenter or Technician?
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Partner with SevaConnect to receive verified daily bookings in your locality. 0% advance fees, instant 4-digit WhatsApp verification, and direct transparent income.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <button
                onClick={() => onOpenAuth('register-provider')}
                className="px-6 py-3.5 rounded-full bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(13,242,164,0.4)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Register as Provider</span>
              </button>

              <button
                onClick={() => onOpenAuth('login')}
                className="px-6 py-3.5 rounded-full bg-[#08151f] hover:bg-[#0e2433] text-slate-200 border border-teal-500/40 hover:border-[#0df2a4] font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <span>Provider Login</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) (Frames 00:07 - 00:09) */}
      {/* ========================================================================= */}
      <section className="py-20 border-b border-teal-500/20 relative" id="faq-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wider bg-[#0df2a4]/15 text-[#0df2a4] border border-[#0df2a4]/30 uppercase font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight">
              Got Questions? We Have Answers
            </h2>

            <p className="text-slate-300 text-sm sm:text-base">
              Quick answers to common questions about booking, technician verification, and guarantees.
            </p>
          </div>

          {/* Search bar matching Video Frame 00:08 */}
          <div className="relative max-w-xl mx-auto mb-8">
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search questions (e.g. payment, arrival time, pricing)..."
              className="w-full pl-10 pr-4 py-3 bg-[#08151f] border border-teal-500/30 focus:border-[#0df2a4] focus:outline-none rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-[#0df2a4] absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* 5 Accordion Questions */}
          <div className="space-y-3.5">
            {filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#08151f] border border-teal-500/25 hover:border-teal-500/50 rounded-2xl overflow-hidden transition-all shadow-md"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-5 py-4.5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-white">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-[#050c12] border border-teal-500/30 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      expandedFaq === idx ? 'rotate-180 border-[#0df2a4] text-[#0df2a4]' : 'text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {expandedFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-teal-900/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. INSTANT DISPATCH & CONTACT DESK (Frames 00:09 - 00:10, 00:19 - 00:21) */}
      {/* ========================================================================= */}
      <section className="py-20 border-b border-teal-500/20 relative" id="contact-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wider bg-[#0df2a4]/15 text-[#0df2a4] border border-[#0df2a4]/30 uppercase font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DIRECT DISPATCH DESK</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight">
              Instant Dispatch &amp; Contact Desk
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
              Need emergency repair or custom inquiry? Reach our verified dispatch desk directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* LEFT COLUMN: Rapid Response Dispatch Info (Frames 00:09 - 00:10) */}
            <div className="lg:col-span-5 rounded-3xl bg-[#08151f] border border-teal-500/40 p-6 sm:p-8 flex flex-col justify-between shadow-2xl space-y-6">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono inline-block">
                  RAPID RESPONSE DISPATCH
                </span>

                <h3 className="text-2xl font-extrabold text-white font-display">
                  45-Min Guaranteed Doorstep Arrival
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Call our dedicated helpline or message us directly on WhatsApp for instantaneous booking confirmation, price estimate, and technician allocation across Patna.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Toll Free Helpline Box */}
                <a
                  href="tel:8709107808"
                  className="p-4 rounded-2xl bg-[#061017] border border-teal-500/30 hover:border-[#0df2a4] transition-all flex items-center justify-between group block"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#0df2a4]/15 border border-[#0df2a4]/30 flex items-center justify-center text-[#0df2a4]">
                      <Phone className="w-5 h-5 group-hover:animate-bounce" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Toll-Free Helpline
                      </span>
                      <span className="text-lg font-extrabold text-white font-mono group-hover:text-[#0df2a4] transition-colors">8709107808</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#0df2a4] group-hover:translate-x-1 transition-transform" />
                </a>

                {/* WhatsApp Admin Desk Box */}
                <a
                  href="https://wa.me/918709107808"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-2xl bg-[#061017] border border-emerald-500/30 hover:border-emerald-400 transition-all flex items-center justify-between group block"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        WhatsApp Admin Desk
                      </span>
                      <span className="text-lg font-extrabold text-white font-mono group-hover:text-emerald-400 transition-colors">
                        8709107808
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-3 text-xs text-slate-300 pt-2 border-t border-teal-900/40">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>24/7 Booking Support</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-teal-300 font-medium">Patna District (All Towns &amp; Villages)</span>
              </div>
            </div>

            {/* RIGHT COLUMN: Dispatch Request Form (Frames 00:09 - 00:10) */}
            <div className="lg:col-span-7 rounded-3xl bg-[#08151f] border border-teal-500/40 p-6 sm:p-8 shadow-2xl">
              <h3 className="text-xl font-extrabold text-white font-display mb-5 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#0df2a4]" />
                <span>Instant Dispatch Form</span>
              </h3>

              {dispatchSubmitted ? (
                <div className="p-6 bg-[#0df2a4]/15 border border-[#0df2a4]/50 rounded-2xl text-center space-y-3 text-[#0df2a4] my-auto">
                  <CheckCircle2 className="w-12 h-12 mx-auto" />
                  <h4 className="font-bold text-lg text-white">
                    Dispatch Request Submitted!
                  </h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Our Patna control room has received your request for <strong>{dispatchForm.service}</strong>. A verified technician will call you within 5 minutes.
                  </p>
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/918709107808?text=${encodeURIComponent(
                        `Hi SevaConnect, I submitted a dispatch request for ${dispatchForm.service} in ${dispatchForm.locality}. Name: ${dispatchForm.name}, Phone: ${dispatchForm.phone}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Confirm via WhatsApp Directly</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDispatchSubmit} className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-semibold block">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={dispatchForm.name}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, name: e.target.value })}
                        placeholder="Enter your name"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#050c12] border border-teal-500/30 text-white placeholder-slate-500 focus:border-[#0df2a4] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-semibold block">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={dispatchForm.phone}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, phone: e.target.value })}
                        placeholder="09782 41258"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#050c12] border border-teal-500/30 text-white placeholder-slate-500 focus:border-[#0df2a4] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-semibold block">Required Service *</label>
                      <select
                        value={dispatchForm.service}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, service: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#050c12] border border-teal-500/30 text-white focus:border-[#0df2a4] focus:outline-none cursor-pointer"
                      >
                        <option value="Electrician">Electrician &amp; Wiring</option>
                        <option value="Plumber">Plumber &amp; Pipe Leakage</option>
                        <option value="AC Specialist">AC Specialist &amp; Jet Clean</option>
                        <option value="RO Water Purifier">RO Water Purifier</option>
                        <option value="Appliance Repair">Appliance / Refrigerator</option>
                        <option value="House Deep Cleaning">House Deep Cleaning</option>
                        <option value="Carpenter & Woodwork">Carpenter &amp; Woodwork</option>
                        <option value="Painting & Waterproofing">Painting &amp; Waterproofing</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-semibold block">Patna Locality / Block / Village *</label>
                      <input
                        type="text"
                        required
                        value={dispatchForm.locality}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, locality: e.target.value })}
                        placeholder="e.g. Boring Road, Bihta, Naubatpur, Patna"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#050c12] border border-teal-500/30 text-white placeholder-slate-500 focus:border-[#0df2a4] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold block">Issue Description (Optional)</label>
                    <textarea
                      rows={3}
                      value={dispatchForm.issue}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, issue: e.target.value })}
                      placeholder="e.g. AC not cooling, wire sparking, tap leaking..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#050c12] border border-teal-500/30 text-white placeholder-slate-500 focus:border-[#0df2a4] focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(13,242,164,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Instant Dispatch Request</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. SECURE & FLEXIBLE PAYMENT METHODS STRIP (Frames 00:10 - 00:11, 00:18) */}
      {/* ========================================================================= */}
      <section className="py-12 border-b border-teal-500/20 bg-[#050b10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-display flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0df2a4]" />
              <span>SECURE &amp; FLEXIBLE PAYMENT METHODS</span>
            </h3>

            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Pay after 100% job satisfaction via UPI, QR, Cash, or Net Banking with official GST invoice.
            </p>

            {/* Badges strip matching Frames 00:10 - 00:11 */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              {/* 1. UPI & QR Scan (Interactive: opens QR code & payment modal) */}
              <button
                type="button"
                onClick={() => setUpiModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#08151f] hover:bg-[#0d2232] border border-teal-500/30 hover:border-[#0df2a4] text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 shadow-md cursor-pointer transition-all group"
                title="Click to view & scan official UPI QR Code"
              >
                <span className="w-2 h-2 rounded-full bg-[#0df2a4] animate-pulse" />
                <span>UPI &amp; QR Scan</span>
                <span className="text-[10px] text-teal-400 font-normal ml-0.5 group-hover:underline">
                  (Click to Scan)
                </span>
              </button>

              {/* 2. Official UPI ID with dynamic context value */}
              <button
                type="button"
                onClick={() => setUpiModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#08151f] hover:bg-[#0d2232] border border-cyan-500/40 hover:border-cyan-300 text-xs font-semibold text-[#0df2a4] flex items-center gap-2 shadow-md font-mono cursor-pointer transition-all group"
                title="Click to view QR & Scan"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>UPI: {merchantUpiId || 'ravikanhauli91@ptyes'}</span>
                <span className="text-[10px] text-slate-400 font-sans font-normal ml-1 group-hover:text-cyan-300">
                  (Click to Scan QR)
                </span>
              </button>

              {/* 3. Google Pay / PhonePe / Paytm (Interactive: opens UPI apps & QR modal) */}
              <button
                type="button"
                onClick={() => setUpiModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#08151f] hover:bg-[#0d2232] border border-emerald-500/40 hover:border-emerald-300 text-xs font-semibold text-emerald-300 hover:text-white flex items-center gap-2 shadow-md cursor-pointer transition-all group"
                title="Click to pay via Google Pay, PhonePe, or Paytm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Google Pay / PhonePe / Paytm</span>
                <span className="text-[10px] text-slate-400 font-sans font-normal ml-0.5 group-hover:text-emerald-300">
                  (Click to Pay)
                </span>
              </button>

              {/* 4. Cash After Satisfaction (Opens dedicated Note & Policy Webpage) */}
              <button
                type="button"
                onClick={() => onNavigate('cash-satisfaction-policy')}
                className="px-4 py-2 rounded-xl bg-[#08151f] hover:bg-amber-950/30 border border-amber-500/40 hover:border-amber-400 text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-2 shadow-md cursor-pointer transition-all group"
                title="Click to read Cash After Satisfaction Policy & Note Points"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Cash After Satisfaction</span>
                <span className="text-[10px] text-amber-400/80 font-normal ml-0.5 group-hover:underline flex items-center gap-0.5">
                  (Read Note Points ↗)
                </span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('cash-satisfaction-policy')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold text-teal-300 hover:text-white bg-teal-950/40 hover:bg-teal-900/50 border border-teal-500/30 hover:border-teal-400 transition-all cursor-pointer shadow-sm"
                title="View 7-Day Warranty Details & Protection Policy"
              >
                <span>🛡️ 7-Day Labor Warranty Included on All Bookings</span>
                <span className="text-[10px] text-[#0df2a4] font-semibold underline ml-1">
                  View Guarantee ↗
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FOUNDER'S QUALITY GUARANTEE BOX (Frames 00:11 - 00:12, 00:17 - 00:18) */}
      {/* ========================================================================= */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#08151f] border-2 border-[#0df2a4]/50 shadow-[0_0_35px_rgba(13,242,164,0.25)] text-center space-y-4">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#0df2a4]/20 text-[#0df2a4] border border-[#0df2a4]/40 font-mono inline-block">
              FOUNDER'S QUALITY GUARANTEE • MR. GOLU PRAJAPATI
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-white font-display leading-tight italic">
              "Your convenience and safety is our foremost commitment."
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              For urgent assistance, commercial bookings, or any technician queries, connect directly with our Patna dispatch desk.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a
                href="tel:8709107808"
                className="px-6 py-3 rounded-full bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(13,242,164,0.4)] transition-all flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call 8709107808</span>
              </a>

              <a
                href="https://wa.me/918709107808"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-full bg-[#050c12] hover:bg-[#0b1720] text-emerald-400 border border-emerald-500/40 hover:border-emerald-400 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Desk</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Scroll to Top Button matching Video */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          title="Scroll to Top"
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[#08151e] border-2 border-[#0df2a4] text-[#0df2a4] flex items-center justify-center shadow-[0_0_20px_rgba(13,242,164,0.45)] hover:bg-[#0df2a4] hover:text-slate-950 transition-all cursor-pointer"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
      <UpiPaymentModal isOpen={upiModalOpen} onClose={() => setUpiModalOpen(false)} />
      <AadhaarVerifiedModal
        isOpen={aadhaarModalOpen}
        onClose={() => setAadhaarModalOpen(false)}
        onOpenBooking={() => onOpenBooking()}
      />
      <WarrantyModal
        isOpen={warrantyModalOpen}
        onClose={() => setWarrantyModalOpen(false)}
        onOpenBooking={() => onOpenBooking()}
      />
    </div>
  );
}