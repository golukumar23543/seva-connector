import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme, type ThemeMode } from '../context/ThemeContext.tsx';
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
  Palette,
  Check,
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
  const { theme, setTheme, isLight, toggleLightDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [paletteDropdownOpen, setPaletteDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [moreNavOpen, setMoreNavOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Hidden Admin Login Trigger: 5 consecutive clicks within 2 seconds
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [rippleActive, setRippleActive] = useState(false);
  const clickCountRef = useRef<number>(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rippleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
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
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setPaletteDropdownOpen(false);
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

  const themeOptions: { id: ThemeMode; name: string; desc: string; icon: string; dot: string }[] = [
    {
      id: 'royal-sapphire',
      name: 'Royal Sapphire',
      desc: 'Royal Blue & Gold (Default)',
      icon: '🔷',
      dot: 'bg-blue-500',
    },
    {
      id: 'pearl-light',
      name: 'Pearl White Light',
      desc: 'Clean White (Daylight Mode)',
      icon: '☀️',
      dot: 'bg-slate-200 border border-slate-400',
    },
    {
      id: 'sunset-amber',
      name: 'Sunset Amber',
      desc: 'Sunset Amber & Charcoal',
      icon: '🌅',
      dot: 'bg-amber-500',
    },
    {
      id: 'emerald-slate',
      name: 'Emerald Forest',
      desc: 'Classic Emerald & Slate',
      icon: '🌲',
      dot: 'bg-emerald-500',
    },
  ];

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
      groupTitle: 'Patna District Blocks & Villages',
      city: 'Patna',
      badge: '100% Village Coverage',
      areas: [
        'Bihta',
        'Naubatpur',
        'Maner',
        'Fatuha',
        'Bakhtiyarpur',
        'Masaurhi',
        'Paliganj',
        'Bikram',
        'Sampatchak',
        'Punpun',
        'Daniyawan',
        'Barh',
        'Mokama',
        'Athmalgola',
        'Belchhi',
        'Dhanarua',
        'Dulhin Bazar',
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0f172a]/95 backdrop-blur-xl border-b border-slate-800 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20 gap-2 sm:gap-3 lg:gap-4 xl:gap-5">
          
          {/* LEFT: Brand Logo + Location Selector */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleLogoClick}
              className="group text-left relative focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 rounded-2xl cursor-pointer select-none shrink-0"
              title="SevaConnect - Click to go Home"
              aria-label="SevaConnect Home"
            >
              {rippleActive && (
                <span className="absolute inset-0 rounded-2xl border-2 border-blue-400/70 animate-ping pointer-events-none opacity-80" />
              )}
              <BrandLogo size="md" showSubtitle={false} />
            </motion.button>

            {/* Location Selector Pill */}
            <div className="relative" ref={locationRef}>
              <button
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e293b] hover:bg-[#334155] border border-slate-700 hover:border-blue-400/60 text-xs font-semibold text-slate-200 transition-all shadow-sm shrink-0 cursor-pointer"
                title="Change Service Area"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate max-w-[85px] md:max-w-[105px] xl:max-w-[125px] 2xl:max-w-[145px] font-medium text-slate-300">
                  {selectedArea || 'Boring Road'}, {selectedCity || 'Patna'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {locationDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-700/80 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl max-h-[440px] overflow-y-auto">
                  <div className="pb-2.5 mb-2.5 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <span>Select Patna Area / Village</span>
                      </span>
                      <span className="text-[10px] text-blue-400 font-medium block mt-0.5">
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
                  <div className="p-2 mb-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-200">
                    📍 <strong>Patna District Exclusive:</strong> Special offers and doorstep services are currently live exclusively for users with a Patna address across all city zones and rural villages!
                  </div>

                  <div className="space-y-3.5">
                    {locationGroups.map((grp) => (
                      <div key={grp.groupTitle} className="space-y-1.5">
                        <div className="flex items-center justify-between px-2.5 py-1 bg-[#1e293b] rounded-lg border border-slate-700/60">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400">
                            {grp.groupTitle}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
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
                                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
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
                  ? 'text-blue-400 bg-blue-500/10 border border-blue-500/40 font-bold'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavToSection('services-section')}
              className="px-2.5 xl:px-3 py-1.5 rounded-full hover:text-white hover:bg-slate-800 transition-all cursor-pointer whitespace-nowrap"
            >
              Services
            </button>

            <button
              onClick={() => onNavigate('45-min-arrival')}
              className={`px-2.5 xl:px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentPage === '45-min-arrival'
                  ? 'text-amber-400 bg-amber-500/10 border border-amber-500/40 font-bold'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>45-Min SLA</span>
            </button>

            <button
              onClick={() => onNavigate('search')}
              className={`px-2.5 xl:px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentPage === 'search'
                  ? 'text-blue-400 bg-blue-500/10 border border-blue-500/40 font-bold'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span>Technicians</span>
            </button>

            {/* Structured More Dropdown */}
            <div className="relative" ref={moreNavRef}>
              <button
                onClick={() => setMoreNavOpen(!moreNavOpen)}
                className={`px-2.5 xl:px-3 py-1.5 rounded-full hover:text-white hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1 text-slate-300 ${
                  moreNavOpen
                    ? 'text-blue-400 bg-blue-500/10 border border-blue-500/40 font-bold'
                    : ''
                }`}
              >
                <span>More</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    moreNavOpen ? 'rotate-180 text-blue-400' : ''
                  }`}
                />
              </button>

              {moreNavOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-700/80 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl space-y-0.5">
                  <button
                    onClick={() => {
                      handleNavToSection('packages-section');
                      setMoreNavOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#1e293b] hover:text-blue-400 rounded-xl transition-colors flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <span>📦 Packages</span>
                  </button>
                  <button
                    onClick={() => {
                      handleNavToSection('faq-section');
                      setMoreNavOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#1e293b] hover:text-blue-400 rounded-xl transition-colors flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <span>❓ FAQs</span>
                  </button>
                  <button
                    onClick={() => {
                      handleNavToSection('contact-section');
                      setMoreNavOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#1e293b] hover:text-blue-400 rounded-xl transition-colors flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <span>📞 Contact</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Subtle vertical divider between Nav and Right Controls */}
          <div className="hidden xl:block h-6 w-px bg-slate-800 shrink-0 mx-1 lg:mx-2" />

          {/* RIGHT: Quick Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 shrink-0">
            {/* Direct Book Service CTA button */}
            {onOpenBooking && (
              <button
                onClick={() => onOpenBooking()}
                className="hidden sm:flex px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_2px_14px_rgba(37,99,235,0.35)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.55)] transition-all items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
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
                    ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                    : 'bg-[#1e293b] text-blue-400 border border-blue-500/30 hover:bg-[#334155]'
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
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all bg-[#1e293b] hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 hover:border-blue-400 shadow-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  id="btn-customer-profile-dropdown"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-3 bg-[#1e293b] hover:bg-[#334155] border border-slate-700 hover:border-blue-400/60 rounded-full transition-all cursor-pointer"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-400"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/40">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-100 hidden sm:inline truncate max-w-[85px] xl:max-w-[100px]">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                    {/* Top Customer / User Info */}
                    <div className="p-2.5 border-b border-slate-800 flex items-center gap-2.5">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-400 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/40 shrink-0">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
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
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#1e293b] hover:text-blue-400 rounded-lg flex items-center justify-between transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <User className="w-3.5 h-3.5 text-blue-400" />
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
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#1e293b] hover:text-blue-400 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-medium">Add / Change Photo</span>
                      </button>

                      {/* Edit Profile */}
                      <button
                        id="btn-dropdown-edit-profile"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setEditProfileOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#1e293b] hover:text-blue-400 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-medium">Edit Profile Details</span>
                      </button>

                      {user.role === 'CUSTOMER' && (
                        <button
                          id="btn-dropdown-my-bookings"
                          onClick={() => {
                            onNavigate('customer-dashboard');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#1e293b] hover:text-blue-400 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
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
                          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#1e293b] hover:text-amber-300 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
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
                          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#1e293b] hover:text-blue-300 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                          <span className="font-medium">Admin Control Center</span>
                        </button>
                      )}

                      <button
                        id="btn-dropdown-sign-out"
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2.5 mt-1 border-t border-slate-800 pt-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Theme Palette Switcher */}
            <div className="relative" ref={paletteRef}>
              <button
                onClick={() => setPaletteDropdownOpen(!paletteDropdownOpen)}
                title="Change Theme Color / Palette"
                aria-label="Theme Color"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-[#1e293b] hover:bg-[#334155] border border-slate-700 hover:border-blue-400/60 text-slate-200 transition-all cursor-pointer shadow-sm shrink-0"
              >
                <Palette className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] hidden 2xl:inline">Theme</span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              </button>

              {paletteDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl space-y-1">
                  <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-blue-400" />
                      Color Themes
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Live</span>
                  </div>
                  <div className="space-y-1 pt-1">
                    {themeOptions.map((opt) => {
                      const isCurrent = theme === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setTheme(opt.id);
                            setPaletteDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-blue-600/20 text-white border border-blue-500/50 font-bold'
                              : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{opt.icon}</span>
                            <div>
                              <p className="font-semibold leading-tight">{opt.name}</p>
                              <p className="text-[10px] text-slate-400">{opt.desc}</p>
                            </div>
                          </div>
                          {isCurrent && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Daylight toggle button */}
            <button
              onClick={toggleLightDark}
              title={isLight ? "Switch to Dark Theme" : "Switch to Daylight Mode"}
              aria-label="Toggle Light/Dark"
              className={`hidden md:flex w-8 h-8 items-center justify-center rounded-full text-xs font-semibold border transition-all shrink-0 cursor-pointer ${
                isLight
                  ? 'bg-amber-400/20 text-amber-500 border-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                  : 'bg-[#1e293b] text-amber-400 border-slate-700 hover:border-amber-400/60'
              }`}
            >
              <span className="text-sm">{isLight ? '🌙' : '☀️'}</span>
            </button>

            {/* Settings Button */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                title="Settings & Preferences"
                aria-label="Settings"
                className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-[#1e293b] border border-slate-700 hover:border-blue-400 text-slate-300 hover:text-white hover:bg-[#334155] transition-all shrink-0 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-blue-400" />
              </button>

              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-700 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-blue-400" />
                      Preferences &amp; Platform Info
                    </span>
                    <button
                      onClick={() => setSettingsOpen(false)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2.5 pt-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 text-slate-300">
                      <span>Primary Hub:</span>
                      <span className="font-semibold text-blue-400">Patna, Bihar</span>
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
                      <a href="tel:8709107808" className="text-blue-400 font-bold hover:underline font-mono">
                        8709107808
                      </a>
                    </div>
                    <div className="flex items-center justify-between py-1 text-slate-300">
                      <span>Co-Admin:</span>
                      <a href="tel:8409021577" className="text-amber-400 font-bold hover:underline font-mono">
                        8409021577
                      </a>
                    </div>
                    <div className="flex items-center justify-between py-1 text-slate-300">
                      <span>WhatsApp:</span>
                      <a
                        href="https://wa.me/918709107808"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 font-bold hover:underline font-mono"
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
              className="p-2.5 rounded-xl bg-[#131b2e] border border-slate-700/60 text-slate-300 hover:text-emerald-400 xl:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 3. MOBILE NAVIGATION DRAWER */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-800 py-4 space-y-4 animate-in fade-in duration-200">
            {/* Mobile Location Selector */}
            <div className="p-3 bg-[#0f172a] rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Current Service Location</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { city: 'Patna', area: 'Boring Road' },
                  { city: 'Patna', area: 'Kankarbagh' },
                  { city: 'Patna', area: 'Bailey Road' },
                  { city: 'Patna', area: 'Danapur' },
                  { city: 'Patna', area: 'Bihta' },
                  { city: 'Patna', area: 'Naubatpur' },
                  { city: 'Patna', area: 'Fatuha' },
                  { city: 'Patna', area: 'Masaurhi' },
                ].map((loc) => {
                  const isSelected = selectedCity === loc.city && selectedArea === loc.area;
                  return (
                    <button
                      key={`${loc.city}-${loc.area}`}
                      onClick={() => handleLocationUpdate(loc.city, loc.area)}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'bg-[#1e293b] text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      {loc.area}, {loc.city}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Theme Selector */}
            <div className="p-3 bg-[#0f172a] rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-blue-400" />
                  <span>Color Theme</span>
                </span>
                <button
                  onClick={toggleLightDark}
                  className="text-xs text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30"
                >
                  {isLight ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 border transition-all text-left ${
                      theme === opt.id
                        ? 'bg-blue-600/20 text-white border-blue-500 font-bold'
                        : 'bg-[#1e293b] text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span className="truncate">{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2.5 rounded-xl bg-[#1e293b] text-slate-200 hover:text-blue-400 text-xs font-semibold flex items-center gap-2 border border-slate-800"
              >
                <span>🏠 Home</span>
              </button>

              <button
                onClick={() => handleNavToSection('services-section')}
                className="text-left px-3 py-2.5 rounded-xl bg-[#1e293b] text-slate-200 hover:text-blue-400 text-xs font-semibold flex items-center gap-2 border border-slate-800"
              >
                <span>🛠️ Services</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('45-min-arrival');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2.5 rounded-xl bg-[#1e293b] text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-2 border border-slate-800"
              >
                <span>⚡ 45-Min SLA</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('search');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2.5 rounded-xl bg-[#1e293b] text-slate-200 hover:text-blue-400 text-xs font-semibold flex items-center gap-2 border border-slate-800"
              >
                <span>🔍 Technicians</span>
              </button>

              <button
                onClick={() => handleNavToSection('packages-section')}
                className="text-left px-3 py-2.5 rounded-xl bg-[#1e293b] text-slate-200 hover:text-blue-400 text-xs font-semibold flex items-center gap-2 border border-slate-800"
              >
                <span>📦 Care Packages</span>
              </button>

              <button
                onClick={() => handleNavToSection('faq-section')}
                className="text-left px-3 py-2.5 rounded-xl bg-[#1e293b] text-slate-200 hover:text-blue-400 text-xs font-semibold flex items-center gap-2 border border-slate-800"
              >
                <span>❓ FAQs</span>
              </button>

              <button
                onClick={() => handleNavToSection('contact-section')}
                className="text-left px-3 py-2.5 rounded-xl bg-[#1e293b] text-slate-200 hover:text-blue-400 text-xs font-semibold flex items-center gap-2 border border-slate-800 col-span-2"
              >
                <span>📞 Contact &amp; Dispatch Desk</span>
              </button>
            </div>

            {/* Direct Helpline Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
              <a
                href="tel:8709107808"
                className="py-2.5 px-3 rounded-xl bg-[#1e293b] border border-blue-500/40 text-blue-400 font-mono text-xs font-bold text-center flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Admin: 8709107808</span>
              </a>

              <a
                href="tel:8409021577"
                className="py-2.5 px-3 rounded-xl bg-[#1e293b] border border-amber-500/40 text-amber-400 font-mono text-xs font-bold text-center flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Co-Admin: 8409021577</span>
              </a>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  onNavigate('search');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-3 rounded-xl bg-[#1e293b] border border-slate-700 text-xs text-white text-center font-bold"
              >
                Explore Services
              </button>

              {onOpenBooking && (
                <button
                  onClick={() => {
                    onOpenBooking();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs text-center font-extrabold shadow-[0_0_15px_rgba(37,99,235,0.4)]"
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
