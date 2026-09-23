import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, RefreshCw, Copy, Check, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface RegistrationCodeData {
  code: string;
  createdAt: number;
  expiresAt: number;
  remainingSeconds: number;
  totalSeconds: number;
}

export function AdminRegistrationCodeCard() {
  const { authHeaders } = useAuth();
  const { showToast } = useToast();
  const [codeData, setCodeData] = useState<RegistrationCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number>(300);

  const fetchCode = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch('/api/admin/registration-code', {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setCodeData(data);
        setCountdown(data.remainingSeconds || 300);
      }
    } catch (err) {
      console.error('Failed to fetch admin registration code:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchCode();
  }, [fetchCode]);

  // Countdown timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Time expired! Automatically fetch the new rotated code
          fetchCode(true);
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchCode]);

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const res = await fetch('/api/admin/registration-code/regenerate', {
        method: 'POST',
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setCodeData(data);
        setCountdown(data.remainingSeconds || 300);
        showToast('New 4-digit customer registration code generated!', 'success');
      } else {
        showToast('Failed to regenerate code', 'error');
      }
    } catch (err) {
      showToast('Error regenerating code', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopy = () => {
    if (!codeData?.code) return;
    navigator.clipboard.writeText(codeData.code);
    setCopied(true);
    showToast(`Registration code ${codeData.code} copied to clipboard`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.max(0, Math.min(100, (countdown / 300) * 100));

  return (
    <div className="bg-gradient-to-br from-[#06141d] via-[#081b26] to-[#040e15] border border-teal-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Decorative cyber grid accent */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0df2a4]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(#0df2a4_1px,transparent_1px)] [background-size:12px_12px] opacity-15 pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Info */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#0df2a4]/10 text-[#0df2a4] border border-[#0df2a4]/20">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white font-display tracking-wide flex items-center gap-2">
              Customer Registration Code Manager
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                5-Min Auto-Rotation
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Customers registering via <strong className="text-slate-200">Email + Phone</strong> are required to enter this temporary 4-digit code. Share this code with new customers. The server strictly enforces 5-minute expiry and automatically rotates the code.
          </p>
        </div>

        {/* Right: Code Display & Actions */}
        <div className="flex flex-wrap items-center gap-4 bg-[#03090e]/70 border border-teal-900/50 rounded-xl p-3 sm:px-5 sm:py-3.5">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#0df2a4]" />
              Active 4-Digit Code
            </span>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <span className="text-2xl font-mono font-bold text-slate-500 animate-pulse">----</span>
              ) : (
                <span className="text-3xl sm:text-4xl font-mono font-black tracking-[0.25em] text-[#0df2a4] drop-shadow-[0_0_12px_rgba(13,242,164,0.4)]">
                  {codeData?.code || '----'}
                </span>
              )}
            </div>
          </div>

          {/* Countdown timer badge */}
          <div className="border-l border-teal-900/50 pl-4 flex flex-col justify-center min-w-[110px]">
            <span className="text-[10px] font-mono text-slate-400">Expires in</span>
            <span className={`text-sm font-mono font-bold ${countdown < 60 ? 'text-amber-400 animate-pulse' : 'text-slate-200'}`}>
              {formatTime(countdown)}
            </span>
            {/* Mini Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  countdown < 60 ? 'bg-amber-400' : 'bg-[#0df2a4]'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pl-2">
            <button
              onClick={handleCopy}
              disabled={loading || !codeData?.code}
              title="Copy 4-digit code"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-teal-500/20 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleRegenerate}
              disabled={loading || regenerating}
              title="Rotate to new 4-digit code immediately"
              className="p-2 rounded-xl bg-[#0df2a4]/10 hover:bg-[#0df2a4]/20 text-[#0df2a4] border border-[#0df2a4]/30 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
