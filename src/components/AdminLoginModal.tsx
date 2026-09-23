import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Eye, EyeOff, X, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const { adminLogin } = useAuth();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus input when opened & reset state when closed
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(null);
      setShowPassword(false);
      setIsLoading(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Incorrect password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await adminLogin(password);
      showToast('Super Administrator session authorized', 'success');
      onSuccess();
    } catch (err: any) {
      // Per instructions: "If the password is incorrect, show: Incorrect password"
      setError('Incorrect password');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto p-4 sm:p-6 flex justify-center">
          {/* Backdrop with smooth blur and fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#03080d]/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative my-auto w-full max-w-md bg-gradient-to-b from-[#0a1b24] via-[#07141b] to-[#040b10] border border-[#0df2a4]/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(13,242,164,0.22)] text-white z-10 select-none overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background Glow Effect */}
            <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#0df2a4]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
              aria-label="Close Admin Login"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header: Shield Emblem + Heading */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0e2733] to-[#071722] border border-[#0df2a4]/40 flex items-center justify-center shadow-[0_0_20px_rgba(13,242,164,0.3)] mb-4">
                <ShieldCheck className="w-7 h-7 text-[#0df2a4]" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
                Admin Login
              </h2>

              <p className="text-xs text-slate-400 mt-1.5 max-w-xs font-medium">
                Enter your administrative key to access the operations and governance control center.
              </p>
            </div>

            {/* Error Message Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Admin Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4 text-[#0df2a4]/70" />
                  </div>

                  <input
                    ref={inputRef}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 bg-[#061017] border border-[#0df2a4]/30 focus:border-[#0df2a4] focus:ring-2 focus:ring-[#0df2a4]/20 rounded-xl text-white placeholder-slate-600 text-sm font-mono transition-all outline-none"
                    disabled={isLoading}
                  />

                  {/* Show / Hide Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#0df2a4] transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-[#0df2a4] hover:bg-[#00f5c4] active:scale-[0.98] disabled:opacity-60 text-slate-950 font-extrabold text-sm rounded-xl shadow-[0_0_25px_rgba(13,242,164,0.35)] hover:shadow-[0_0_35px_rgba(13,242,164,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
                    <span>Login to Admin Panel</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
