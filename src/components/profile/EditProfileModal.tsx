import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Camera,
  Upload,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import type { User as UserType, CompleteAddress } from '../../types.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: UserType | null;
}

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

export function EditProfileModal({
  isOpen,
  onClose,
  onSuccess,
  user,
}: EditProfileModalProps) {
  const { updateProfile } = useAuth();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [dob, setDob] = useState('');
  const [houseFlat, setHouseFlat] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [originalAvatar, setOriginalAvatar] = useState<string>('');
  const [isNewAvatarSelected, setIsNewAvatarSelected] = useState<boolean>(false);

  // Status & Validation
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});

  // Populate form fields whenever modal opens or user data changes
  useEffect(() => {
    if (user && isOpen) {
      const initialFirst =
        user.firstName ||
        (user.name ? user.name.split(' ')[0] : '') ||
        '';
      const initialLast =
        user.lastName ||
        (user.name && user.name.split(' ').length > 1
          ? user.name.split(' ').slice(1).join(' ')
          : '') ||
        '';

      setFirstName(initialFirst);
      setLastName(initialLast);
      setPhone(user.phone || '');
      setAltPhone(user.altPhone || (user as any).customerProfile?.altPhone || '');
      setDob(user.dob || (user as any).customerProfile?.dob || '');

      const addr: CompleteAddress | undefined =
        user.address || (user as any).customerProfile?.address;
      setHouseFlat(addr?.houseFlat || '');
      setStreetArea(addr?.streetArea || (user as any).customerProfile?.area || '');
      setCity(addr?.city || (user as any).customerProfile?.city || 'Patna');
      setState(addr?.state || 'Bihar');
      setPincode(addr?.pincode || (user as any).customerProfile?.pincode || '');

      const currentPic = user.avatarUrl || '';
      setAvatarPreview(currentPic);
      setOriginalAvatar(currentPic);
      setIsNewAvatarSelected(false);
      setErrorMessage(null);
      setFieldErrors({});
    }
  }, [user, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
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
  }, [isOpen, isSaving, onClose]);

  if (!isOpen || !user) return null;

  // Client-side image resize and compression helper
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400;
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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
          resolve(compressedDataUrl);
        };
        img.onerror = () => {
          reject(new Error('Failed to load image file.'));
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file from disk.'));
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle native file input selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Image file is too large. Please choose an image under 8MB.');
      return;
    }

    try {
      setErrorMessage(null);
      const compressed = await compressImage(file);
      setAvatarPreview(compressed);
      setIsNewAvatarSelected(true);
      showToast('Photo selected! Click "Save Changes" below to apply.', 'info');
    } catch (err: any) {
      console.error('Image compression error:', err);
      setErrorMessage('Unable to process the chosen image. Please try another image.');
    }
  };

  const handleResetPhoto = () => {
    setAvatarPreview(originalAvatar);
    setIsNewAvatarSelected(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const errors: { firstName?: string; lastName?: string } = {};
    if (!firstName.trim()) {
      errors.firstName = 'First Name is required.';
    }
    if (!lastName.trim()) {
      errors.lastName = 'Last Name is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Please complete all mandatory fields.');
      return;
    }

    setFieldErrors({});
    setIsSaving(true);

    try {
      const payload: {
        firstName: string;
        lastName: string;
        avatarUrl?: string;
        phone?: string;
        altPhone?: string;
        dob?: string;
        address?: CompleteAddress;
      } = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        altPhone: altPhone.trim(),
        dob: dob.trim(),
        avatarUrl: avatarPreview || undefined,
        address: {
          houseFlat: houseFlat.trim(),
          streetArea: streetArea.trim(),
          city: city.trim() || 'Patna',
          state: state.trim() || 'Bihar',
          pincode: pincode.trim(),
        },
      };

      const result = await updateProfile(payload);
      showToast(result.message || 'Profile updated successfully.', 'success');

      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err: any) {
      console.error('Profile update failed:', err);
      setErrorMessage(err.message || 'Failed to update profile. Please try again.');
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const modalContent = (
    <div
      id="customer-edit-profile-modal-backdrop"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div
        id="customer-edit-profile-modal-content"
        className="relative w-full max-w-2xl bg-[#07131d] border border-teal-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(13,242,164,0.18)] flex flex-col my-auto max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Pinned Modal Header */}
        <div className="relative bg-gradient-to-r from-[#0d2a38] via-[#091b26] to-[#0c2432] px-4 sm:px-6 py-3.5 border-b border-teal-500/25 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0df2a4]/15 border border-[#0df2a4]/40 flex items-center justify-center text-[#0df2a4] shadow-sm shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Edit Customer Profile
              </h2>
              <p className="text-[11px] text-slate-400">
                Update your identity picture, personal contact, and service address
              </p>
            </div>
          </div>

          <button
            id="btn-close-edit-profile-modal"
            onClick={onClose}
            disabled={isSaving}
            className="p-2 text-slate-400 hover:text-white bg-[#0c1a24] hover:bg-[#132838] border border-teal-500/25 rounded-xl transition-all disabled:opacity-50 cursor-pointer shrink-0"
            title="Cancel & Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-300 overscroll-contain">
            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. DEDICATED PHOTO UPLOAD BOX & BUTTON */}
            <div
              id="edit-profile-photo-box"
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0c2230] via-[#081822] to-[#0c2535] border-2 border-teal-500/40 shadow-inner space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0df2a4] uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  Profile Photo &amp; Avatar Studio
                </span>
                {isNewAvatarSelected && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#0df2a4] font-semibold border border-[#0df2a4]/30">
                    New Photo Staged
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Photo Preview Ring */}
                <div className="relative group shrink-0">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-[#0df2a4]/70 ring-offset-4 ring-offset-[#081822] shadow-[0_0_25px_rgba(13,242,164,0.3)] cursor-pointer relative transition-transform hover:scale-105"
                    title="Click to select new image"
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#0df2a4]/20 flex items-center justify-center text-3xl font-black text-[#0df2a4]">
                        {firstName ? firstName.charAt(0) : 'U'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                      <Camera className="w-5 h-5 text-[#0df2a4] mb-0.5" />
                      <span>Change</span>
                    </div>
                  </div>
                </div>

                {/* Upload Box Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 w-full border-2 border-dashed border-[#0df2a4]/50 hover:border-[#0df2a4] hover:bg-[#0df2a4]/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0df2a4]/15 border border-[#0df2a4]/30 flex items-center justify-center text-[#0df2a4] mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-white group-hover:text-[#0df2a4] transition-colors">
                    Click to browse your photo
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    JPG, PNG, or WebP. Auto-compressed for rapid display.
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-edit-modal-upload-photo"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(13,242,164,0.35)] cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 fill-current" />
                      <span>Upload Photo</span>
                    </button>

                    {isNewAvatarSelected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetPhoto();
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#051017] border border-teal-500/25 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Revert</span>
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Ready Presets Row */}
              <div className="pt-2 border-t border-teal-500/20">
                <span className="text-[11px] text-slate-400 block mb-2 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Or pick a ready avatar:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setAvatarPreview(p.url);
                        setIsNewAvatarSelected(true);
                        showToast(`Selected "${p.name}". Click Save below.`, 'info');
                      }}
                      className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        avatarPreview === p.url
                          ? 'border-[#0df2a4] bg-[#0df2a4]/15 shadow-sm'
                          : 'border-teal-500/20 bg-[#081822] hover:border-[#0df2a4]/50'
                      }`}
                    >
                      <img
                        src={p.url}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className="text-[9px] text-slate-300 truncate w-full text-center">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Personal Information Fields */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#0df2a4] uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Personal Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* First Name */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    First Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#0c1a24] border text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all ${
                      fieldErrors.firstName
                        ? 'border-rose-500/60 focus:ring-rose-500'
                        : 'border-teal-500/25 focus:border-[#0df2a4] focus:ring-[#0df2a4]'
                    }`}
                  />
                  {fieldErrors.firstName && (
                    <span className="text-[10px] text-rose-400 mt-1 block">
                      {fieldErrors.firstName}
                    </span>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Last Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#0c1a24] border text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all ${
                      fieldErrors.lastName
                        ? 'border-rose-500/60 focus:ring-rose-500'
                        : 'border-teal-500/25 focus:border-[#0df2a4] focus:ring-[#0df2a4]'
                    }`}
                  />
                  {fieldErrors.lastName && (
                    <span className="text-[10px] text-rose-400 mt-1 block">
                      {fieldErrors.lastName}
                    </span>
                  )}
                </div>

                {/* Primary Email (Non-editable) */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#0df2a4]" />
                      <span>Email Address</span>
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
                      <Lock className="w-2.5 h-2.5" />
                      Locked Identifier
                    </span>
                  </div>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#061118] border border-teal-500/15 text-slate-400 text-xs font-mono cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Your email address is your verified login key and cannot be modified.
                  </span>
                </div>

                {/* Primary Phone */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Primary Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-teal-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 98290 12345"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0c1a24] border border-teal-500/25 focus:border-[#0df2a4] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0df2a4] font-mono"
                    />
                  </div>
                </div>

                {/* Alternative Phone */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Alternative Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                      placeholder="e.g. 98290 67890"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0c1a24] border border-teal-500/25 focus:border-[#0df2a4] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0df2a4] font-mono"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-teal-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0c1a24] border border-teal-500/25 focus:border-[#0df2a4] text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0df2a4]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Complete Service Address */}
            <div className="space-y-4 pt-2 border-t border-teal-500/20">
              <h4 className="text-xs font-bold text-[#0df2a4] uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                Doorstep Service &amp; Billing Address
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    House / Flat / Building No.
                  </label>
                  <input
                    type="text"
                    value={houseFlat}
                    onChange={(e) => setHouseFlat(e.target.value)}
                    placeholder="e.g. Flat 402, Royal Residency"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c1a24] border border-teal-500/25 focus:border-[#0df2a4] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0df2a4]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Street / Area / Locality
                  </label>
                  <input
                    type="text"
                    value={streetArea}
                    onChange={(e) => setStreetArea(e.target.value)}
                    placeholder="e.g. Mansarovar, Sector 7"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c1a24] border border-teal-500/25 focus:border-[#0df2a4] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0df2a4]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Patna"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c1a24] border border-teal-500/25 focus:border-[#0df2a4] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0df2a4]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Bihar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c1a24] border border-teal-500/25 focus:border-[#0df2a4] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0df2a4]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 302020"
                    maxLength={6}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c1a24] border border-teal-500/25 focus:border-[#0df2a4] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0df2a4] font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pinned Modal Footer */}
          <div className="bg-[#081822] px-4 sm:px-6 py-3.5 border-t border-teal-500/25 flex items-center justify-between shrink-0">
            <button
              type="button"
              id="btn-cancel-edit-profile"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#051017] hover:bg-[#0f2433] border border-teal-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="btn-save-profile-changes"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 shadow-[0_0_20px_rgba(13,242,164,0.35)] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
