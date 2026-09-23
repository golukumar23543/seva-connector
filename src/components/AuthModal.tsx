import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Home,
  KeyRound,
  ArrowLeft,
  Sparkles,
  Info,
} from 'lucide-react';
import type { CompleteAddress } from '../types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register-customer' | 'register-provider';
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, initialTab = 'login', onSuccess }: AuthModalProps) {
  const { login, register, registerCustomer, verifyGoogle, registerGoogleCustomer, demoLogin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'login' | 'register-customer' | 'register-provider'>(initialTab);
  const [loading, setLoading] = useState(false);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showCustPassword, setShowCustPassword] = useState(false);
  const [showCustConfirmPassword, setShowCustConfirmPassword] = useState(false);
  const [showProvPassword, setShowProvPassword] = useState(false);

  // Customer registration sub-state
  // 'form' = standard registration form
  // 'google-picker' = Google account selector
  // 'google-complete' = Profile completion after Google verification
  // 'success' = Registration completed successfully
  const [customerFlowState, setCustomerFlowState] = useState<'form' | 'google-picker' | 'google-complete' | 'success'>('form');

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Customer registration fields (Email + Phone)
  const [custFirstName, setCustFirstName] = useState('');
  const [custLastName, setCustLastName] = useState('');
  const [custDob, setCustDob] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAltPhone, setCustAltPhone] = useState('');
  const [custHouseFlat, setCustHouseFlat] = useState('');
  const [custStreetArea, setCustStreetArea] = useState('');
  const [custCity, setCustCity] = useState('Patna');
  const [custState, setCustState] = useState('Bihar');
  const [custPincode, setCustPincode] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [custConfirmPassword, setCustConfirmPassword] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');

  // Google flow state
  const [googleUser, setGoogleUser] = useState<{
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  } | null>(null);

  // Google custom account input
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Provider registration inputs
  const [provName, setProvName] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provPhone, setProvPhone] = useState('');
  const [provPassword, setProvPassword] = useState('');
  const [provCategory, setProvCategory] = useState('Electrician');
  const [provExp, setProvExp] = useState(3);
  const [provPrice, setProvPrice] = useState(299);
  const [provAreas, setProvAreas] = useState('Boring Road, Kankarbagh, Danapur, Bihta, Patna City');
  const [provBio, setProvBio] = useState('');
  const [provHours, setProvHours] = useState('09:00 AM - 07:00 PM');

  // Success screen state
  const [successInfo, setSuccessInfo] = useState<{
    name: string;
    email: string;
    method: 'GOOGLE' | 'EMAIL_PHONE';
  } | null>(null);

  if (!isOpen) return null;

  // Handle standard Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      showToast('Welcome back to Seva Connecter!', 'success');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Customer Signup via Email + Phone
  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validations
    if (custPassword !== custConfirmPassword) {
      showToast('Passwords do not match. Please re-enter your password.', 'error');
      return;
    }

    if (custPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (!registrationCode.trim() || registrationCode.trim().length !== 4) {
      showToast('Please enter the valid 4-digit authorization code from the administrator.', 'error');
      return;
    }

    setLoading(true);
    try {
      const address: CompleteAddress = {
        houseFlat: custHouseFlat.trim(),
        streetArea: custStreetArea.trim(),
        city: custCity.trim(),
        state: custState.trim(),
        pincode: custPincode.trim(),
      };

      await registerCustomer({
        firstName: custFirstName.trim(),
        lastName: custLastName.trim(),
        dob: custDob,
        email: custEmail.trim().toLowerCase(),
        phone: custPhone.trim(),
        altPhone: custAltPhone.trim() || undefined,
        address,
        password: custPassword,
        confirmPassword: custConfirmPassword,
        registrationCode: registrationCode.trim(),
      });

      setSuccessInfo({
        name: `${custFirstName.trim()} ${custLastName.trim()}`,
        email: custEmail.trim().toLowerCase(),
        method: 'EMAIL_PHONE',
      });
      setCustomerFlowState('success');
      showToast('Your customer account has been created successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Customer registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google account authentication
  const handleSelectGoogleAccount = async (account: { email: string; name: string; avatarUrl?: string }) => {
    setLoading(true);
    try {
      const res = await verifyGoogle({
        email: account.email,
        name: account.name,
        avatarUrl: account.avatarUrl,
      });

      if (res.status === 'LOGGED_IN') {
        showToast('Signed in successfully with Google!', 'success');
        onClose();
        if (onSuccess) onSuccess();
      } else if (res.status === 'NEEDS_PROFILE_COMPLETION') {
        setGoogleUser(res.googleUser);
        // Pre-fill fields from Google
        if (res.googleUser.firstName) setCustFirstName(res.googleUser.firstName);
        if (res.googleUser.lastName) setCustLastName(res.googleUser.lastName);
        setCustEmail(res.googleUser.email);
        setCustomerFlowState('google-complete');
        showToast('Google account verified. Please complete your customer profile details.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Google authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Profile Completion Submission
  const handleGoogleProfileCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser) return;

    setLoading(true);
    try {
      const address: CompleteAddress = {
        houseFlat: custHouseFlat.trim(),
        streetArea: custStreetArea.trim(),
        city: custCity.trim(),
        state: custState.trim(),
        pincode: custPincode.trim(),
      };

      await registerGoogleCustomer({
        googleId: googleUser.googleId,
        email: googleUser.email,
        firstName: custFirstName.trim(),
        lastName: custLastName.trim(),
        dob: custDob,
        phone: custPhone.trim(),
        altPhone: custAltPhone.trim() || undefined,
        address,
        avatarUrl: googleUser.avatarUrl,
      });

      setSuccessInfo({
        name: `${custFirstName.trim()} ${custLastName.trim()}`,
        email: googleUser.email,
        method: 'GOOGLE',
      });
      setCustomerFlowState('success');
      showToast('Your customer account has been created successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Google registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Partner / Provider Registration
  const handleProviderRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const areaList = provAreas.split(',').map((a) => a.trim()).filter(Boolean);
      await register({
        name: provName,
        email: provEmail,
        phone: provPhone,
        password: provPassword,
        role: 'PROVIDER',
        providerDetails: {
          serviceCategory: provCategory,
          services: [`${provCategory} Repair`, 'General Inspection', 'Installation'],
          experienceYears: Number(provExp) || 1,
          bio: provBio || `Experienced ${provCategory} professional serving residential and commercial properties.`,
          serviceAreas: areaList.length > 0 ? areaList : ['Patna'],
          pricingStartingAt: Number(provPrice) || 299,
          workingHours: provHours,
        },
      });
      showToast('Partner registration submitted! Status: Verification Pending', 'success');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Partner registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishSuccess = () => {
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              {activeTab === 'login' && 'Sign in to Seva Connecter'}
              {activeTab === 'register-customer' &&
                (customerFlowState === 'google-complete'
                  ? 'Complete Your Customer Profile'
                  : customerFlowState === 'success'
                  ? 'Registration Completed'
                  : 'Create Customer Account')}
              {activeTab === 'register-provider' && 'Join as a Service Partner'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'login' && 'Access your bookings, profile, or dashboard'}
              {activeTab === 'register-customer' &&
                (customerFlowState === 'google-complete'
                  ? 'Provide your contact and doorstep delivery address to finalize registration'
                  : customerFlowState === 'success'
                  ? 'Welcome to Seva Connecter! Your account is active and ready'
                  : 'Book verified doorstep home service professionals')}
              {activeTab === 'register-provider' && 'Grow your business with verified customer leads'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/918709107808?text=Hello%20Administrator,%20I%20need%20assistance%20with%20customer%20registration%20on%20SevaConnect."
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] text-xs font-semibold transition-colors"
              title="Chat with Admin on WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-[#25D366]" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Tab Bar (Hidden during Google Completion or Success states) */}
        {customerFlowState !== 'google-complete' && customerFlowState !== 'success' && (
          <div className="flex border-b border-slate-200 bg-slate-100/60 p-1.5 gap-1 text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('login');
                setCustomerFlowState('form');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('register-customer');
                setCustomerFlowState('form');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                activeTab === 'register-customer'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Customer Signup
            </button>
            <button
              onClick={() => {
                setActiveTab('register-provider');
                setCustomerFlowState('form');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                activeTab === 'register-provider'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Partner Signup
            </button>
          </div>
        )}

        {/* Modal Body Container */}
        <div className="p-5 sm:p-6 max-h-[78vh] overflow-y-auto">
          {/* ========================================================================= */}
          {/* TAB 1: LOGIN */}
          {/* ========================================================================= */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. rahul.customer@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              {/* Login with Google Shortcut */}
              <div className="pt-2">
                <div className="relative flex items-center my-3.5">
                  <div className="grow border-t border-slate-200" />
                  <span className="shrink-0 bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap select-none">
                    Or sign in with
                  </span>
                  <div className="grow border-t border-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register-customer');
                    setCustomerFlowState('google-picker');
                  }}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2.5 shadow-sm transition-all hover:shadow cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Reminder Banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Reminder:</strong> Please use your registered email ID and password to log in. If you registered via Google, use the Google button above.
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CUSTOMER SIGNUP (CHOOSE METHOD / EMAIL + PHONE FORM) */}
          {/* ========================================================================= */}
          {activeTab === 'register-customer' && customerFlowState === 'form' && (
            <div className="space-y-4">
              {/* Option A: SIGN UP WITH GOOGLE BUTTON */}
              <div>
                <button
                  type="button"
                  onClick={() => setCustomerFlowState('google-picker')}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm font-semibold text-slate-700 flex items-center justify-center gap-3 shadow-sm transition-all hover:shadow cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-1.5">
                  Instant verification using your Google profile. No separate password needed.
                </p>
              </div>

              {/* Divider */}
              <div className="relative flex items-center my-4">
                <div className="grow border-t border-slate-200" />
                <span className="shrink-0 bg-white px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap select-none">
                  Or register with Email + Phone
                </span>
                <div className="grow border-t border-slate-200" />
              </div>

              {/* Option B: FORM FOR EMAIL + PHONE */}
              <form onSubmit={handleCustomerRegister} className="space-y-4">
                {/* 1. First & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={custFirstName}
                        onChange={(e) => setCustFirstName(e.target.value)}
                        placeholder="e.g. Anjali"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={custLastName}
                      onChange={(e) => setCustLastName(e.target.value)}
                      placeholder="e.g. Sharma"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* 2. Date of Birth & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Date of Birth (DOB) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="date"
                        required
                        value={custDob}
                        onChange={(e) => setCustDob(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        placeholder="anjali.sharma@gmail.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Phone & Alternative Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="+91 98290 12345"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Alternative Phone <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        value={custAltPhone}
                        onChange={(e) => setCustAltPhone(e.target.value)}
                        placeholder="Alternative contact number"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Complete Address Fields */}
                <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Home className="w-3.5 h-3.5 text-indigo-600" />
                    Complete Delivery Address <span className="text-rose-500">*</span>
                  </div>

                  {/* Exclusive Coverage Notice */}
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">
                      <strong>Exclusive Service in Patna District:</strong> Doorstep services and promotional offers are currently live for addresses across Patna (all city zones, blocks &amp; rural villages / हर गाँव).
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        House / Flat / Plot / Landmark <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={custHouseFlat}
                        onChange={(e) => setCustHouseFlat(e.target.value)}
                        placeholder="House No. 12, Main Road"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Locality / Block / Village <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={custStreetArea}
                        onChange={(e) => setCustStreetArea(e.target.value)}
                        placeholder="e.g. Boring Road or Bihta"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={custCity}
                        onChange={(e) => setCustCity(e.target.value)}
                        placeholder="Patna"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={custState}
                        onChange={(e) => setCustState(e.target.value)}
                        placeholder="Bihar"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        PIN Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={custPincode}
                        onChange={(e) => setCustPincode(e.target.value)}
                        placeholder="302020"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showCustPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={custPassword}
                        onChange={(e) => setCustPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustPassword(!showCustPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showCustPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showCustConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={custConfirmPassword}
                        onChange={(e) => setCustConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustConfirmPassword(!showCustConfirmPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showCustConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 6. 4-Digit Administrator Registration Code (Required) */}
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wider">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    4-Digit Admin Registration Code <span className="text-rose-600">*</span>
                  </div>

                  {/* Mandatory notice message */}
                  <p className="text-xs font-semibold text-amber-900 leading-snug">
                    Please contact the administrator to get your 4-digit registration code.
                  </p>

                  {/* Direct WhatsApp Action Button */}
                  <a
                    href="https://wa.me/918709107808?text=Hello%20Administrator,%20I%20am%20registering%20my%20customer%20account%20on%20SevaConnect%20and%20need%20the%204-digit%20registration%20code."
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>Contact Admin on WhatsApp for 4-Digit Code</span>
                  </a>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={registrationCode}
                        onChange={(e) => setRegistrationCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 4-digit code"
                        className="w-full px-4 py-2 bg-white border border-amber-300 rounded-xl text-center text-lg font-mono font-bold tracking-[0.25em] text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-800/80">
                    The 4-digit code is generated securely in the Admin Panel and refreshed every 5 minutes.
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'Creating Account...' : 'Complete Customer Registration'}
                </button>

                {/* Direct WhatsApp Quick Contact Strip */}
                <div className="flex items-center justify-between p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold block text-emerald-950">Direct Admin WhatsApp Desk</span>
                      <span className="text-[11px] text-emerald-700">Get 4-digit code or instant registration help</span>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/918709107808?text=Hello%20Administrator,%20I%20am%20registering%20my%20customer%20account%20on%20SevaConnect%20and%20need%20the%204-digit%20registration%20code."
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-[11px] rounded-lg shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>

                {/* Mandatory Reminder Box */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Important Reminder:</strong> Please remember your email ID and password. You will use the same credentials to log in to your customer account.
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* GOOGLE ACCOUNT SELECTOR / PROMPT MODAL */}
          {/* ========================================================================= */}
          {activeTab === 'register-customer' && customerFlowState === 'google-picker' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setCustomerFlowState('form')}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Back to signup methods
                </span>
              </div>

              <div className="text-center pb-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 border border-slate-200">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900">Choose a Google Account</h3>
                <p className="text-xs text-slate-500">to continue to Seva Connecter Customer Portal</p>
              </div>

              {/* Sample Google Accounts */}
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    handleSelectGoogleAccount({
                      email: 'ananya.gupta@gmail.com',
                      name: 'Ananya Gupta',
                      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
                    })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-500/50 hover:bg-indigo-50/30 flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                      alt="Ananya Gupta"
                      className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        Ananya Gupta
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">ananya.gupta@gmail.com</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-indigo-600">Select</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    handleSelectGoogleAccount({
                      email: 'vikas.singh@gmail.com',
                      name: 'Vikas Singh',
                      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
                    })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-500/50 hover:bg-indigo-50/30 flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                      alt="Vikas Singh"
                      className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        Vikas Singh
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">vikas.singh@gmail.com</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-indigo-600">Select</span>
                </button>
              </div>

              {/* Or enter custom Google email */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  Or enter your personal Google email:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="email"
                    placeholder="your.email@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  disabled={loading || !customGoogleEmail.trim()}
                  onClick={() =>
                    handleSelectGoogleAccount({
                      email: customGoogleEmail.trim().toLowerCase(),
                      name: customGoogleName.trim() || customGoogleEmail.split('@')[0],
                    })
                  }
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Verifying Google SSO...' : 'Verify Google Identity'}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PROFILE COMPLETION FORM AFTER GOOGLE VERIFICATION */}
          {/* ========================================================================= */}
          {activeTab === 'register-customer' && customerFlowState === 'google-complete' && googleUser && (
            <form onSubmit={handleGoogleProfileCompletion} className="space-y-4 animate-in fade-in duration-200">
              {/* Google Verified Banner */}
              <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white border border-blue-200 flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-blue-600 font-bold block">
                      Google Account Verified
                    </span>
                    <span className="text-xs font-semibold text-slate-800 font-mono">{googleUser.email}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  Google SSO
                </span>
              </div>

              {/* Notice that password is not required */}
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Google credentials verified securely. No separate password or admin code required.</span>
              </div>

              {/* Names (prefilled from Google) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={custFirstName}
                    onChange={(e) => setCustFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={custLastName}
                    onChange={(e) => setCustLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* DOB & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Date of Birth (DOB) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      required
                      value={custDob}
                      onChange={(e) => setCustDob(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      placeholder="+91 98290 12345"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Alternative Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Alternative Phone <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={custAltPhone}
                    onChange={(e) => setCustAltPhone(e.target.value)}
                    placeholder="Alternative contact number"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Complete Address */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Home className="w-3.5 h-3.5 text-indigo-600" />
                  Complete Doorstep Delivery Address <span className="text-rose-500">*</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      House / Flat No. <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={custHouseFlat}
                      onChange={(e) => setCustHouseFlat(e.target.value)}
                      placeholder="Flat 402, Royal Residency"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Street / Area <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={custStreetArea}
                      onChange={(e) => setCustStreetArea(e.target.value)}
                      placeholder="e.g. Boring Road or Bihta"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={custCity}
                      onChange={(e) => setCustCity(e.target.value)}
                      placeholder="Patna"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={custState}
                      onChange={(e) => setCustState(e.target.value)}
                      placeholder="Bihar"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      PIN Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={custPincode}
                      onChange={(e) => setCustPincode(e.target.value)}
                      placeholder="302020"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Finalizing Customer Registration...' : 'Complete Customer Registration'}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* SUCCESS SCREEN */}
          {/* ========================================================================= */}
          {activeTab === 'register-customer' && customerFlowState === 'success' && successInfo && (
            <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>

              <div>
                {/* Mandatory exact success message */}
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  Your customer account has been created successfully.
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Welcome aboard, <strong className="text-slate-800">{successInfo.name}</strong>!
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left max-w-md mx-auto text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Account Email:</span>
                  <span className="font-mono font-semibold text-slate-800">{successInfo.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Registration Method:</span>
                  <span className="font-semibold text-indigo-600 flex items-center gap-1">
                    {successInfo.method === 'GOOGLE' ? 'Google OAuth' : 'Email + Phone (Admin Code Verified)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Service Coverage:</span>
                  <span className="text-slate-700 font-semibold text-emerald-700">Patna District (All Towns &amp; Villages)</span>
                </div>
              </div>

              {/* Mandatory Reminder text at bottom */}
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-left max-w-md mx-auto text-xs text-indigo-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Important Login Reminder</span>
                </div>
                <p className="leading-relaxed">
                  Please remember your email ID and password. You will use the same credentials to log in to your customer account.
                </p>
              </div>

              <button
                type="button"
                onClick={handleFinishSuccess}
                className="w-full max-w-md mx-auto py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Home & Explore Services</span>
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: REGISTER PARTNER / PROVIDER */}
          {/* ========================================================================= */}
          {activeTab === 'register-provider' && (
            <form onSubmit={handleProviderRegister} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Partner / Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={provName}
                    onChange={(e) => setProvName(e.target.value)}
                    placeholder="e.g. Mukesh Technicals"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Service Category
                  </label>
                  <select
                    value={provCategory}
                    onChange={(e) => setProvCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  >
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="AC Repair & Service">AC Repair & Service</option>
                    <option value="Fridge Repair">Fridge Repair</option>
                    <option value="RO Purifier Service">RO Purifier Service</option>
                    <option value="Computer & Laptop Repair">Computer & Laptop Repair</option>
                    <option value="Full Home & Kitchen Cleaning">Full Home & Kitchen Cleaning</option>
                    <option value="Painter & Wall Care">Painter & Wall Care</option>
                    <option value="Washing Machine Repair">Washing Machine Repair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={provEmail}
                    onChange={(e) => setProvEmail(e.target.value)}
                    placeholder="partner@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={provPhone}
                    onChange={(e) => setProvPhone(e.target.value)}
                    placeholder="+91 98290 54321"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Years Experience
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={provExp}
                    onChange={(e) => setProvExp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Starting Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={99}
                    step={50}
                    value={provPrice}
                    onChange={(e) => setProvPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showProvPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={provPassword}
                      onChange={(e) => setProvPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowProvPassword(!showProvPassword)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      {showProvPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Service Localities (comma separated)
                </label>
                <input
                  type="text"
                  value={provAreas}
                  onChange={(e) => setProvAreas(e.target.value)}
                  placeholder="e.g. Mansarovar, Malviya Nagar, Vaishali Nagar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  About your experience & qualifications
                </label>
                <textarea
                  rows={2}
                  value={provBio}
                  onChange={(e) => setProvBio(e.target.value)}
                  placeholder="Share certifications, tools carried, guarantees offered..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-start gap-2 text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Verification Policy:</strong> New accounts are set to <em>"Verification Pending"</em>. The admin panel reviews your submission before enabling live customer bookings.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Submitting Application...' : 'Register as Partner'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
