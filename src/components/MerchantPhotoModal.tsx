import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Trash2,
  Check,
  Image as ImageIcon,
  Link as LinkIcon,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Camera,
  AlertCircle
} from 'lucide-react';
import { useMerchantConfig, DEFAULT_MERCHANT_PHOTO } from '../context/MerchantConfigContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface MerchantPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAdminSettings?: () => void;
}

const PRESET_AVATARS = [
  {
    id: 'default',
    title: 'Original Verified Merchant',
    url: DEFAULT_MERCHANT_PHOTO,
  },
  {
    id: 'tech-male',
    title: 'Senior Master Electrician',
    url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'tech-male-2',
    title: 'Professional Service Lead',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'tech-female',
    title: 'Operations & Quality Lead',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
];

export function MerchantPhotoModal({
  isOpen,
  onClose,
  onNavigateToAdminSettings,
}: MerchantPhotoModalProps) {
  const {
    merchantPhotoUrl,
    merchantPayeeName,
    merchantUpiId,
    updateMerchantConfig,
    removeMerchantPhoto,
    isLoading,
  } = useMerchantConfig();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string | null>(merchantPhotoUrl);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [tempPayeeName, setTempPayeeName] = useState<string>(merchantPayeeName);
  const [tempUpiId, setTempUpiId] = useState<string>(merchantUpiId);
  const [imageError, setImageError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setTempPhotoUrl(merchantPhotoUrl);
      setCustomUrlInput(merchantPhotoUrl || '');
      setTempPayeeName(merchantPayeeName);
      setTempUpiId(merchantUpiId);
      setImageError(false);
    }
  }, [isOpen, merchantPhotoUrl, merchantPayeeName, merchantUpiId]);

  if (!isOpen) return null;

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    // Limit size to 4MB
    if (file.size > 4 * 1024 * 1024) {
      showToast('Image size should be less than 4MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setTempPhotoUrl(base64);
      setImageError(false);
      showToast('Image uploaded for preview! Click "Save Changes" to apply.', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Handle URL input apply
  const handleApplyUrl = () => {
    if (!customUrlInput.trim()) {
      showToast('Please enter an image URL', 'error');
      return;
    }
    setTempPhotoUrl(customUrlInput.trim());
    setImageError(false);
    showToast('Image URL applied for preview', 'info');
  };

  // Handle Remove Photo
  const handleRemovePhoto = () => {
    setTempPhotoUrl(null);
    setCustomUrlInput('');
    setImageError(false);
    showToast('Photo cleared. Avatar will show initials (RK).', 'info');
  };

  // Save changes
  const handleSave = async () => {
    await updateMerchantConfig({
      merchantPhotoUrl: tempPhotoUrl,
      merchantPayeeName: tempPayeeName.trim() || 'Ravi Kumar',
      merchantUpiId: tempUpiId.trim() || 'ravikanhauli91@ptyes',
    });
    onClose();
  };

  // Get Initials from Payee Name
  const getInitials = (name: string) => {
    if (!name) return 'RK';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#07131e] border border-teal-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-teal-900/40 bg-[#091a27] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Merchant Profile Photo</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#0df2a4]/15 text-[#0df2a4] border border-[#0df2a4]/30 font-mono">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Update, upload, or remove the picture shown on UPI QR cards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Live Avatar Preview Card */}
          <div className="p-4 rounded-2xl bg-[#040c13] border border-teal-500/20 flex flex-col sm:flex-row items-center gap-5 justify-between">
            <div className="flex items-center gap-4">
              {/* Circular Avatar Frame */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-xl flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center text-white font-bold text-xl relative">
                    {tempPhotoUrl && !imageError ? (
                      <img
                        src={tempPhotoUrl}
                        alt={tempPayeeName}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span className="text-white font-black tracking-wider text-xl font-mono">
                        {getInitials(tempPayeeName)}
                      </span>
                    )}
                  </div>
                </div>
                {/* Verified Badge */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#00baf2] border-2 border-[#040c13] flex items-center justify-center text-white shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-bold text-white">{tempPayeeName || 'Ravi Kumar'}</h4>
                  <span className="w-4 h-4 rounded-full bg-[#00baf2] flex items-center justify-center text-white text-[10px] font-bold">
                    ✓
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{tempUpiId}</div>
                <div className="mt-1 flex items-center gap-2">
                  {tempPhotoUrl ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Custom Photo Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Photo Removed • Showing Initials ({getInitials(tempPayeeName)})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Remove / Reset Buttons */}
            <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto shrink-0">
              {tempPhotoUrl ? (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                  title="Remove photo and show initials (RK)"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Photo Hatao (Remove)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setTempPhotoUrl(DEFAULT_MERCHANT_PHOTO)}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="Restore default merchant photo"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#0df2a4]" />
                  <span>Default Restore Karein</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs for Photo Source */}
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0df2a4]" />
              <span>Nayi Photo Set Karein (Add / Change Photo)</span>
            </div>

            <div className="flex rounded-xl bg-[#051017] p-1 border border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-[#0df2a4] text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Device se Upload</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'presets'
                    ? 'bg-[#0df2a4] text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Presets</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'url'
                    ? 'bg-[#0df2a4] text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Image Link / URL</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Upload from Device */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-teal-500/40 hover:border-[#0df2a4] bg-[#05111b] hover:bg-[#071826] transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0df2a4]/10 group-hover:bg-[#0df2a4]/20 border border-[#0df2a4]/30 flex items-center justify-center text-[#0df2a4] mb-3 transition-transform group-hover:scale-110">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white group-hover:text-[#0df2a4] transition-colors">
                  Device se Photo Select Karein
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  PNG, JPG, WebP supported (Max size 4MB). Instantly compressed for fast loading.
                </p>
                <button
                  type="button"
                  className="mt-3 px-4 py-1.5 rounded-lg bg-teal-500/20 text-[#0df2a4] font-extrabold text-xs border border-[#0df2a4]/40 group-hover:bg-[#0df2a4] group-hover:text-slate-950 transition-all pointer-events-none"
                >
                  Choose File
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Presets */}
          {activeTab === 'presets' && (
            <div className="grid grid-cols-2 gap-3">
              {PRESET_AVATARS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    setTempPhotoUrl(preset.url);
                    setImageError(false);
                    showToast(`${preset.title} selected for preview`, 'info');
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    tempPhotoUrl === preset.url
                      ? 'bg-[#0df2a4]/10 border-[#0df2a4] shadow-[0_0_15px_rgba(13,242,164,0.2)]'
                      : 'bg-[#05111b] border-slate-800 hover:border-teal-500/40'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.title}
                    className="w-11 h-11 rounded-full object-cover border border-teal-500/30 shrink-0"
                  />
                  <div className="overflow-hidden text-left">
                    <div className="text-xs font-bold text-white truncate">{preset.title}</div>
                    <div className="text-[10px] text-teal-400 mt-0.5">
                      {tempPhotoUrl === preset.url ? '✓ Selected' : 'Click to use'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Custom URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Direct Image URL (HTTPS link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#040c13] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#0df2a4]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2.5 rounded-xl bg-teal-500/20 hover:bg-[#0df2a4] text-[#0df2a4] hover:text-slate-950 border border-[#0df2a4]/40 font-bold text-xs transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Merchant Info quick fields */}
          <div className="p-4 rounded-2xl bg-[#05111b] border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Merchant Details (UPI Card)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Payee Name</label>
                <input
                  type="text"
                  value={tempPayeeName}
                  onChange={(e) => setTempPayeeName(e.target.value)}
                  placeholder="Ravi Kumar"
                  className="w-full px-3 py-2 rounded-xl bg-[#040c13] border border-slate-800 text-white text-xs focus:outline-none focus:border-[#0df2a4]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Official UPI ID</label>
                <input
                  type="text"
                  value={tempUpiId}
                  onChange={(e) => setTempUpiId(e.target.value)}
                  placeholder="ravikanhauli91@ptyes"
                  className="w-full px-3 py-2 rounded-xl bg-[#040c13] border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-[#0df2a4]"
                />
              </div>
            </div>
          </div>

          {/* Quick link to Admin Panel Settings */}
          {onNavigateToAdminSettings && (
            <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/20 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-300">
                Want to manage full system commissions and bank account details?
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToAdminSettings();
                }}
                className="text-[#0df2a4] hover:underline font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>Admin Settings</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-teal-900/40 bg-[#091a27] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 text-xs font-extrabold shadow-[0_0_18px_rgba(13,242,164,0.35)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
