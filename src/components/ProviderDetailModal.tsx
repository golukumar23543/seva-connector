import React from 'react';
import type { ProviderProfile, Review } from '../types.ts';
import {
  X,
  Star,
  ShieldCheck,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Phone,
  MessageSquare,
} from 'lucide-react';

interface ProviderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: any | null;
  onBookNow: (providerId: string, serviceCategory: string) => void;
}

export function ProviderDetailModal({
  isOpen,
  onClose,
  provider,
  onBookNow,
}: ProviderDetailModalProps) {
  if (!isOpen || !provider) return null;

  const reviews: Review[] = provider.reviews || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Hero Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={
                provider.user?.avatarUrl ||
                'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
              }
              alt={provider.user?.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white/30 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display text-white">{provider.user?.name}</h2>
                <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Partner
                </span>
              </div>
              <p className="text-indigo-200 text-xs mt-0.5 font-medium">{provider.serviceCategory}</p>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {provider.rating} ({provider.reviewCount} reviews)
                </span>
                <span>•</span>
                <span>{provider.experienceYears} Years Experience</span>
                <span>•</span>
                <span>{provider.completedJobsCount} Jobs Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Bio */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Professional Background & Expertise
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {provider.bio || 'Verified certified technician with standard safety toolkit and guarantee.'}
            </p>
          </div>

          {/* Service Areas & Working Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-indigo-600 font-bold mb-1.5">
                <MapPin className="w-4 h-4" />
                <span>Service Areas Covered</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {provider.serviceAreas?.map((area: string) => (
                  <span
                    key={area}
                    className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-indigo-600 font-bold mb-1.5">
                <Clock className="w-4 h-4" />
                <span>Working Hours & Rate</span>
              </div>
              <p className="text-slate-600">{provider.workingHours || '09:00 AM - 08:00 PM'}</p>
              <p className="font-bold text-slate-900 mt-1">
                Starting Fee: ₹{provider.pricingStartingAt}{' '}
                <span className="font-normal text-slate-400">(Includes Doorstep Inspection)</span>
              </p>
            </div>
          </div>

          {/* Services offered list */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Common Services Handled
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {provider.services?.map((srv: string) => (
                <div
                  key={srv}
                  className="flex items-center gap-2 p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl text-xs text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{srv}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Photos if any */}
          {provider.portfolioPhotos && provider.portfolioPhotos.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Work Portfolio & Completed Installations
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {provider.portfolioPhotos.map((imgUrl: string, idx: number) => (
                  <img
                    key={idx}
                    src={imgUrl}
                    alt="Work sample"
                    referrerPolicy="no-referrer"
                    className="w-full h-32 object-cover rounded-xl border border-slate-200 shadow-xs"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                Verified Customer Reviews ({reviews.length})
              </h3>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{provider.rating} average</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                No customer reviews yet. Be the first to book and rate!
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {rev.customerAvatar ? (
                          <img
                            src={rev.customerAvatar}
                            alt={rev.customerName}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                            {rev.customerName.charAt(0)}
                          </div>
                        )}
                        <span className="font-bold text-slate-900">{rev.customerName}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                          Verified Service
                        </span>
                      </div>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed italic">&quot;{rev.reviewText}&quot;</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(rev.createdAt).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400">Starting inspection from</span>
            <p className="text-base font-bold text-slate-900 font-display">₹{provider.pricingStartingAt}</p>
          </div>
          <button
            onClick={() => {
              onClose();
              onBookNow(provider.userId, provider.serviceCategory);
            }}
            className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
