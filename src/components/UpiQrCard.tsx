import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, ExternalLink, ShieldCheck, Sparkles, Pencil, Camera } from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';
import { useMerchantConfig } from '../context/MerchantConfigContext.tsx';
import { MerchantPhotoModal } from './MerchantPhotoModal.tsx';

interface UpiQrCardProps {
  amount?: number;
  upiId?: string;
  payeeName?: string;
  photoUrl?: string | null;
  bookingCode?: string;
  showActions?: boolean;
  allowEditPhoto?: boolean;
  onNavigateToAdmin?: () => void;
}

export function UpiQrCard({
  amount,
  upiId: propUpiId,
  payeeName: propPayeeName,
  photoUrl: propPhotoUrl,
  bookingCode,
  showActions = true,
  allowEditPhoto = true,
  onNavigateToAdmin,
}: UpiQrCardProps) {
  const { showToast } = useToast();
  const {
    merchantPhotoUrl,
    merchantPayeeName,
    merchantUpiId,
  } = useMerchantConfig();

  // Prefer props if explicitly passed, otherwise use live global merchant config
  const effectiveUpiId = propUpiId || merchantUpiId || 'ravikanhauli91@ptyes';
  const effectivePayeeName = propPayeeName || merchantPayeeName || 'Ravi Kumar';
  const effectivePhotoUrl = propPhotoUrl !== undefined ? propPhotoUrl : merchantPhotoUrl;

  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Compute initials for avatar fallback (e.g., 'Ravi Kumar' -> 'RK')
  const getInitials = (name: string) => {
    if (!name) return 'RK';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const initials = getInitials(effectivePayeeName);

  // Reset image load error if URL changes
  useEffect(() => {
    setImageLoadError(false);
  }, [effectivePhotoUrl]);

  // Construct standard UPI deep-link URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(effectiveUpiId)}&pn=${encodeURIComponent(effectivePayeeName)}${
    amount ? `&am=${amount}` : ''
  }&cu=INR${bookingCode ? `&tn=Booking%20${encodeURIComponent(bookingCode)}` : ''}`;

  useEffect(() => {
    QRCode.toDataURL(upiUri, {
      width: 480,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => {
        console.error('Failed to generate dynamic QR matrix:', err);
        setQrDataUrl('/upi-qr.svg');
      });
  }, [upiUri]);

  const handleCopy = () => {
    navigator.clipboard.writeText(effectiveUpiId);
    setCopied(true);
    showToast('UPI ID copied to clipboard: ' + effectiveUpiId, 'success');
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {/* Outer Paytm Card Frame matching user's exact uploaded image */}
      <div className="w-full bg-[#0b121e] rounded-3xl p-5 shadow-2xl border border-slate-800 text-center relative overflow-hidden">
        
        {/* Subtle top glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* 1. Profile Avatar & Verified Name */}
        <div className="flex flex-col items-center mb-4 relative z-10">
          <div className="relative mb-2 group/avatar">
            {/* Circular Gradient Ring */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-lg flex items-center justify-center relative">
              <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center text-white font-bold text-lg relative">
                {effectivePhotoUrl && !imageLoadError ? (
                  <img
                    src={effectivePhotoUrl}
                    alt={effectivePayeeName}
                    className="w-full h-full object-cover transition-opacity duration-200"
                    onError={() => {
                      setImageLoadError(true);
                    }}
                  />
                ) : null}
                {(!effectivePhotoUrl || imageLoadError) && (
                  <span className="text-white font-black tracking-wider text-base font-mono">
                    {initials}
                  </span>
                )}
              </div>
            </div>

            {/* Verified badge (Bottom Right) */}
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#00baf2] border-2 border-[#0b121e] flex items-center justify-center text-white shadow-sm z-10">
              <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
            </div>

            {/* EDIT PHOTO BUTTON REQUESTED BY USER */}
            {allowEditPhoto && (
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                title="Admin: Edit / Remove / Change Merchant Photo"
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 flex items-center justify-center shadow-lg border-2 border-[#0b121e] transition-all hover:scale-115 active:scale-95 cursor-pointer z-20 group-hover/avatar:ring-2 ring-amber-400/60"
              >
                <Pencil className="w-3 h-3 text-slate-950 stroke-[2.5]" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-bold text-white tracking-tight">{effectivePayeeName}</h3>
            <span className="w-4 h-4 rounded-full bg-[#00baf2] flex items-center justify-center text-white text-[10px] font-bold">
              ✓
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-slate-400 font-medium">Official Verified UPI Merchant</span>
            {allowEditPhoto && (
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                title="Edit merchant photo and details"
              >
                <span>Edit Photo</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Dual-Tone Paytm Card Container */}
        <div className="rounded-2xl overflow-hidden shadow-xl border border-sky-400/30 bg-gradient-to-b from-[#00baf2] via-[#00baf2] to-[#002970] p-4 pt-5 pb-5">
          
          {/* Inner Pure White Card Container */}
          <div className="bg-white rounded-2xl p-4 shadow-md flex flex-col items-center">
            
            {/* Paytm UPI Header */}
            <div className="flex items-center justify-center gap-1.5 pb-2 border-b border-slate-100 w-full mb-3">
              <span className="text-xl font-black text-[#002970] tracking-tight font-sans">paytm</span>
              <span className="text-rose-500 text-sm">❤️</span>
              <span className="text-xl font-black italic text-[#002970] tracking-wider">UPI</span>
              <span className="text-xs font-bold text-emerald-600 ml-1">▶</span>
            </div>

            {/* QR Code Matrix (Clear & Large) */}
            <div className="w-56 h-56 sm:w-60 sm:h-60 bg-white p-2 rounded-xl flex items-center justify-center relative">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`UPI QR Code for ${effectiveUpiId}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <div className="w-8 h-8 border-2 border-[#00baf2] border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-xs font-medium">Generating QR...</span>
                </div>
              )}
            </div>

            {/* UPI ID Pill with Orange Triangle */}
            <div className="mt-3 py-1.5 px-3 rounded-full bg-slate-50 border border-slate-200 flex items-center gap-1.5 text-slate-900 text-xs sm:text-sm font-bold font-mono">
              <span className="text-amber-500 font-bold text-xs">▶</span>
              <span className="select-all tracking-tight">{effectiveUpiId}</span>
            </div>
          </div>
        </div>

        {/* 3. Scan with any UPI app row */}
        <div className="mt-4 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] text-slate-400">
          <span className="font-medium text-slate-300">Scan with any UPI app:</span>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-[#00baf2] font-black text-[10px]">PAYTM</span>
            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-black text-[10px]">PHONEPE</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-black text-[10px]">GPAY</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black text-[10px]">BHIM</span>
          </div>
        </div>
      </div>

      {/* 4. Action Buttons (Copy UPI ID & Open in App) */}
      {showActions && (
        <div className="w-full mt-3 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#0a1824] hover:bg-[#0e2233] border border-teal-500/40 text-teal-300 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
          >
            {copied ? <Check className="w-4 h-4 text-[#0df2a4]" /> : <Copy className="w-4 h-4 text-[#0df2a4]" />}
            <span>{copied ? 'UPI ID Copied!' : 'Copy UPI ID'}</span>
          </button>

          <a
            href={upiUri}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(13,242,164,0.3)] active:scale-[0.98]"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Pay in UPI App</span>
          </a>
        </div>
      )}

      {/* Merchant Photo Management Modal */}
      {allowEditPhoto && (
        <MerchantPhotoModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onNavigateToAdminSettings={onNavigateToAdmin}
        />
      )}
    </div>
  );
}
