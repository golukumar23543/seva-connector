import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Camera,
  Upload,
  Trash2,
  RefreshCw,
  Check,
  ShieldCheck,
  CreditCard,
  Building,
  Phone,
  Mail,
  Percent,
  MapPin,
  Save,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Eye,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { useMerchantConfig, DEFAULT_MERCHANT_PHOTO } from '../../context/MerchantConfigContext.tsx';
import { UpiQrCard } from '../../components/UpiQrCard.tsx';
import type { PlatformSettings } from '../../types.ts';

export function AdminSettings() {
  const { authHeaders } = useAuth();
  const { showToast } = useToast();
  const {
    merchantPhotoUrl,
    merchantPayeeName,
    merchantUpiId,
    merchantVerified,
    updateMerchantConfig,
    removeMerchantPhoto,
    resetToDefaultPhoto,
    isLoading: merchantConfigLoading,
  } = useMerchantConfig();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Platform General Settings State
  const [platformName, setPlatformName] = useState('SevaConnect');
  const [supportPhone, setSupportPhone] = useState('+91 98290 12345');
  const [supportEmail, setSupportEmail] = useState('support@sevaconnect.in');
  const [commissionPercent, setCommissionPercent] = useState<number>(10);
  const [platformFee, setPlatformFee] = useState<number>(49);
  const [selectedCity, setSelectedCity] = useState('Patna');
  const [cancellationHours, setCancellationHours] = useState<number>(2);
  const [instantApproval, setInstantApproval] = useState<boolean>(false);

  // Merchant QR Card Local Form State
  const [photoUrlInput, setPhotoUrlInput] = useState<string | null>(merchantPhotoUrl);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [payeeNameInput, setPayeeNameInput] = useState<string>(merchantPayeeName);
  const [upiIdInput, setUpiIdInput] = useState<string>(merchantUpiId);
  const [verifiedToggle, setVerifiedToggle] = useState<boolean>(merchantVerified);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when merchant config changes
  useEffect(() => {
    setPhotoUrlInput(merchantPhotoUrl);
    setPayeeNameInput(merchantPayeeName);
    setUpiIdInput(merchantUpiId);
    setVerifiedToggle(merchantVerified);
  }, [merchantPhotoUrl, merchantPayeeName, merchantUpiId, merchantVerified]);

  // Fetch full settings from backend
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const headers = typeof authHeaders === 'function' ? authHeaders() : authHeaders || {};
      const res = await fetch('/api/admin/settings', { headers });
      if (res.ok) {
        const data: PlatformSettings = await res.json();
        setPlatformName(data.platformName || 'SevaConnect');
        setSupportPhone(data.supportPhone || '+91 98290 12345');
        setSupportEmail(data.supportEmail || 'support@sevaconnect.in');
        setCommissionPercent(data.defaultCommissionPercentage ?? 10);
        setPlatformFee(data.platformFee ?? 49);
        setSelectedCity(data.selectedCity || 'Patna');
        setCancellationHours(data.cancellationWindowHours ?? 2);
        setInstantApproval(!!data.instantApproval);

        if (data.merchantPhotoUrl !== undefined) {
          setPhotoUrlInput(data.merchantPhotoUrl);
        }
        if (data.merchantPayeeName) {
          setPayeeNameInput(data.merchantPayeeName);
        }
        if (data.merchantUpiId) {
          setUpiIdInput(data.merchantUpiId);
        }
        if (data.merchantVerified !== undefined) {
          setVerifiedToggle(data.merchantVerified);
        }
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      showToast('Image size should be less than 4MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhotoUrlInput(base64);
      showToast('Photo uploaded for preview! Click "Save Settings" to apply.', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Handle apply custom URL
  const handleApplyUrl = () => {
    if (!customUrl.trim()) {
      showToast('Please enter an image URL', 'error');
      return;
    }
    setPhotoUrlInput(customUrl.trim());
    showToast('Photo URL applied for preview', 'info');
  };

  // Save all settings to API and context
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // 1. Update merchant config via context
      await updateMerchantConfig({
        merchantPhotoUrl: photoUrlInput,
        merchantPayeeName: payeeNameInput.trim() || 'Ravi Kumar',
        merchantUpiId: upiIdInput.trim() || 'ravikanhauli91@ptyes',
        merchantVerified: verifiedToggle,
      });

      // 2. Update general platform settings
      const headers = typeof authHeaders === 'function' ? authHeaders() : authHeaders || {};
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          platformName,
          supportPhone,
          supportEmail,
          defaultCommissionPercentage: Number(commissionPercent),
          platformFee: Number(platformFee),
          selectedCity,
          cancellationWindowHours: Number(cancellationHours),
          instantApproval,
          merchantPhotoUrl: photoUrlInput,
          merchantPayeeName: payeeNameInput.trim() || 'Ravi Kumar',
          merchantUpiId: upiIdInput.trim() || 'ravikanhauli91@ptyes',
          merchantVerified: verifiedToggle,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save settings to server');
      }

      showToast('All platform and merchant settings saved successfully!', 'success');
    } catch (err: any) {
      console.error('Save settings error:', err);
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-teal-900/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#0df2a4]/10 text-[#0df2a4] border border-[#0df2a4]/30 mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>PLATFORM ADMINISTRATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform &amp; Merchant Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure UPI payment cards, merchant photo, platform commissions, and global details
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-6 py-3 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-extrabold text-sm shadow-[0_0_20px_rgba(13,242,164,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save All Settings</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: MERCHANT UPI QR CARD PHOTO & BRANDING (USER REQUEST CORE) */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#081521] border border-teal-500/30 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  UPI Merchant QR &amp; Profile Photo Settings
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  Live in UPI Card
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Admin can add, change, or remove the photo displayed on the official customer Paytm UPI QR card
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Controls on Left, Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Photo Controls & Fields (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Current Photo Status & Actions */}
            <div className="p-5 rounded-2xl bg-[#05111c] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Merchant Display Photo
                </span>
                {photoUrlInput ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Photo Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Photo Removed • Initials Active (RK)
                  </span>
                )}
              </div>

              {/* Photo Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                
                {/* 1. Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(13,242,164,0.25)]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Nayi Photo</span>
                </button>

                {/* 2. Remove Photo Button (The User Request Core Feature!) */}
                {photoUrlInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoUrlInput(null);
                      showToast('Photo removed! Card will now display initials.', 'info');
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(244,63,94,0.25)]"
                    title="Remove merchant photo and show initials (RK)"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Photo Hatao (Remove)</span>
                  </button>
                )}

                {/* 3. Reset to Default Button */}
                <button
                  type="button"
                  onClick={() => {
                    setPhotoUrlInput(DEFAULT_MERCHANT_PHOTO);
                    showToast('Default photo restored.', 'success');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Reset to default official merchant picture"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Default Restore</span>
                </button>
              </div>

              {/* Paste URL Option */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">
                  Ya direct image URL paste karein:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#040c13] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#0df2a4]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-[#0df2a4] text-[#0df2a4] hover:text-slate-950 font-bold text-xs border border-[#0df2a4]/40 transition-all cursor-pointer"
                  >
                    Set URL
                  </button>
                </div>
              </div>
            </div>

            {/* Merchant Identity Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Merchant Display Name
                </label>
                <input
                  type="text"
                  value={payeeNameInput}
                  onChange={(e) => setPayeeNameInput(e.target.value)}
                  placeholder="Ravi Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#05111c] border border-slate-800 text-white text-sm focus:outline-none focus:border-[#0df2a4]"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Name shown on top of the Paytm card &amp; UPI string
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Official Merchant UPI ID
                </label>
                <input
                  type="text"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  placeholder="ravikanhauli91@ptyes"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#05111c] border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-[#0df2a4]"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Target VPA address for customer payments
                </span>
              </div>
            </div>

            {/* Verified Badge Checkbox */}
            <div className="p-4 rounded-2xl bg-[#05111c] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-[#00baf2]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Verified Merchant Badge</div>
                  <div className="text-[11px] text-slate-400">
                    Display cyan verified checkmark on the card avatar
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={verifiedToggle}
                onChange={(e) => setVerifiedToggle(e.target.checked)}
                className="w-5 h-5 accent-[#0df2a4] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Live Interactive UPI QR Card Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full text-center mb-3">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider font-mono flex items-center justify-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#0df2a4]" />
                <span>Live Customer View Preview</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time preview of how customers see the card
              </p>
            </div>

            <div className="w-full max-w-sm transform scale-95 origin-top">
              <UpiQrCard
                amount={499}
                upiId={upiIdInput}
                payeeName={payeeNameInput}
                photoUrl={photoUrlInput}
                bookingCode="ORD-PREVIEW"
                showActions={false}
                allowEditPhoto={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: PLATFORM CHARGES & COMMISSIONS */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#081521] border border-teal-500/20 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#0df2a4]">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">
              Platform Charges &amp; Commissions
            </h2>
            <p className="text-xs text-slate-400">
              Set standard commissions deducted from provider earnings and customer convenience fee
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Commission (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="50"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#05111c] border border-slate-800 text-white text-sm focus:outline-none focus:border-[#0df2a4]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500">%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Platform Convenience Fee (₹)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={platformFee}
                onChange={(e) => setPlatformFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#05111c] border border-slate-800 text-white text-sm focus:outline-none focus:border-[#0df2a4]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500">INR</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default City
            </label>
            <input
              type="text"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#05111c] border border-slate-800 text-white text-sm focus:outline-none focus:border-[#0df2a4]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Free Cancellation Window
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="24"
                value={cancellationHours}
                onChange={(e) => setCancellationHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#05111c] border border-slate-800 text-white text-sm focus:outline-none focus:border-[#0df2a4]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500">Hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: COMPANY & SUPPORT CONTACT */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#081521] border border-teal-500/20 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">
              Company &amp; Support Contact
            </h2>
            <p className="text-xs text-slate-400">
              Shown to customers on receipts, invoices, and help desk
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Platform Name
            </label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#05111c] border border-slate-800 text-white text-sm focus:outline-none focus:border-[#0df2a4]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Support Helpline Phone
            </label>
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#05111c] border border-slate-800 text-white text-sm focus:outline-none focus:border-[#0df2a4]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Support Helpline Email
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#05111c] border border-slate-800 text-white text-sm focus:outline-none focus:border-[#0df2a4]"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="p-4 rounded-2xl bg-[#05111c] border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Check className="w-4 h-4 text-[#0df2a4]" />
          <span>All merchant photo and commission updates apply instantly across customer checkout and bookings.</span>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-extrabold text-xs shadow-[0_0_18px_rgba(13,242,164,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 w-full sm:w-auto"
        >
          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}
