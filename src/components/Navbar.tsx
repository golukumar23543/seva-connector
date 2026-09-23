import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { NotificationsPopover } from './NotificationsPopover.tsx';
import { BrandLogo } from './BrandLogo.tsx';
import { AdminLoginModal } from './AdminLoginModal.tsx';
import { ViewProfileModal } from './profile/ViewProfileModal.tsx';
import { EditProfileModal } from './profile/EditProfileModal.tsx';
import {
  Wrench,
  MapPin,
  Search,
  User,
  ShieldCheck,
  Calendar,
  Briefcase,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Sparkles,
  Award,
  Zap,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  Package,
  HelpCircle,
  Headphones,
  Settings,
  Edit3,
  Camera,
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: (tab?: 'login' | 'register-customer' | 'register-provider') => void;
  selectedCity: string;
  selectedArea: string;
  onSelectLocation?: (city: string, area: string) => void;
  onLocationChange?: (city: string, area: string) => void;
  onOpenBooking?: () => void;
}

export function Navbar({
  currentPage,
  onNavigate,
  onOpenAuth,
  selectedCity,
  selectedArea,
  onSelectLocation,
  onLocationChange,
  onOpenBooking,
}: NavbarProps) {
  const handleLocationUpdate = (city: string, area: string) => {
    if (onLocationChange) onLocationChange(city, area);
    if (onSelectLocation) onSelectLocation(city, area);
    setLocationDropdownOpen(false);
  };

  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [moreNavOpen, setMoreNavOpen] = useState(false);
  const [isDaylight, setIsDaylight] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Hidden Admin Login Trigger: 5 consecutive clicks within 2 seconds
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [rippleActive, setRippleActive] = useState(false);
  const clickCountRef = useRef<number>(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rippleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const moreNavRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      if (rippleTimerRef.current) clearTimeout(rippleTimerRef.current);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationDropdownOpen(false);
      }
      if (moreNavRef.current && !moreNavRef.current.contains(e.target as Node)) {
        setMoreNavOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    setRippleActive(true);
    if (rippleTimerRef.current) clearTimeout(rippleTimerRef.current);
    rippleTimerRef.current = setTimeout(() => {
      setRippleActive(false);
    }, 450);

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }

    clickCountRef.current += 1;

    if (clickCountRef.current === 5) {
      clickCountRef.current = 0;
      setAdminModalOpen(true);
    } else {
      if (clickCountRef.current === 1 && currentPage !== 'home') {
        onNavigate('home');
      }
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 2000);
    }
  };

  const toggleDaylight = () => {
    setIsDaylight(!isDaylight);
    if (!isDaylight) {
      document.documentElement.classList.add('daylight-mode');
    } else {
      document.documentElement.classList.remove('daylight-mode');
    }
  };

  const handleNavToSection = (sectionId: string) => {
    if (currentPage !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const locationGroups = [
    {
      groupTitle: 'Patna City & Urban Zones',
      city: 'Patna',
      badge: 'Urban Express Hubs',
      areas: [
        'Boring Road',
        'Kankarbagh',
        'Bailey Road',
        'Raja Bazar',
        'Danapur',
        'Patliputra Colony',
        'Ashiana Nagar',
        'Fraser Road',
        'Rajendra Nagar',
        'Saguna More',
        'Digha',
        'Khagaul',
        'Phulwari Sharif',
        'Patna City',
      ],
    },
    {
      groupTitle: 'Patna District Blocks & Villages (हर गाँव)',
      city: 'Patna',
      badge: '100% Village Coverage',
      areas: [
        'Bihta (बिहटा)',
        'Naubatpur (नौबतपुर)',
        'Maner (मनेर)',
        'Fatuha (फतुहा)',
        'Bakhtiyarpur (बख्तियारपुर)',
        'Masaurhi (मसौढ़ी)',
        'Paliganj (पालीगंज)',
        'Bikram (विक्रम)',
        'Sampatchak (संपतचक)',
        'Punpun (पुनपुन)',
        'Daniyawan (दनियावां)',
        'Barh (बाढ़)',
        'Mokama (मोकामा)',
        'Athmalgola (अथमलगोला)',
        'Belchhi (बेलछी)',
        'Dhanarua (धनरूआ)',
        'Dulhin Bazar (दुल्हिन बाज़ार)',
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#071117]/95 backdrop-blur-md border-b border-[#0df2a4]/20 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20 gap-2 sm:gap-3 lg:gap-4 xl:gap-5">
          
          {/* LEFT: Brand Logo + Location Selector */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleLogoClick}
              className="group text-left relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0df2a4]/50 rounded-2xl cursor-pointer select-none shrink-0"
              title="SevaConnect - Click to go Home"
              aria-label="SevaConnect Home"
            >
              {rippleActive && (
                <span className="absolute inset-0 rounded-2xl border-2 border-[#0df2a4]/70 animate-ping pointer-events-none opacity-80" />
              )}
              <BrandLogo size="md" showSubtitle={false} />
            </motion.button>

            {/* Location Selector Pill */}
            <div className="relative" ref={locationRef}>
              <button
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#091822] hover:bg-[#0f2433] border border-teal-500/30 hover:border-[#0df2a4]/60 text-xs font-semibold text-slate-200 transition-all shadow-sm shrink-0"
                title="Change Service Area"
              >
                <MapPin className="w-3.5 h-3.5 text-[#0df2a4] shrink-0" />
                <span className="truncate max-w-[85px] md:max-w-[105px] xl:max-w-[125px] 2xl:max-w-[145px] font-medium text-slate-300">
                  {selectedArea || 'Boring Road'}, {selectedCity || 'Patna'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {locationDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-[#091822] rounded-2xl shadow-2xl border border-teal-500/40 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl max-h-[440px] overflow-y-auto">
                  <div className="pb-2.5 mb-2.5 border-b border-teal-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#0df2a4]" />
                        <span>Select Patna Area / Village</span>
                      </span>
                      <span className="text-[10px] text-[#0df2a4] font-medium block mt-0.5">
                        Exclusive Service Area: Patna District (All Localities &amp; Villages)
                      </span>
                    </div>
                    <button
                      onClick={() => setLocationDropdownOpen(false)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Territory Notice */}
                  <div className="p-2 mb-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-[11px] text-teal-200">
                    📍 <strong>Patna District Exclusive:</strong> Special offers and doorstep services are currently live exclusively for users with a Patna address across all city zones and rural villages!
                  </div>

                  <div className="space-y-3.5">
                    {locationGroups.map((grp) => (
                      <div key={grp.groupTitle} className="space-y-1.5">
                        <div className="flex items-center justify-between px-2 py-1 bg-[#061017] rounded-lg border border-teal-500/15">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0df2a4]">
                            {grp.groupTitle}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold">
                            {grp.badge}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 pt-0.5">
                          {grp.areas.map((area) => {
                            const isSelected = selectedCity === grp.city && selectedArea === area;
                            return (
                              <button
                                key={area}
                                onClick={() => handleLocationUpdate(grp.city, area)}
                                className={`text-left px-2.5 py-1.5 text-xs rounded-lg transition-all truncate cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#0df2a4] text-slate-950 font-bold shadow-sm'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`}
                                title={area}
                              >
                                {area}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CENTER: PRIMARY NAVIGATION LINKS */}
          <nav className="hidden xl:flex items-center gap-1 xl:gap-1.5 text-xs font-semibold text-slate-300 min-w-0">
            <button
              onClick={() => {
                if (currentPage === 'home') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  onNavigate('home');
                }
              }}
              className={`px-2.5 xl:px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                currentPage === 'home'
                  ? 'text-[#0df2a4] bg-[#0c222e] border border-teal-500/40 font-bold'
                  : 'hover:text-white hover:bg-[#0c1f2b]'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavToSection('services-section')}
              className="px-2.5 xl:px-3 py-1.5 rounded-full hover:text-white hover:bg-[#0c1f2b] transition-all cursor-pointer whitespace-nowrap"
            >
              Services
            </button>

            <button
              onClick={() => onNavigate('45-min-arrival')}
              className={`px-2.5 xl:px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentPage === '45-min-arrival'
                  ? 'text-[#0df2a4] bg-[#0c222e] border border-teal-500/40 font-bold'
                  : 'hover:text-white hover:bg-[#0c1f2b]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#0df2a4]" />
              <span>45-Min SLA</span>
            </button>

            <button
              onClick={() => onNavigate('search')}
              className={`px-2.5 xl:px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentPage === 'search'
                  ? 'text-[#0df2a4] bg-[#0c222e] border border-teal-500/40 font-bold'
                  : 'hover:text-white hover:bg-[#0c1f2b]'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#0df2a4]" />
              <span>Technicians</span>
            </button>

            {/* Structured More Dropdown */}
            <div className="relative" ref={moreNavRef}>
              <button
                onClick={() => setMoreNavOpen(!moreNavOpen)}
                className={`px-2.5 xl:px-3 py-1.5 rounded-full hover:text-white hover:bg-[#0c1f2b] transition-all cursor-pointer flex items-center gap-1 text-slate-300 ${
                  moreNavOpen
                    ? 'text-[#0df2a4] bg-[#0c222e] border border-teal-500/40 font-bold'
                    : ''
                }`}
              >
                <span>More</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    moreNavOpen ? 'rotate-180 text-[#0df2a4]' : ''
                  }`}
                />
              </button>

              {moreNavOpen && (
                <div className="absolute left-0 mt-2 w-44 bg-[#091822] rounded-2xl shadow-2xl border border-teal-500/35 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl space-y-0.5">
                  <button
                    onClick={() => {
                      handleNavToSection('packages-section');
                      setMoreNavOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#112534] hover:text-[#0df2a4] rounded-xl transition-colors flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <span>📦 Packages</span>
                  </button>
                  <button
                    onClick={() => {
                      handleNavToSection('faq-section');
                      setMoreNavOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#112534] hover:text-[#0df2a4] rounded-xl transition-colors flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <span>❓ FAQs</span>
                  </button>
                  <button
                    onClick={() => {
                      handleNavToSection('contact-section');
                      setMoreNavOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#112534] hover:text-[#0df2a4] rounded-xl transition-colors flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <span>📞 Contact</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Subtle vertical divider between Nav and Right Controls */}
          <div className="hidden xl:block h-6 w-px bg-teal-500/25 shrink-0 mx-1 lg:mx-2" />

          {/* RIGHT: Quick Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 shrink-0">
            {/* Direct Book Service CTA button */}
            {onOpenBooking && (
              <button
                onClick={() => onOpenBooking()}
                className="hidden sm:flex px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-black bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 shadow-[0_0_15px_rgba(13,242,164,0.35)] hover:shadow-[0_0_22px_rgba(13,242,164,0.6)] transition-all items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Book Service</span>
              </button>
            )}

            {/* Notifications Popover for every user (both logged in and guest visitors) */}
            <NotificationsPopover
              onNavigateBooking={() => onNavigate('customer-dashboard')}
              onNavigateDashboard={(dash) => onNavigate(dash)}
              onOpenAuthModal={() => onOpenAuth('login')}
            />

            {/* Customer Bookings shortcut if logged in */}
            {user?.role === 'CUSTOMER' && (
              <button
                onClick={() => onNavigate('customer-dashboard')}
                className={`hidden 2xl:flex px-3 py-1.5 rounded-full text-xs font-semibold items-center gap-1.5 transition-all shrink-0 ${
                  currentPage === 'customer-dashboard'
                    ? 'bg-[#0df2a4] text-slate-950 font-bold shadow-[0_0_12px_rgba(13,242,164,0.4)]'
                    : 'bg-[#0c1a24] text-[#0df2a4] border border-teal-500/30 hover:bg-[#112431]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>My Bookings</span>
              </button>
            )}

            {/* Login / Sign Up Button or User Profile */}
            {!user ? (
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all bg-[#0d2836] hover:bg-[#0df2a4] text-[#0df2a4] hover:text-slate-950 border border-[#0df2a4]/60 hover:border-[#0df2a4] shadow-sm flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  id="btn-customer-profile-dropdown"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-3 bg-[#0a1721] hover:bg-[#102433] border border-teal-500/30 hover:border-[#0df2a4]/60 rounded-full transition-all cursor-pointer"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-[#0df2a4]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#0df2a4]/20 text-[#0df2a4] font-bold text-xs flex items-center justify-center border border-[#0df2a4]/40">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-100 hidden sm:inline truncate max-w-[85px] xl:max-w-[100px]">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-[#0a1721] rounded-2xl shadow-2xl border border-teal-500/30 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                    {/* Top Customer / User Info */}
                    <div className="p-2.5 border-b border-teal-900/40 flex items-center gap-2.5">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-[#0df2a4] shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#0df2a4]/20 text-[#0df2a4] font-bold text-xs flex items-center justify-center border border-[#0df2a4]/40 shrink-0">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-teal-300/70 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="py-1.5 space-y-0.5">
                      {/* View Profile */}
                      <button
                        id="btn-dropdown-view-profile"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setViewProfileOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#112534] hover:text-[#0df2a4] rounded-lg flex items-center justify-between transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <User className="w-3.5 h-3.5 text-[#0df2a4]" />
                          <span className="font-medium">View Profile</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          VIP
                        </span>
                      </button>

                      {/* Add / Change Photo */}
                      <button
                        id="btn-dropdown-change-photo"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setViewProfileOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#112534] hover:text-[#0df2a4] rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#0df2a4]" />
                        <span className="font-medium">Add / Change Photo</span>
                      </button>

                      {/* Edit Profile */}
                      <button
                        id="btn-dropdown-edit-profile"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setEditProfileOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#112534] hover:text-[#0df2a4] rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#0df2a4]" />
                        <span className="font-medium">Edit Profile Details</span>
                      </button>

                      {user.role === 'CUSTOMER' && (
                        <button
                          id="btn-dropdown-my-bookings"
                          onClick={() => {
                            onNavigate('customer-dashboard');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#112534] hover:text-[#0df2a4] rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#0df2a4]" />
                          <span className="font-medium">My Bookings</span>
                        </button>
                      )}

                      {user.role === 'PROVIDER' && (
                        <button
                          id="btn-dropdown-provider-dash"
                          onClick={() => {
                            onNavigate('provider-dashboard');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#112534] hover:text-amber-300 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-medium">Partner Dashboard</span>
                        </button>
                      )}

                      {user.role === 'ADMIN' && (
                        <button
                          id="btn-dropdown-admin-center"
                          onClick={() => {
                            onNavigate('admin-dashboard');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#112534] hover:text-emerald-300 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-medium">Admin Control Center</span>
                        </button>
                      )}

                      <button
                        id="btn-dropdown-sign-out"
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2.5 mt-1 border-t border-teal-900/30 pt-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Daylight Theme Toggle Button (Grouped with Settings & Preferences) */}
            <button
              onClick={toggleDaylight}
              title={isDaylight ? "Switch to Dark Mode" : "Switch to Daylight Mode"}
              aria-label="Toggle Theme"
              className={`hidden md:flex w-9 h-9 items-center justify-center rounded-full text-xs font-semibold border transition-all shrink-0 cursor-pointer ${
                isDaylight
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                  : 'bg-[#0a1721] text-amber-400 border-slate-700/60 hover:border-[#0df2a4]/50 hover:bg-[#102433]'
              }`}
            >
              <span className="text-sm">{isDaylight ? '🌙' : '☀️'}</span>
            </button>

            {/* Settings Button */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                title="Settings & Preferences"
                aria-label="Settings"
                className="hidden md:flex w-9 h-9 items-center justify-center rounded-full bg-[#0a1721] border border-slate-700/60 hover:border-teal-500/50 text-slate-300 hover:text-white hover:bg-[#102433] transition-all shrink-0 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-teal-400" />
              </button>

              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0a1721] rounded-2xl shadow-2xl border border-teal-500/30 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-teal-900/40">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-[#0df2a4]" />
                      Preferences &amp; Platform Info
                    </span>
                    <button
                      onClick={() => setSettingsOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2.5 pt-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 text-slate-300">
                      <span>Primary Hub:</span>
                      <span className="font-semibold text-[#0df2a4]">Patna, Bihar</span>
                    </div>
                    <div className="flex items-center justify-between py-1 text-slate-300">
                      <span>Coverage:</span>
                      <span className="font-semibold text-white">Patna District (All Towns &amp; Villages)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 text-slate-300">
                      <span>Currency:</span>
                      <span className="font-mono text-white">INR (₹)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 text-slate-300">
                      <span>Admin Desk:</span>
                      <a href="tel:8709107808" className="text-emerald-400 font-bold hover:underline font-mono">
                        8709107808
                      </a>
                    </div>
                    <div className="flex items-center justify-between py-1 text-slate-300">
                      <span>Co-Admin:</span>
                      <a href="tel:8409021577" className="text-teal-300 font-bold hover:underline font-mono">
                        8409021577
                      </a>
                    </div>
                    <div className="flex items-center justify-between py-1 text-slate-300">
                      <span>WhatsApp:</span>
                      <a
                        href="https://wa.me/918709107808"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0df2a4] font-bold hover:underline font-mono"
                      >
                        8709107808
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-[#0b1720] border border-teal-500/20 text-slate-300 hover:text-[#0df2a4] xl:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 3. MOBILE NAVIGATION DRAWER */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-teal-900/40 py-4 space-y-4 animate-in fade-in duration-200">
            {/* Mobile Location Selector */}
            <div className="p-3 bg-[#08151f] rounded-xl border border-teal-500/20">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0df2a4]" />
                <span>Current Service Location</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { city: 'Patna', area: 'Boring Road' },
                  { city: 'Patna', area: 'Kankarbagh' },
                  { city: 'Patna', area: 'Bailey Road' },
                  { city: 'Patna', area: 'Danapur' },
                  { city: 'Patna', area: 'Bihta (बिहटा)' },
                  { city: 'Patna', area: 'Naubatpur (नौबतपुर)' },
                  { city: 'Patna', area: 'Fatuha (फतुहा)' },
                  { city: 'Patna', area: 'Masaurhi (मसौढ़ी)' },
                ].map((loc) => {
                  const isSelected = selectedCity === loc.city && selectedArea === loc.area;
                  return (
                    <button
                      key={`${loc.city}-${loc.area}`}
                      onClick={() => handleLocationUpdate(loc.city, loc.area)}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-[#0df2a4] text-slate-950 font-bold'
                          : 'bg-[#061017] text-slate-300 border border-teal-500/20'
                      }`}
                    >
                      {loc.area}, {loc.city}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2.5 rounded-xl bg-[#091822] text-slate-200 hover:text-[#0df2a4] text-xs font-semibold flex items-center gap-2 border border-teal-500/20"
              >
                <span>🏠 Home</span>
              </button>

              <button
                onClick={() => handleNavToSection('services-section')}
                className="text-left px-3 py-2.5 rounded-xl bg-[#091822] text-slate-200 hover:text-[#0df2a4] text-xs font-semibold flex items-center gap-2 border border-teal-500/20"
              >
                <span>🛠️ Services</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('45-min-arrival');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2.5 rounded-xl bg-[#091822] text-[#0df2a4] hover:text-[#00f5c4] text-xs font-bold flex items-center gap-2 border border-teal-500/20"
              >
                <span>⚡ 45-Min SLA</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('search');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2.5 rounded-xl bg-[#091822] text-slate-200 hover:text-[#0df2a4] text-xs font-semibold flex items-center gap-2 border border-teal-500/20"
              >
                <span>🔍 Technicians</span>
              </button>

              <button
                onClick={() => handleNavToSection('packages-section')}
                className="text-left px-3 py-2.5 rounded-xl bg-[#091822] text-slate-200 hover:text-[#0df2a4] text-xs font-semibold flex items-center gap-2 border border-teal-500/20"
              >
                <span>📦 Care Packages</span>
              </button>

              <button
                onClick={() => handleNavToSection('faq-section')}
                className="text-left px-3 py-2.5 rounded-xl bg-[#091822] text-slate-200 hover:text-[#0df2a4] text-xs font-semibold flex items-center gap-2 border border-teal-500/20"
              >
                <span>❓ FAQs</span>
              </button>

              <button
                onClick={() => handleNavToSection('contact-section')}
                className="text-left px-3 py-2.5 rounded-xl bg-[#091822] text-slate-200 hover:text-[#0df2a4] text-xs font-semibold flex items-center gap-2 border border-teal-500/20 col-span-2"
              >
                <span>📞 Contact &amp; Dispatch Desk</span>
              </button>
            </div>

            {/* Direct Helpline Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-teal-900/30">
              <a
                href="tel:8709107808"
                className="py-2.5 px-3 rounded-xl bg-[#061914] border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold text-center flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Admin: 8709107808</span>
              </a>

              <a
                href="tel:8409021577"
                className="py-2.5 px-3 rounded-xl bg-[#07161f] border border-[#0df2a4]/40 text-[#0df2a4] font-mono text-xs font-bold text-center flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Co-Admin: 8409021577</span>
              </a>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-teal-900/30">
              <button
                onClick={() => {
                  onNavigate('search');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-3 rounded-xl bg-[#0a1721] border border-teal-500/30 text-xs text-white text-center font-bold"
              >
                Explore Services
              </button>

              {onOpenBooking && (
                <button
                  onClick={() => {
                    onOpenBooking();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#0df2a4] text-slate-950 text-xs text-center font-extrabold shadow-[0_0_15px_rgba(13,242,164,0.3)]"
                >
                  ⚡ Book Service Now
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden Admin Login Modal triggered strictly by 5 consecutive clicks on the logo */}
      <AdminLoginModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onSuccess={() => {
          setAdminModalOpen(false);
          onNavigate('admin-dashboard');
        }}
      />

      {/* Customer / User View Profile Modal */}
      <ViewProfileModal
        isOpen={viewProfileOpen}
        onClose={() => setViewProfileOpen(false)}
        onOpenEdit={() => {
          setViewProfileOpen(false);
          setEditProfileOpen(true);
        }}
        user={user}
      />

      {/* Customer / User Edit Profile Modal */}
      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        onSuccess={() => {
          setEditProfileOpen(false);
          setViewProfileOpen(true);
        }}
        user={user}
      />
    </header>
  );
}
