import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import type { ServiceCategory, ProviderProfile, Booking } from '../types.ts';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  FileText,
  Camera,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  IndianRupee,
  User,
  Printer,
  Download,
  Copy,
  Check,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { UpiPaymentModal } from './UpiPaymentModal.tsx';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedServiceId?: string;
  preselectedProviderId?: string;
  onBookingSuccess: (booking: Booking) => void;
  selectedCity: string;
  selectedArea: string;
}

export function BookingModal({
  isOpen,
  onClose,
  preselectedServiceId,
  preselectedProviderId,
  onBookingSuccess,
  selectedCity,
  selectedArea,
}: BookingModalProps) {
  const { user, authHeaders } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [copied, setCopied] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);

  // Data collections
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [providers, setProviders] = useState<any[]>([]);

  // Form State
  const [serviceId, setServiceId] = useState<string>(preselectedServiceId || '');
  const [providerId, setProviderId] = useState<string>(preselectedProviderId || '');
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM - 12:00 PM');
  const [address, setAddress] = useState<string>(
    user?.customerProfile?.defaultAddress || 'Flat 302, Maurya Vihar, Boring Road'
  );
  const [city, setCity] = useState<string>('Patna');
  const [area, setArea] = useState<string>(selectedArea || 'Boring Road');
  const [pincode, setPincode] = useState<string>('800001');
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [problemImageUrl, setProblemImageUrl] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Pay After Service (Cash / UPI)');

  // Fetch services and providers
  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        setServices(data.filter((s: ServiceCategory) => s.isActive));
        if (!serviceId && data.length > 0) {
          setServiceId(data[0].id);
        }
      })
      .catch((err) => console.error(err));

    fetch('/api/providers?verificationStatus=APPROVED')
      .then((res) => res.json())
      .then((data) => {
        setProviders(data);
        if (preselectedProviderId) {
          setProviderId(preselectedProviderId);
        } else if (data.length > 0 && !providerId) {
          setProviderId(data[0].userId);
        }
      })
      .catch((err) => console.error(err));
  }, [isOpen, preselectedProviderId]);

  useEffect(() => {
    if (preselectedServiceId) setServiceId(preselectedServiceId);
    if (preselectedProviderId) setProviderId(preselectedProviderId);
  }, [preselectedServiceId, preselectedProviderId]);

  if (!isOpen) return null;

  const currentService = services.find((s) => s.id === serviceId);
  const currentProvider = providers.find((p) => p.userId === providerId);

  // Price calculations
  const baseRate = currentProvider?.pricingStartingAt || currentService?.basePrice || 299;
  const platformFee = 49;
  const taxAmount = Math.round(baseRate * 0.05);
  const totalAmount = baseRate + platformFee + taxAmount;

  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
  ];

  // Quick date options
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  const formatDateVal = (d: Date) => d.toISOString().split('T')[0];

  const handleCreateBooking = async () => {
    if (!address.trim()) {
      showToast('Please enter your service address', 'error');
      setStep(3);
      return;
    }

    const lowerCity = (city || '').trim().toLowerCase();
    if (lowerCity && !lowerCity.includes('patna')) {
      showToast('Services & offers are exclusively available within Patna District (All city zones & villages).', 'error');
      setStep(3);
      return;
    }

    if (!problemDescription.trim()) {
      showToast('Please describe the problem so the technician arrives prepared', 'error');
      setStep(3);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          providerId,
          serviceId,
          date: bookingDate,
          timeSlot,
          address,
          city,
          area,
          pincode,
          problemDescription,
          problemImageUrl: problemImageUrl || undefined,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Booking creation failed');
      }

      setConfirmedBooking(data);
      showToast(`Booking ${data.bookingCode} confirmed!`, 'success');
      onBookingSuccess(data);
      if (paymentMethod.includes('Prepaid UPI')) {
        setShowUpiModal(true);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit booking', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      showToast('Print dialog unavailable. You can download or copy the receipt below.', 'info');
    }
  };

  const handleCopySlip = () => {
    if (!confirmedBooking) return;
    const text = `===========================================
SEVA CONNECTER - OFFICIAL BOOKING RECEIPT
Booking Code: #${confirmedBooking.bookingCode}
Date Placed: ${new Date(confirmedBooking.createdAt).toLocaleString('en-IN')}
-------------------------------------------
CUSTOMER DETAILS:
Name: ${confirmedBooking.customerName || user?.name || 'Customer'}
Phone: ${confirmedBooking.customerPhone || user?.phone || 'N/A'}
Address: ${confirmedBooking.address}, ${confirmedBooking.area}, ${confirmedBooking.city} - ${confirmedBooking.pincode}

SERVICE & TECHNICIAN:
Service: ${confirmedBooking.serviceName}
Technician: ${confirmedBooking.providerName}
Appointment: ${confirmedBooking.date} at ${confirmedBooking.timeSlot}
Work Description: ${confirmedBooking.problemDescription || 'Standard Doorstep Inspection & Repair'}

BILLING BREAKDOWN:
Inspection & Labor Base: ₹${confirmedBooking.estimatedPrice}
Doorstep Safety & Platform Fee: ₹${confirmedBooking.platformFee}
GST / Taxes (18%): ₹${confirmedBooking.taxAmount}
-------------------------------------------
TOTAL AMOUNT PAYABLE: ₹${confirmedBooking.totalAmount}
Payment Method: ${confirmedBooking.paymentMethod} (${confirmedBooking.paymentStatus})
-------------------------------------------
DOORSTEP VERIFICATION OTP: ${confirmedBooking.bookingCode.slice(-4) || '8294'}
(Share this 4-digit code with the technician upon doorstep arrival)

30-Day Doorstep Service Guarantee Included
Customer Care: +91 98290 11111 | support@sevaconnect.in
===========================================`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Booking details copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSlip = () => {
    if (!confirmedBooking) return;
    const text = `===========================================
SEVA CONNECTER - DOORSTEP HOME SERVICE RECEIPT
Booking Reference: #${confirmedBooking.bookingCode}
Placed: ${new Date(confirmedBooking.createdAt).toLocaleString('en-IN')}
Status: CONFIRMED
-------------------------------------------
CUSTOMER & LOCATION:
Name: ${confirmedBooking.customerName || user?.name || 'Customer'}
Phone: ${confirmedBooking.customerPhone || user?.phone || 'N/A'}
Address: ${confirmedBooking.address}, ${confirmedBooking.area}, ${confirmedBooking.city} - ${confirmedBooking.pincode}

ASSIGNED TECHNICIAN:
Provider: ${confirmedBooking.providerName}
Service: ${confirmedBooking.serviceName}
Date & Slot: ${confirmedBooking.date} (${confirmedBooking.timeSlot})
Issue Notes: ${confirmedBooking.problemDescription || 'Standard doorstep service'}

ITEMIZED CHARGES:
1. Base Inspection & Labor Fee: ₹${confirmedBooking.estimatedPrice}
2. Doorstep Safety & Platform:   ₹${confirmedBooking.platformFee}
3. Taxes (18% GST):              ₹${confirmedBooking.taxAmount}
-------------------------------------------
TOTAL PAYABLE:                   ₹${confirmedBooking.totalAmount}
Payment Mode:                    ${confirmedBooking.paymentMethod}
Payment Status:                  ${confirmedBooking.paymentStatus}
-------------------------------------------
SECURITY OTP: ${confirmedBooking.bookingCode.slice(-4) || '8294'}
30-Day Doorstep Re-work Guarantee
Helpline: +91 98290 11111 | support@sevaconnect.in
===========================================`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SevaConnecter-Receipt-${confirmedBooking.bookingCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Order slip downloaded successfully!', 'success');
  };

  const handleReset = () => {
    setConfirmedBooking(null);
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 no-print">
          <div>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
              {confirmedBooking ? 'Order Slip & Receipt' : `Step ${step} of 4 • Booking Request`}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
              {confirmedBooking ? 'Service Scheduled Successfully!' : 'Book Doorstep Professional'}
            </h2>
          </div>
          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUCCESS STATE / PRINTABLE ORDER SLIP */}
        {confirmedBooking ? (
          <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Top Success Badge */}
            <div className="text-center no-print space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner ring-4 ring-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Your Booking is Confirmed!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                We have notified <strong>{confirmedBooking.providerName}</strong>. You can print or download this official booking slip below for your records.
              </p>
            </div>

            {/* PRINTABLE ORDER SLIP CONTAINER */}
            <div
              id="printable-order-slip"
              className="printable-order-slip bg-white rounded-2xl border-2 border-slate-300 p-5 sm:p-6 text-slate-900 shadow-sm space-y-4 text-xs"
            >
              {/* Slip Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <h4 className="font-extrabold text-base tracking-tight text-slate-900 uppercase">
                      SEVA CONNECTER
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Doorstep Home Care & Maintenance • Patna, Bihar
                  </p>
                  <p className="text-[10px] text-slate-400">GSTIN: 08AAACF9820P1ZX • Care: +91 98290 11111</p>
                </div>
                <div className="sm:text-right bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-100">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 block">
                    Official Booking Reference
                  </span>
                  <span className="font-mono font-extrabold text-indigo-900 text-base">
                    #{confirmedBooking.bookingCode}
                  </span>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                    ● DISPATCH SCHEDULED
                  </span>
                </div>
              </div>

              {/* Security OTP & Timestamp Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Booked On</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {new Date(confirmedBooking.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold text-indigo-600 block uppercase">Doorstep Verification OTP</span>
                    <span className="font-mono font-extrabold text-indigo-950 text-sm tracking-widest">
                      {confirmedBooking.bookingCode.slice(-4) || '8294'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2-Column Info: Customer & Technician */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Customer Column */}
                <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-200">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Customer Details</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Name & Contact:</span>
                    <p className="font-bold text-slate-900">
                      {confirmedBooking.customerName || user?.name || 'Valued Customer'}
                    </p>
                    <p className="text-slate-600 font-mono text-[11px]">
                      {confirmedBooking.customerPhone || user?.phone || '+91 98290 00000'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Doorstep Service Address:</span>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {confirmedBooking.address}, {confirmedBooking.area}, {confirmedBooking.city} - {confirmedBooking.pincode}
                    </p>
                  </div>
                </div>

                {/* Assigned Provider Column */}
                <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Assigned Professional</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Service Technician:</span>
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      {confirmedBooking.providerName}
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        KYC Verified
                      </span>
                    </p>
                    <p className="text-slate-600 text-[11px]">Category: {confirmedBooking.serviceName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Scheduled Appointment Slot:</span>
                    <p className="font-bold text-indigo-700 text-xs">
                      {confirmedBooking.date} • {confirmedBooking.timeSlot}
                    </p>
                  </div>
                </div>
              </div>

              {/* Work Needed Note */}
              {confirmedBooking.problemDescription && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                    Customer Problem Description / Scope
                  </span>
                  <p className="text-slate-800 font-medium italic">
                    &quot;{confirmedBooking.problemDescription}&quot;
                  </p>
                </div>
              )}

              {/* ITEMIZED BILL & PRICING BREAKDOWN */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-300">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Itemized Billing Breakdown
                  </span>
                  <span className="text-[10px] text-slate-400">All prices in INR (₹)</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between py-2">
                    <div>
                      <p className="font-semibold text-slate-800">1. Standard Inspection & Diagnosis</p>
                      <p className="text-[10px] text-slate-400">Includes doorstep technician visit & tool diagnostic</p>
                    </div>
                    <span className="font-mono font-bold text-slate-900">₹{confirmedBooking.estimatedPrice}</span>
                  </div>

                  <div className="flex justify-between py-2">
                    <div>
                      <p className="font-semibold text-slate-800">2. Safety & Convenience Platform Fee</p>
                      <p className="text-[10px] text-slate-400">Escrow security & partner insurance</p>
                    </div>
                    <span className="font-mono font-bold text-slate-900">₹{confirmedBooking.platformFee}</span>
                  </div>

                  <div className="flex justify-between py-2">
                    <div>
                      <p className="font-semibold text-slate-800">3. Applicable GST / Levies (18%)</p>
                      <p className="text-[10px] text-slate-400">Central & State tax</p>
                    </div>
                    <span className="font-mono font-bold text-slate-900">₹{confirmedBooking.taxAmount}</span>
                  </div>

                  {/* Net Total Row */}
                  <div className="flex justify-between items-center py-2.5 bg-indigo-50/70 px-3 rounded-xl border border-indigo-100 mt-1">
                    <div>
                      <span className="font-bold text-indigo-950 text-sm block">Total Payable Amount</span>
                      <span className="text-[10px] text-indigo-700 font-medium">
                        Payment: {confirmedBooking.paymentMethod} ({confirmedBooking.paymentStatus})
                      </span>
                    </div>
                    <span className="font-mono font-black text-indigo-950 text-lg">
                      ₹{confirmedBooking.totalAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Guarantee Banner */}
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-start gap-2.5 text-[11px] text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">30-Day Doorstep Guarantee Included</span>
                  <span className="text-emerald-800/90 leading-relaxed text-[10px]">
                    If the same issue reoccurs within 30 days of service completion, our technician will re-inspect it at zero consultation charge.
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION CONTROLS (PRINT / DOWNLOAD / COPY / MY BOOKINGS) */}
            <div className="no-print space-y-3 pt-1">
              {/* Instant UPI Payment Banner */}
              {confirmedBooking.paymentStatus !== 'PAID' && (
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-4 rounded-2xl border-2 border-emerald-400/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Instant UPI Payment Available
                      </span>
                      <p className="text-xs text-slate-700">
                        Scan &amp; pay <strong className="text-emerald-950 font-bold">₹{confirmedBooking.totalAmount}</strong> to <strong className="font-mono text-emerald-900">ravikanhauli91@ptyes</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowUpiModal(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay with UPI Now</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Print Order Button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Slip / Receipt</span>
                </button>

                {/* Download Text Slip */}
                <button
                  type="button"
                  onClick={handleDownloadSlip}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs border border-slate-200 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Download Slip</span>
                </button>

                {/* Copy Booking Reference */}
                <button
                  type="button"
                  onClick={handleCopySlip}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs border border-slate-200 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600" />
                      <span>Copy Details</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors underline underline-offset-4"
                >
                  Done &bull; Close Window & Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Step Progress Bar */}
            <div className="grid grid-cols-4 border-b border-slate-100 text-[11px] font-semibold text-center bg-slate-50/50">
              <button
                onClick={() => setStep(1)}
                className={`py-2.5 border-b-2 transition-all ${
                  step === 1
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : step > 1
                    ? 'border-emerald-500 text-emerald-700'
                    : 'border-transparent text-slate-400'
                }`}
              >
                1. Service
              </button>
              <button
                onClick={() => setStep(2)}
                className={`py-2.5 border-b-2 transition-all ${
                  step === 2
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : step > 2
                    ? 'border-emerald-500 text-emerald-700'
                    : 'border-transparent text-slate-400'
                }`}
              >
                2. Professional
              </button>
              <button
                onClick={() => setStep(3)}
                className={`py-2.5 border-b-2 transition-all ${
                  step === 3
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : step > 3
                    ? 'border-emerald-500 text-emerald-700'
                    : 'border-transparent text-slate-400'
                }`}
              >
                3. Date & Address
              </button>
              <button
                onClick={() => setStep(4)}
                className={`py-2.5 border-b-2 transition-all ${
                  step === 4
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-400'
                }`}
              >
                4. Review & Pay
              </button>
            </div>

            {/* STEP 1: SELECT SERVICE */}
            {step === 1 && (
              <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <p className="text-xs text-slate-600 font-medium">
                  Select the category of home maintenance or appliance care you require:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setServiceId(srv.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between ${
                        serviceId === srv.id
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                          {srv.categoryGroup}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5">{srv.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{srv.description}</p>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md shrink-0 ml-2">
                        ₹{srv.basePrice}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: SELECT PROVIDER */}
            {step === 2 && (
              <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <p className="text-xs text-slate-600 font-medium">
                  Select a verified technician specialized in {currentService?.name || 'this service'}:
                </p>
                <div className="space-y-3">
                  {providers
                    .filter(
                      (p) =>
                        !currentService ||
                        p.serviceCategory.toLowerCase() === currentService.name.toLowerCase() ||
                        p.services.some((s: string) => s.toLowerCase().includes(currentService.name.toLowerCase())) ||
                        true // Fallback to allow any approved technician if category specific is limited
                    )
                    .map((prov) => (
                      <button
                        key={prov.userId}
                        type="button"
                        onClick={() => setProviderId(prov.userId)}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                          providerId === prov.userId
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              prov.user?.avatarUrl ||
                              'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={prov.user?.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">{prov.user?.name}</h4>
                              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                                Verified
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {prov.experienceYears} Yrs Exp • {prov.completedJobsCount} Jobs Done
                            </p>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                              Serves: {prov.serviceAreas.join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-amber-600 flex items-center justify-end gap-1">
                            ★ {prov.rating} ({prov.reviewCount})
                          </div>
                          <span className="text-xs font-bold text-slate-900 block mt-1">
                            ₹{prov.pricingStartingAt}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* STEP 3: DATE, TIME & LOCATION */}
            {step === 3 && (
              <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Date Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Preferred Date
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setBookingDate(formatDateVal(today))}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        bookingDate === formatDateVal(today)
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      Today ({today.toLocaleDateString([], { month: 'short', day: 'numeric' })})
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingDate(formatDateVal(tomorrow))}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        bookingDate === formatDateVal(tomorrow)
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      Tomorrow ({tomorrow.toLocaleDateString([], { month: 'short', day: 'numeric' })})
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingDate(formatDateVal(dayAfter))}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        bookingDate === formatDateVal(dayAfter)
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      Day After ({dayAfter.toLocaleDateString([], { month: 'short', day: 'numeric' })})
                    </button>
                  </div>
                </div>

                {/* Time Slot Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Available Time Slot
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTimeSlot(slot)}
                        className={`py-2 px-2.5 rounded-xl border text-xs text-center transition-all flex items-center justify-center gap-1.5 ${
                          timeSlot === slot
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{slot}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service Address */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Service Address / Doorstep Location
                    </label>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      📍 Patna District Exclusive
                    </span>
                  </div>

                  {/* Patna District Exclusive Notice */}
                  <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div className="leading-snug">
                      <strong className="text-teal-900 block font-bold">
                        Exclusive Service &amp; Offers for Patna District Residents:
                      </strong>
                      <span className="text-slate-600 text-[11px] block mt-0.5">
                        Our verified technician network covers all urban localities, blocks, and rural villages across Patna District (हर गाँव और शहर में सेवा उपलब्ध).
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      House / Flat / Plot / Village Landmark *
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. House No. 24, Near Panchayat Bhawan / Main Chowk"
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600 shadow-2xs"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Locality / Block / Village
                      </label>
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. Boring Road or Bihta"
                        className="w-full px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600 shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        City / District
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Patna"
                        className="w-full px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600 shadow-2xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="800001"
                        className="w-full px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Problem Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1">
                    Describe Problem / Work Needed
                  </label>
                  <textarea
                    rows={3}
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    placeholder="e.g. MCB tripping frequently when geyser turns on, burning smell from main switchboard..."
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-600 shadow-2xs"
                  />
                </div>

                {/* Optional Image URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Optional Problem Photo</span>
                    <span className="text-slate-500 font-normal">Helps technician bring right tools</span>
                  </label>
                  <div className="relative">
                    <Camera className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={problemImageUrl}
                      onChange={(e) => setProblemImageUrl(e.target.value)}
                      placeholder="Paste photo link (or leave blank)"
                      className="w-full pl-9 pr-3.5 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-600 shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & PRICE BREAKDOWN */}
            {step === 4 && (
              <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 pb-2 border-b border-indigo-100">
                    <span>{currentService?.name}</span>
                    <span>with {currentProvider?.user?.name}</span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>
                      {bookingDate} ({timeSlot})
                    </span>
                  </div>
                  <div className="text-slate-600 flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                    <span>
                      {address}, {area}, {city} - {pincode}
                    </span>
                  </div>
                  {problemDescription && (
                    <div className="text-slate-600 flex items-start gap-2 pt-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                      <span className="italic line-clamp-2">&quot;{problemDescription}&quot;</span>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                    Transparent Bill Breakdown
                  </h4>
                  <div className="flex justify-between text-slate-600">
                    <span>Service Starting Inspection Fee:</span>
                    <span>₹{baseRate}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Platform Convenience & Safety Fee:</span>
                    <span>₹{platformFee}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pb-2 border-b border-slate-200">
                    <span>GST (5%):</span>
                    <span>₹{taxAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
                    <span>Estimated Total Payable:</span>
                    <span className="text-indigo-600">₹{totalAmount}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    *Material costs (wires, valves, capacitors) if needed will be estimated upfront with your consent.
                  </p>
                </div>

                {/* Payment Option */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Prepaid UPI (Scan & Pay)')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        paymentMethod.includes('Prepaid UPI')
                          ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold">Prepaid UPI</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Scan QR &amp; Pay Instant</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Pay After Service (Cash / UPI)')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        paymentMethod.includes('Pay After Service')
                          ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold">Pay After Service</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Cash or UPI upon work completion</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Prepaid Online (Cards / NetBanking)')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        paymentMethod.includes('Cards')
                          ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold">Cards / NetBanking</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Digital Banking Gateway</div>
                    </button>
                  </div>

                  {paymentMethod.includes('Prepaid UPI') && (
                    <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        Official merchant UPI: <strong className="font-mono text-emerald-950">ravikanhauli91@ptyes</strong>. Payment QR and UTR verification will open immediately upon confirmation.
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Backed by <strong>SevaConnect 30-Day Guarantee</strong>. Free revisit if issue recurs.
                  </span>
                </div>
              </div>
            )}

            {/* Modal Navigation Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCreateBooking}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
                >
                  {submitting ? 'Placing Order...' : 'Confirm & Schedule Booking'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {confirmedBooking && (
        <UpiPaymentModal
          isOpen={showUpiModal}
          booking={confirmedBooking}
          onClose={() => setShowUpiModal(false)}
          onPaymentSubmitted={() => {
            setShowUpiModal(false);
            setConfirmedBooking((prev) => (prev ? { ...prev, paymentStatus: 'PENDING' } : null));
          }}
        />
      )}
    </div>
  );
}
