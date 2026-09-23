import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from '../../components/BrandLogo.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { NotificationsPopover } from '../../components/NotificationsPopover.tsx';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Wrench,
  CalendarDays,
  CreditCard,
  Star,
  MessageSquareWarning,
  Bell,
  LineChart,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Search
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigateHome: () => void;
}

const MENU_ITEMS = [
  { id: 'OVERVIEW', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'PAYMENTS', label: 'Payments', icon: CreditCard },
  { id: 'BOOKINGS', label: 'Bookings', icon: CalendarDays },
  { id: 'CUSTOMERS', label: 'Users', icon: Users },
  { id: 'PROVIDERS', label: 'Service Providers', icon: Briefcase },
  { id: 'SERVICES', label: 'Services', icon: Wrench },
  { id: 'FINANCE', label: 'Finance & Ledger', icon: FileText },
  { id: 'ANALYTICS', label: 'Analytics', icon: LineChart },
  { id: 'REVIEWS', label: 'Reviews & Ratings', icon: Star },
  { id: 'COMPLAINTS', label: 'Complaints', icon: MessageSquareWarning },
  { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
  { id: 'REPORTS', label: 'Reports', icon: FileText },
  { id: 'SETTINGS', label: 'Settings', icon: Settings },
];

export function AdminLayout({ children, activeTab, setActiveTab, onNavigateHome }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigateHome();
  };

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex-1 flex w-full bg-[#03090F] text-slate-200 font-sans selection:bg-[#0df2a4] selection:text-slate-950">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside
        className={`hidden md:flex flex-col bg-[#061017] border-r border-teal-900/40 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-4 border-b border-teal-900/40 shrink-0">
          <div className={`overflow-hidden transition-all duration-300 ${sidebarOpen ? 'w-full opacity-100' : 'w-0 opacity-0'}`}>
            <BrandLogo size="sm" showSubtitle={false} />
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-1.5 px-3 scrollbar-none">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#0df2a4]/10 to-transparent text-[#0df2a4]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill" 
                    className="absolute left-0 w-1 h-6 bg-[#0df2a4] rounded-r-full shadow-[0_0_10px_rgba(13,242,164,0.5)]" 
                  />
                )}
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#0df2a4]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'
                }`}>
                  {item.label}
                </span>
                
                {/* Optional notification badge for specific tabs could go here */}
              </button>
            );
          })}
        </div>
      </aside>

      {/* --- MOBILE SIDEBAR DRAWER --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#061017] border-r border-teal-900/40 z-50 flex flex-col shadow-2xl md:hidden"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-teal-900/40 shrink-0">
                <BrandLogo size="md" showSubtitle={false} />
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-6 space-y-2 px-4">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-[#0df2a4]/10 text-[#0df2a4] font-semibold' 
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#0df2a4]' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-20 shrink-0 bg-[#061017]/80 backdrop-blur-xl border-b border-teal-900/40 flex items-center justify-between px-4 sm:px-8 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-white capitalize font-display hidden sm:block">
              {MENU_ITEMS.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Global Search */}
            <div className="hidden lg:flex items-center bg-[#0a1824] border border-teal-500/20 rounded-full px-4 py-2 w-64 focus-within:border-[#0df2a4]/50 focus-within:shadow-[0_0_15px_rgba(13,242,164,0.15)] transition-all">
              <Search className="w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search anything..."
                className="bg-transparent border-none outline-none text-sm text-white px-3 w-full placeholder:text-slate-500"
              />
              <div className="text-[10px] font-mono text-slate-500 border border-slate-700 rounded px-1.5">⌘K</div>
            </div>

            <div className="h-6 w-px bg-teal-900/50 hidden sm:block"></div>

            <NotificationsPopover />

            {/* Profile Dropdown */}
            <div className="relative group cursor-pointer flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-white leading-tight">
                  {user?.name || 'Mr. Golu Prajapati (Admin)'}
                </span>
                <span className="text-[10px] font-mono text-[#0df2a4] bg-[#0df2a4]/10 px-1.5 py-0.5 rounded uppercase tracking-wider border border-[#0df2a4]/20">
                  {user?.name?.toLowerCase().includes('co-admin') || user?.email?.includes('coadmin') ? 'Co-Admin' : 'Super Admin'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0df2a4] to-teal-600 p-0.5">
                <div className="w-full h-full rounded-full bg-[#061017] flex items-center justify-center border-2 border-[#061017] overflow-hidden">
                  <ShieldCheck className="w-5 h-5 text-[#0df2a4]" />
                </div>
              </div>

              {/* Administrative Details Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#0a1824] border border-teal-900/60 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right z-50">
                <div className="p-3 border-b border-teal-900/40 text-xs">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-white">{user?.name || 'Mr. Golu Prajapati (Admin)'}</span>
                    <span className="text-[10px] text-[#0df2a4] font-mono px-1 bg-teal-500/10 rounded">
                      {user?.name?.toLowerCase().includes('co-admin') ? 'Co-Admin' : 'Super Admin'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{user?.email || 'admin@sevaconnect.in'}</p>
                  
                  <div className="mt-2.5 pt-2 border-t border-teal-900/30 text-[11px] space-y-1 text-slate-300">
                    <p className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Leadership Team</p>
                    <p><span className="text-white font-semibold">Admin:</span> Mr. Golu Prajapati</p>
                    <p><span className="text-white font-semibold">Co-Admin:</span> Alok Prajapati</p>
                  </div>
                </div>
                <div className="p-2 space-y-1 text-sm">
                  <button onClick={onNavigateHome} className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-xs">
                    <LayoutDashboard className="w-4 h-4 text-teal-400" /> Go to Website
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-xs">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/10 via-[#03090F] to-[#03090F] pointer-events-none" />
          
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
