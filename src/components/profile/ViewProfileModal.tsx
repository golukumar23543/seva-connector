import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShieldCheck,
  Edit3,
  BadgeCheck,
  CheckCircle2,
  Lock,
  Clock,
  Camera,
  Upload,
  Sparkles,
  Copy,
  Check,
  Loader2,
  Image as ImageIcon,
  Award,
  Crown,
} from 'lucide-react';
import type { User as UserType } from '../../types.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface ViewProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: () => void;
  user: UserType | null;
}

// 6 Curated, high-resolution premium avatars for 1-click profile styling
const PRESET_AVATARS = [
  {
    name: 'Executive Gent',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Modern Professional',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Creative Specialist',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Tech Lead',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Urban Professional',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Classic Citizen',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
  },
];

export function ViewProfileModal({
  isOpen,
  onClose,
  onOpenEdit,
  user,
}: ViewProfileModalProps) {
  const { updateProfile } = useAuth();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'photo' | 'address'>('details');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  // Extract names and address details
  const firstName = user.firstName || (user.name ? user.name.split(' ')[0] : '') || user.name || 'Member';
  const lastName =
    user.lastName ||
    (user.name && user.name.split(' ').length > 1
      ? user.name.split(' ').slice(1).join(' ')
      : '');
  const address = user.address || (user as any).customerProfile?.address;

  const formattedDob = user.dob
    ? new Date(user.dob).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : (user as any).customerProfile?.dob
    ? new Date((user as any).customerProfile.dob).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '2026';

  const memberId = `SEVA-CITIZEN-${user.id ? user.id.replace(/\D/g, '').slice(-5) || '82711' : '82711'}`;

  // Copy Member ID to clipboard
  const handleCopyId = () => {
    navigator.clipboard.writeText(memberId);
    setCopiedId(true);
    showToast('Member ID copied to clipboard', 'info');
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Image compression utility
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 450;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.88));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  // Direct Photo Upload Handler
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      showToast('Please select a valid image (JPG, PNG, or WebP).', 'error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image is larger than 8MB. Please choose a smaller photo.', 'error');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const compressedDataUrl = await compressImage(file);
      await updateProfile({ avatarUrl: compressedDataUrl });
      showToast('Profile photo updated successfully!', 'success');
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      showToast(err.message || 'Failed to update photo', 'error');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 1-Click Preset Avatar Select
  const handleSelectPresetAvatar = async (avatarUrl: string) => {
    setIsUploadingPhoto(true);
    try {
      await updateProfile({ avatarUrl });
      showToast('Avatar updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to apply avatar', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const modalContent = (
    <div
      id="customer-view-profile-modal-backdrop"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUploadingPhoto) onClose();
      }}
    >
      <div
        id="customer-view-profile-modal-content"
        className="relative w-full max-w-2xl bg-[#07131d] border border-teal-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(13,242,164,0.18)] flex flex-col my-auto max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* TOP VIP HEADER (Always pinned and visible) */}
        <div className="relative bg-gradient-to-r from-[#0d2a38] via-[#091b26] to-[#0c2432] px-4 sm:px-6 py-3.5 border-b border-teal-500/25 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0df2a4]/20 to-teal-900/40 border border-[#0df2a4]/40 flex items-center justify-center text-[#0df2a4] shadow-[0_0_15px_rgba(13,242,164,0.25)] shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Customer Profile
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 border border-amber-400/40 font-bold uppercase tracking-wider shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  VIP Member
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Official citizen credentials &amp; doorstep service address
              </p>
            </div>
          </div>

          <button
            id="btn-close-view-profile-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-[#0c1a24] hover:bg-[#132838] border border-teal-500/25 rounded-xl transition-all cursor-pointer shadow-sm shrink-0"
            title="Close Profile (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NAVIGATION TABS FOR CLEAN HIERARCHY */}
        <div className="bg-[#091723] px-4 sm:px-6 py-2 border-b border-teal-500/20 flex items-center gap-2 shrink-0 overflow-x-auto text-xs font-semibold">
          <button
            id="tab-profile-details"
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'details'
                ? 'bg-[#0df2a4] text-slate-950 font-bold shadow-[0_0_12px_rgba(13,242,164,0.35)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile &amp; Identity</span>
          </button>

          <button
            id="tab-profile-photo"
            onClick={() => setActiveTab('photo')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'photo'
                ? 'bg-[#0df2a4] text-slate-950 font-bold shadow-[0_0_12px_rgba(13,242,164,0.35)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Add / Change Photo</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0df2a4] animate-pulse" />
          </button>

          <button
            id="tab-profile-address"
            onClick={() => setActiveTab('address')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'address'
                ? 'bg-[#0df2a4] text-slate-950 font-bold shadow-[0_0_12px_rgba(13,242,164,0.35)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Service Address</span>
          </button>
        </div>

        {/* SCROLLABLE MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm text-slate-300 overscroll-contain">
          {/* TAB 1: PROFILE & IDENTITY */}
          {activeTab === 'details' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* LUXURY VIP MEMBER CARD HERO */}
              <div className="relative rounded-2xl bg-gradient-to-br from-[#0c2331] via-[#081822] to-[#0d2737] border border-teal-500/30 p-4 sm:p-5 shadow-inner overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#0df2a4]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
                  {/* Avatar Showcase with Ring and Quick-Camera Badge */}
                  <div className="relative shrink-0 group">
                    <div
                      onClick={() => setActiveTab('photo')}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-2 ring-[#0df2a4] ring-offset-4 ring-offset-[#081822] shadow-[0_0_25px_rgba(13,242,164,0.3)] cursor-pointer relative transition-transform hover:scale-105"
                      title="Click to view or change photo"
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0df2a4]/20 to-teal-800/40 flex items-center justify-center text-3xl font-black text-[#0df2a4]">
                          {firstName.charAt(0)}
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 text-[10px] font-bold">
                        <Camera className="w-4 h-4 text-[#0df2a4]" />
                        <span>Change</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('photo')}
                      className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 shadow-md ring-2 ring-[#081822] transition-transform hover:scale-110 cursor-pointer"
                      title="Add or update photo"
                    >
                      <Camera className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  {/* Identity text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                          {user.name}
                        </h3>
                        <p className="text-xs text-[#0df2a4] font-semibold flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0df2a4]" />
                          {user.verificationStatus || 'Verified Citizen Account'}
                        </p>
                      </div>

                      {/* Member ID chip with copy button */}
                      <button
                        onClick={handleCopyId}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#051017] hover:bg-[#0c1f2d] border border-teal-500/30 text-xs font-mono text-slate-300 hover:text-[#0df2a4] transition-all cursor-pointer self-center sm:self-auto"
                        title="Click to copy Member ID"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-300" />
                        <span className="font-bold">{memberId}</span>
                        {copiedId ? (
                          <Check className="w-3 h-3 text-[#0df2a4]" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    </div>

                    {/* Member Perks Badges */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#051017] text-teal-300 border border-teal-500/20">
                        <ShieldCheck className="w-3 h-3 text-[#0df2a4]" />
                        30-Day Doorstep Warranty
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#051017] text-slate-300 border border-teal-500/20">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Member since {memberSince}
                      </span>
                    </div>

                    {/* Quick Button to Add Photo right from hero */}
                    <div className="mt-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        id="btn-hero-add-photo"
                        onClick={() => setActiveTab('photo')}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-[#0df2a4] border border-[#0df2a4]/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Add / Change Photo</span>
                      </button>

                      <button
                        id="btn-hero-edit-profile"
                        onClick={onOpenEdit}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(13,242,164,0.3)]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* PERSONAL DETAILS GRID */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-[#0df2a4] uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Personal &amp; Contact Details
                  </h4>
                  <button
                    onClick={onOpenEdit}
                    className="text-xs text-[#0df2a4] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* First Name */}
                  <div className="p-3.5 rounded-xl bg-[#0c1a24] border border-teal-500/20">
                    <span className="text-[11px] text-slate-400 block font-medium">
                      First Name
                    </span>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {firstName || '—'}
                    </p>
                  </div>

                  {/* Last Name */}
                  <div className="p-3.5 rounded-xl bg-[#0c1a24] border border-teal-500/20">
                    <span className="text-[11px] text-slate-400 block font-medium">
                      Last Name
                    </span>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {lastName || '—'}
                    </p>
                  </div>

                  {/* Email Address */}
                  <div className="p-3.5 rounded-xl bg-[#0c1a24] border border-teal-500/20 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#0df2a4]" />
                        Email Address
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
                        <Lock className="w-2.5 h-2.5" />
                        Primary Login ID
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white mt-1 break-all font-mono">
                      {user.email}
                    </p>
                  </div>

                  {/* Primary Phone */}
                  <div className="p-3.5 rounded-xl bg-[#0c1a24] border border-teal-500/20">
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#0df2a4]" />
                      Primary Phone
                    </span>
                    <p className="text-sm font-semibold text-white mt-0.5 font-mono">
                      {user.phone || '—'}
                    </p>
                  </div>

                  {/* Alternative Phone */}
                  <div className="p-3.5 rounded-xl bg-[#0c1a24] border border-teal-500/20">
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      Alternative Phone
                    </span>
                    <p className="text-sm font-semibold text-white mt-0.5 font-mono">
                      {user.altPhone || (user as any).customerProfile?.altPhone || (
                        <span className="text-slate-500 italic font-normal text-xs">
                          Not provided
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Date of Birth */}
                  <div className="p-3.5 rounded-xl bg-[#0c1a24] border border-teal-500/20 sm:col-span-2">
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#0df2a4]" />
                      Date of Birth
                    </span>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {formattedDob || (
                        <span className="text-slate-500 italic font-normal text-xs">
                          Not provided
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEDICATED PHOTO STUDIO & UPLOAD BOX */}
          {activeTab === 'photo' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* HIGHLIGHTED DEDICATED UPLOAD CARD & BUTTON */}
              <div
                id="profile-photo-box"
                className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c2230] via-[#081822] to-[#0c2535] border-2 border-teal-500/40 shadow-[0_0_30px_rgba(13,242,164,0.12)] space-y-5"
              >
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Current Active Photo */}
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-[#0df2a4]/60 ring-offset-4 ring-offset-[#081822] shadow-[0_0_30px_rgba(13,242,164,0.35)] relative">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#0df2a4]/20 flex items-center justify-center text-3xl font-black text-[#0df2a4]">
                          {firstName.charAt(0)}
                        </div>
                      )}
                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-[#0df2a4] text-xs gap-1 font-bold">
                          <Loader2 className="w-6 h-6 animate-spin text-[#0df2a4]" />
                          <span>Saving...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Box Dropzone */}
                  <div
                    onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
                    className="flex-1 w-full border-2 border-dashed border-[#0df2a4]/50 hover:border-[#0df2a4] hover:bg-[#0df2a4]/5 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#0df2a4]/15 border border-[#0df2a4]/30 flex items-center justify-center text-[#0df2a4] group-hover:scale-110 transition-transform mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-white group-hover:text-[#0df2a4] transition-colors">
                      Click to choose photo from device
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Supports JPG, PNG, or WebP. Auto-compressed for instant loading.
                    </p>

                    {/* Dedicated Explicit Add Photo Button */}
                    <button
                      type="button"
                      id="btn-add-profile-photo"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      disabled={isUploadingPhoto}
                      className="mt-3.5 px-5 py-2 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_18px_rgba(13,242,164,0.4)] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingPhoto ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 fill-current" />
                          <span>Upload / Add Picture</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Hidden Native File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleFileSelected}
                  />
                </div>
              </div>

              {/* 1-CLICK CURATED AVATARS */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1a24] border border-teal-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-[#0df2a4] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Or Choose Instant Ready Avatar
                  </h4>
                  <span className="text-[11px] text-slate-400">1-click apply</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {PRESET_AVATARS.map((preset) => {
                    const isSelected = user.avatarUrl === preset.url;
                    return (
                      <button
                        key={preset.name}
                        onClick={() => handleSelectPresetAvatar(preset.url)}
                        disabled={isUploadingPhoto}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer group ${
                          isSelected
                            ? 'bg-[#0df2a4]/15 border-[#0df2a4] shadow-[0_0_15px_rgba(13,242,164,0.3)]'
                            : 'bg-[#081822] border-teal-500/20 hover:border-[#0df2a4]/60'
                        }`}
                        title={`Select ${preset.name}`}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-teal-500/40 group-hover:scale-105 transition-transform">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] text-slate-300 text-center font-medium truncate w-full">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICE & BILLING ADDRESS */}
          {activeTab === 'address' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-[#0df2a4] uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  Service &amp; Doorstep Delivery Address
                </h4>
                <button
                  onClick={onOpenEdit}
                  className="text-xs text-[#0df2a4] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Update Address</span>
                </button>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1a24] border border-teal-500/20 space-y-4">
                {address ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-[#081822] border border-teal-500/15 sm:col-span-2">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        House / Flat / Building No.
                      </span>
                      <p className="text-sm font-semibold text-white mt-0.5">
                        {address.houseFlat || '—'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#081822] border border-teal-500/15 sm:col-span-2">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Street / Area / Locality
                      </span>
                      <p className="text-sm font-semibold text-white mt-0.5">
                        {address.streetArea || '—'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#081822] border border-teal-500/15">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        City &amp; State
                      </span>
                      <p className="text-sm font-semibold text-white mt-0.5">
                        {address.city}
                        {address.state ? `, ${address.state}` : ''}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#081822] border border-teal-500/15">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        PIN Code
                      </span>
                      <p className="text-sm font-semibold text-[#0df2a4] mt-0.5 font-mono">
                        {address.pincode || '—'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400">
                    <MapPin className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-semibold text-white">No address registered yet</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Add your address for faster doorstep technician visits.
                    </p>
                    <button
                      onClick={onOpenEdit}
                      className="mt-3 px-4 py-1.5 rounded-xl bg-[#0df2a4] text-slate-950 font-bold text-xs hover:bg-[#00f5c4] transition-all cursor-pointer"
                    >
                      Add Address Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM MODAL FOOTER (Always pinned and visible) */}
        <div className="bg-[#081822] px-4 sm:px-6 py-3.5 border-t border-teal-500/25 flex items-center justify-between shrink-0">
          <button
            id="btn-dismiss-view-profile"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#051017] hover:bg-[#0f2433] border border-teal-500/25 transition-all cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {activeTab !== 'photo' && (
              <button
                id="btn-footer-add-photo"
                onClick={() => setActiveTab('photo')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#0df2a4] bg-teal-500/15 hover:bg-teal-500/25 border border-[#0df2a4]/40 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Add Photo</span>
              </button>
            )}

            <button
              id="btn-edit-profile-from-view"
              onClick={onOpenEdit}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 shadow-[0_0_18px_rgba(13,242,164,0.35)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
