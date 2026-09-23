import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Upload,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Info,
  ArrowRight,
  FileCheck,
  Trash2,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useMerchantConfig } from '../context/MerchantConfigContext.tsx';
import { UpiQrCard } from './UpiQrCard.tsx';
import type { Booking, PaymentRecord } from '../types.ts';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null;
  serviceOrPlan?: string;
  amount?: number;
  bookingCode?: string;
  bookingId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onPaymentSubmitted?: (payment: PaymentRecord) => void;
}

export function UpiPaymentModal({
  isOpen,
  onClose,
  booking,
  serviceOrPlan,
  amount,
  bookingCode,
  bookingId,
  customerName,
  customerEmail,
  customerPhone,
  onPaymentSubmitted,
}: UpiPaymentModalProps) {
  const { user, authHeaders } = useAuth();
  const { showToast } = useToast();
  const { merchantUpiId, merchantPayeeName } = useMerchantConfig();

  // Resolved authoritative display values
  const effectiveService = booking?.serviceName || serviceOrPlan || 'Standard Doorstep Service';
  const effectiveAmount = booking ? Number(booking.totalAmount) : (Number(amount) || 499);
  const effectiveBookingCode = booking?.bookingCode || bookingCode || (booking?.id ? `#${booking.id}` : `ORD-${Date.now().toString().slice(-6)}`);
  const effectiveBookingId = booking?.id || bookingId || effectiveBookingCode;
  const effectiveCustomerName = booking?.customerName || user?.name || customerName || 'Valued Customer';
  const effectiveCustomerEmail = booking?.customerEmail || user?.email || customerEmail || 'customer@sevaconnect.in';
  const effectiveCustomerPhone = booking?.customerPhone || user?.phone || customerPhone || '';

  const officialUpiId = merchantUpiId || 'ravikanhauli91@ptyes';
  const officialPayeeName = merchantPayeeName || 'Ravi Kumar';

  // Modal Step: 'PAY_SCAN' (Scan & Pay) | 'VERIFY_FORM' (Enter UTR) | 'SUBMITTED' (Done)
  const [activeStep, setActiveStep] = useState<'PAY_SCAN' | 'VERIFY_FORM' | 'SUBMITTED'>('PAY_SCAN');

  // Form Fields
  const [utr, setUtr] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedPayment, setSubmittedPayment] = useState<PaymentRecord | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setActiveStep('PAY_SCAN');
      setUtr('');
      setScreenshotBase64(null);
      setScreenshotFileName('');
      setErrorMessage(null);
      setIsSubmitting(false);
      setSubmittedPayment(null);
      setCopiedUpi(false);
    }
  }, [isOpen, booking, amount, bookingCode]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(officialUpiId);
    setCopiedUpi(true);
    showToast(`UPI ID copied: ${officialUpiId}`, 'success');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size must be less than 5MB.', 'error');
        return;
      }
      setScreenshotFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setScreenshotBase64(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUtr = utr.trim();
    if (!cleanUtr) {
      setErrorMessage('Please enter the UTR / Transaction ID from your UPI app.');
      return;
    }

    if (!/^[a-zA-Z0-9_\-\/\@\.]{6,35}$/.test(cleanUtr)) {
      setErrorMessage('Please enter a valid 6-35 character UTR / Transaction Reference Number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          bookingId: effectiveBookingId,
          bookingCode: effectiveBookingCode,
          serviceOrPlan: effectiveService,
          amount: effectiveAmount,
          customerId: user?.id || booking?.customerId || 'guest-user',
          customerName: effectiveCustomerName,
          customerEmail: effectiveCustomerEmail,
          customerPhone: effectiveCustomerPhone,
          utr: cleanUtr,
          screenshotUrl: screenshotBase64 || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Display exact server duplicate or validation message
        const err = data.error || 'Payment submission failed.';
        setErrorMessage(err);
        showToast(err, 'error');
        setIsSubmitting(false);
        return;
      }

      setSubmittedPayment(data.payment);
      setActiveStep('SUBMITTED');
      showToast('Payment submitted for verification successfully!', 'success');

      if (onPaymentSubmitted) {
        onPaymentSubmitted(data.payment);
      }
    } catch (err: any) {
      console.error('Payment submission network error:', err);
      const msg = err.message || 'Connection error. Please try submitting again.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl my-auto bg-[#07131b] border border-teal-500/40 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] text-white overflow-hidden animate-fadeIn">
        
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-teal-900/50 bg-[#040e14] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#0df2a4]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Secure UPI Payment</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  Zero Extra Fee
                </span>
              </h2>
              <p className="text-xs text-slate-400">Order Ref: <span className="font-mono text-teal-300">{effectiveBookingCode}</span></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 py-2.5 bg-[#030a0f] border-b border-teal-950 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => setActiveStep('PAY_SCAN')}
            className={`flex items-center gap-1.5 transition-colors ${
              activeStep === 'PAY_SCAN' ? 'text-[#0df2a4] font-bold' : 'hover:text-white'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              activeStep === 'PAY_SCAN' ? 'bg-[#0df2a4] text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
            }`}>1</span>
            <span>1. Scan &amp; Pay</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <button
            onClick={() => setActiveStep('VERIFY_FORM')}
            className={`flex items-center gap-1.5 transition-colors ${
              activeStep === 'VERIFY_FORM' ? 'text-[#0df2a4] font-bold' : 'hover:text-white'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              activeStep === 'VERIFY_FORM' ? 'bg-[#0df2a4] text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
            }`}>2</span>
            <span>2. Enter UTR Details</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <div className={`flex items-center gap-1.5 ${activeStep === 'SUBMITTED' ? 'text-amber-400 font-bold' : 'text-slate-600'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              activeStep === 'SUBMITTED' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-500'
            }`}>3</span>
            <span>3. Verification</span>
          </div>
        </div>

        {/* Main Modal Body */}
        <div className="p-5 sm:p-6 max-h-[72vh] overflow-y-auto space-y-5">
          
          {/* Summary Strip (Service, Customer, Amount) */}
          <div className="p-3.5 rounded-2xl bg-[#091b26] border border-teal-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Selected Service / Plan</span>
              <div className="font-semibold text-white text-sm">{effectiveService}</div>
              <div className="text-slate-400">Customer: <strong className="text-slate-200">{effectiveCustomerName}</strong></div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400">Amount Payable</span>
              <div className="text-xl sm:text-2xl font-black text-[#0df2a4] tracking-tight">₹{effectiveAmount}</div>
              <span className="text-[10px] text-slate-400 font-mono">ID: {effectiveBookingCode}</span>
            </div>
          </div>

          {/* ==================================================== */}
          {/* STEP 1: SCAN & PAY VIEW */}
          {/* ==================================================== */}
          {activeStep === 'PAY_SCAN' && (
            <div className="space-y-5">
              {/* Important Instruction Note */}
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-start gap-2.5 text-xs text-teal-200">
                <Info className="w-4 h-4 text-[#0df2a4] shrink-0 mt-0.5" />
                <p>
                  <strong>Instruction:</strong> Scan the QR code with any UPI app and complete the payment of{' '}
                  <strong className="text-white">₹{effectiveAmount}</strong>.
                </p>
              </div>

              {/* Exact Paytm UPI QR Card Component matching user picture */}
              <UpiQrCard
                amount={effectiveAmount}
                upiId={officialUpiId}
                payeeName={officialPayeeName}
                bookingCode={effectiveBookingCode}
                showActions={true}
              />

              {/* Copy UPI ID Box */}
              <div className="p-3.5 rounded-2xl bg-[#051118] border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Official UPI ID for Direct Transfer:</div>
                  <div className="font-mono text-sm sm:text-base font-bold text-white tracking-wide">{officialUpiId}</div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="py-2 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-[#0df2a4]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Next Step Callout */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('VERIFY_FORM')}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(13,242,164,0.4)] cursor-pointer active:scale-[0.99]"
                >
                  <span>I Have Completed Payment • Enter UTR</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 2: PAYMENT VERIFICATION FORM */}
          {/* ==================================================== */}
          {activeStep === 'VERIFY_FORM' && (
            <form onSubmit={handleSubmitVerification} className="space-y-4">
              
              {/* Instruction banner as requested */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  After completing the payment, enter the UTR/Transaction ID from your UPI app and submit it for verification.
                </p>
              </div>

              {/* Error banner */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-start gap-2 text-xs text-rose-300 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Auto-filled read-only fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Customer Name */}
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Customer Name</label>
                  <input
                    type="text"
                    value={effectiveCustomerName}
                    readOnly
                    disabled
                    className="w-full py-2.5 px-3 rounded-xl bg-[#040e14] border border-slate-800 text-slate-300 font-semibold cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                  <input
                    type="text"
                    value={effectiveCustomerEmail}
                    readOnly
                    disabled
                    className="w-full py-2.5 px-3 rounded-xl bg-[#040e14] border border-slate-800 text-slate-300 font-semibold cursor-not-allowed"
                  />
                </div>

                {/* Booking/Order ID */}
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Booking / Order ID</label>
                  <input
                    type="text"
                    value={effectiveBookingCode}
                    readOnly
                    disabled
                    className="w-full py-2.5 px-3 rounded-xl bg-[#040e14] border border-slate-800 text-slate-300 font-mono font-semibold cursor-not-allowed"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Amount Payable</label>
                  <input
                    type="text"
                    value={`₹${effectiveAmount}`}
                    readOnly
                    disabled
                    className="w-full py-2.5 px-3 rounded-xl bg-[#040e14] border border-slate-800 text-emerald-400 font-black cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Service/Plan — Auto-filled */}
              <div className="text-xs">
                <label className="block text-slate-400 mb-1 font-medium">Service / Plan</label>
                <input
                  type="text"
                  value={effectiveService}
                  readOnly
                  disabled
                  className="w-full py-2.5 px-3 rounded-xl bg-[#040e14] border border-slate-800 text-slate-300 font-semibold cursor-not-allowed"
                />
              </div>

              {/* UTR / Transaction ID (REQUIRED) */}
              <div className="text-xs">
                <label className="block text-teal-300 font-bold mb-1.5 flex items-center justify-between">
                  <span>UTR / Transaction ID <span className="text-rose-400">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Found in UPI app transfer receipt</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={utr}
                    onChange={(e) => {
                      setUtr(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. 427819034821 or T26092014..."
                    required
                    className="w-full py-3 px-3.5 rounded-xl bg-[#040f17] border border-teal-500/50 focus:border-[#0df2a4] focus:ring-2 focus:ring-[#0df2a4]/20 text-white font-mono font-bold text-sm tracking-wider placeholder-slate-600 outline-none transition-all shadow-inner"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Every UPI app (GPay, PhonePe, Paytm, BHIM) provides a unique 12-digit or alphanumeric UTR / Reference No.
                </p>
              </div>

              {/* Optional Screenshot Upload */}
              <div className="text-xs pt-1">
                <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                  <span>Payment Screenshot <span className="text-slate-500 font-normal">(Optional)</span></span>
                  <span className="text-[10px] text-slate-500">Max 5MB</span>
                </label>

                {screenshotBase64 ? (
                  <div className="p-3 rounded-xl bg-[#040e14] border border-teal-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={screenshotBase64}
                        alt="Screenshot Preview"
                        className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div className="truncate">
                        <div className="text-white font-medium truncate text-xs">{screenshotFileName || 'payment-receipt.png'}</div>
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Image attached
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotBase64(null);
                        setScreenshotFileName('');
                      }}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border border-dashed border-teal-500/30 hover:border-teal-500/60 rounded-xl bg-[#040f17]/60 hover:bg-[#040f17] transition-all cursor-pointer group">
                    <Upload className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform mb-1.5" />
                    <span className="text-xs font-semibold text-slate-300">Click or drag &amp; drop payment screenshot</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, or WEBP receipt</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep('PAY_SCAN')}
                  className="py-3 px-4 rounded-xl border border-slate-700 hover:bg-white/5 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Back to QR
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !utr.trim()}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] active:scale-[0.99] disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(13,242,164,0.4)] cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting For Verification...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Submit Payment for Verification</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ==================================================== */}
          {/* STEP 3: SUBMITTED & PENDING VERIFICATION */}
          {/* ==================================================== */}
          {activeStep === 'SUBMITTED' && (
            <div className="text-center py-4 space-y-4 animate-fadeIn">
              
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-1">
                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs tracking-wider uppercase">
                  Pending Verification
                </div>
                <h3 className="text-lg font-bold text-white pt-1">Payment Received for Verification</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your UTR <strong className="font-mono text-teal-300">{submittedPayment?.utr || utr}</strong> has been securely logged in our system. Our finance team will verify the bank credit and update your booking status to <span className="text-emerald-400 font-semibold">PAID</span> shortly.
                </p>
              </div>

              {/* Payment Details Card */}
              <div className="p-4 rounded-2xl bg-[#040e14] border border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Payment ID:</span>
                  <span className="font-mono font-bold text-white">{submittedPayment?.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Booking Reference:</span>
                  <span className="font-mono text-teal-300 font-bold">{effectiveBookingCode}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Amount:</span>
                  <span className="font-bold text-[#0df2a4]">₹{effectiveAmount}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Verified By Admin:</span>
                  <span className="text-amber-400 font-semibold">Awaiting Verification</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Submission Date:</span>
                  <span className="text-slate-300">{new Date().toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-8 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/50 text-[#0df2a4] font-bold text-xs transition-all cursor-pointer"
                >
                  Done • View My Bookings
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-3 border-t border-teal-900/40 bg-[#040a0e] flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-teal-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Encrypted &amp; Admin Audited
          </span>
          <span className="font-mono text-slate-500">Official UPI: {officialUpiId}</span>
        </div>
      </div>
    </div>
  );
}
