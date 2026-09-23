import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { ShieldCheck, UserCheck, Wrench, Wind, LogOut, Sparkles } from 'lucide-react';

export function DemoSwitcherBar({
  onNavigate,
  onRoleSwitched,
}: {
  onNavigate?: (page: string) => void;
  onRoleSwitched?: (role: string) => void;
}) {
  const { user, demoLogin, logout } = useAuth();
  const { showToast } = useToast();

  const handleSwitch = async (role: 'CUSTOMER' | 'PROVIDER_ELECTRICIAN' | 'PROVIDER_AC' | 'ADMIN' | 'CO_ADMIN') => {
    try {
      await demoLogin(role);
      let roleLabel = 'Customer (Rahul)';
      if (role === 'ADMIN') {
        roleLabel = 'Admin (Mr. Golu Prajapati)';
        if (onRoleSwitched) onRoleSwitched('ADMIN');
        else if (onNavigate) onNavigate('admin-dashboard');
      } else if (role === 'CO_ADMIN') {
        roleLabel = 'Co-Admin (Alok Prajapati)';
        if (onRoleSwitched) onRoleSwitched('ADMIN');
        else if (onNavigate) onNavigate('admin-dashboard');
      } else if (role === 'PROVIDER_ELECTRICIAN') {
        roleLabel = 'Electrician Partner (Rajesh)';
        if (onRoleSwitched) onRoleSwitched('PROVIDER');
        else if (onNavigate) onNavigate('provider-dashboard');
      } else if (role === 'PROVIDER_AC') {
        roleLabel = 'AC Partner (Vikram)';
        if (onRoleSwitched) onRoleSwitched('PROVIDER');
        else if (onNavigate) onNavigate('provider-dashboard');
      } else {
        if (onRoleSwitched) onRoleSwitched('CUSTOMER');
        else if (onNavigate) onNavigate('customer-dashboard');
      }
      showToast(`Switched account to ${roleLabel}`, 'success');
    } catch {
      showToast('Failed to switch demo account', 'error');
    }
  };

  return (
    <div className="bg-[#050b10] border-b border-[#0df2a4]/20 text-slate-300 text-xs py-2 px-3 sm:px-6 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-[#0df2a4] bg-[#0df2a4]/10 px-2 py-0.5 rounded-full border border-[#0df2a4]/30 shadow-[0_0_10px_rgba(13,242,164,0.15)]">
            <Sparkles className="w-3 h-3 text-[#0df2a4] animate-pulse" />
            Interactive Demo Mode
          </span>
          <span className="hidden sm:inline text-slate-400">
            Session: <strong className="text-white">{user ? `${user.name} (${user.role})` : 'Guest Visitor'}</strong>
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          <span className="hidden md:inline text-slate-400 mr-1">Switch:</span>

          <button
            onClick={() => handleSwitch('CUSTOMER')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              user?.role === 'CUSTOMER' && user?.email === 'rahul.customer@gmail.com'
                ? 'bg-[#0df2a4] text-slate-950 font-bold shadow-[0_0_12px_rgba(13,242,164,0.4)]'
                : 'bg-[#0a1620] hover:bg-[#112433] text-slate-300 border border-teal-500/20'
            }`}
          >
            <UserCheck className="w-3 h-3 text-[#0df2a4]" />
            <span>Customer (Rahul)</span>
          </button>

          <button
            onClick={() => handleSwitch('PROVIDER_ELECTRICIAN')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              user?.role === 'PROVIDER' && user?.email === 'rajesh.electrician@sevaconnect.in'
                ? 'bg-[#0df2a4] text-slate-950 font-bold shadow-[0_0_12px_rgba(13,242,164,0.4)]'
                : 'bg-[#0a1620] hover:bg-[#112433] text-slate-300 border border-teal-500/20'
            }`}
          >
            <Wrench className="w-3 h-3 text-amber-400" />
            <span>Partner: Rajesh</span>
          </button>

          <button
            onClick={() => handleSwitch('PROVIDER_AC')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              user?.role === 'PROVIDER' && user?.email === 'vikram.ac@sevaconnect.in'
                ? 'bg-[#0df2a4] text-slate-950 font-bold shadow-[0_0_12px_rgba(13,242,164,0.4)]'
                : 'bg-[#0a1620] hover:bg-[#112433] text-slate-300 border border-teal-500/20'
            }`}
          >
            <Wind className="w-3 h-3 text-cyan-400" />
            <span>Partner: Vikram</span>
          </button>

          <button
            onClick={() => handleSwitch('ADMIN')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              user?.role === 'ADMIN' && (user?.email === 'admin@sevaconnect.in' || user?.name?.includes('Golu'))
                ? 'bg-[#0df2a4] text-slate-950 font-bold shadow-[0_0_12px_rgba(13,242,164,0.4)]'
                : 'bg-[#0a1620] hover:bg-[#112433] text-slate-300 border border-teal-500/20'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-[#0df2a4]" />
            <span>Admin: Mr. Golu</span>
          </button>

          <button
            onClick={() => handleSwitch('CO_ADMIN')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              user?.role === 'ADMIN' && (user?.email === 'coadmin@sevaconnect.in' || user?.name?.includes('Alok'))
                ? 'bg-[#0df2a4] text-slate-950 font-bold shadow-[0_0_12px_rgba(13,242,164,0.4)]'
                : 'bg-[#0a1620] hover:bg-[#112433] text-slate-300 border border-teal-500/20'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>Co-Admin: Alok</span>
          </button>

          {user && (
            <button
              onClick={() => {
                logout();
                showToast('Logged out to guest mode', 'info');
                if (onNavigate) onNavigate('home');
              }}
              title="Sign Out to Guest"
              className="p-1 bg-[#0a1620] hover:bg-rose-900/60 hover:text-rose-200 text-slate-400 rounded-full border border-teal-500/20 transition-colors ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
