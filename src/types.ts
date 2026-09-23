export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type BookingStatus = 
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'PROVIDER_ON_THE_WAY' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export type RegistrationMethod = 'GOOGLE' | 'EMAIL_PHONE';

export interface CompleteAddress {
  houseFlat: string;
  streetArea: string;
  city: string;
  state: string;
  pincode: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  phone: string;
  altPhone?: string;
  address?: CompleteAddress;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  isActive: boolean;
  registrationMethod?: RegistrationMethod;
  verificationStatus?: string;
  googleId?: string;
  lastLoginAt?: string;
  customerProfile?: CustomerProfile;
  providerProfile?: ProviderProfile;
  totalBookings?: number;
  completedBookings?: number;
  totalSpent?: number;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  phone?: string;
  altPhone?: string;
  address?: CompleteAddress;
  defaultAddress: string;
  city: string;
  area: string;
  pincode: string;
  registrationMethod?: RegistrationMethod;
  verificationStatus?: string;
  googleId?: string;
  lastLoginAt?: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  serviceCategory: string; // e.g. "Electrician"
  services: string[]; // specific sub-services
  experienceYears: number;
  bio: string;
  serviceAreas: string[]; // localities covered e.g. ["Mansarovar", "Malviya Nagar"]
  pricingStartingAt: number; // e.g. 299
  availabilityStatus: AvailabilityStatus;
  workingHours: string; // e.g. "08:00 AM - 08:00 PM"
  verificationStatus: VerificationStatus;
  rating: number; // e.g. 4.9
  reviewCount: number;
  completedJobsCount: number;
  portfolioPhotos: string[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  basePrice: number;
  categoryGroup: string;
  popular: boolean;
  isActive: boolean;
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  status: BookingStatus;
  changedByRole: UserRole;
  note?: string;
  timestamp: string;
}

export interface Booking {
  id: string;
  bookingCode: string; // e.g. "SC-2026-000123"
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  providerId: string;
  providerName: string;
  providerPhone?: string;
  providerAvatar?: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM - 12:00 PM"
  address: string;
  city: string;
  area: string;
  pincode: string;
  problemDescription: string;
  problemImageUrl?: string;
  estimatedPrice: number;
  platformFee: number;
  taxAmount: number;
  totalAmount: number;
  platformCommission: number; // e.g. 10%
  providerEarnings: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  cancellationReason?: string;
  cancelledBy?: UserRole;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: BookingStatusHistory[];
  review?: Review;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  providerId: string;
  rating: number; // 1 to 5
  reviewText: string;
  createdAt: string;
  isModerated?: boolean;
}

export interface CommissionRecord {
  id: string;
  bookingId: string;
  bookingCode: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  bookingAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  providerEarnings: number;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  role: UserRole | 'ALL';
  title: string;
  message: string;
  type: 'BOOKING_CREATED' | 'STATUS_CHANGED' | 'VERIFICATION' | 'REVIEW' | 'SYSTEM' | 'OFFER' | 'ANNOUNCEMENT' | 'SECURITY';
  isRead: boolean;
  link?: string;
  createdAt: string;
  readBy?: string[];
  priority?: 'HIGH' | 'NORMAL' | 'URGENT';
}

export interface PlatformSettings {
  platformName: string;
  supportPhone: string;
  supportEmail: string;
  defaultCommissionPercentage: number;
  platformFee: number;
  selectedCity: string;
  currencySymbol: string;
  cancellationWindowHours: number;
  instantApproval: boolean;
  merchantPhotoUrl?: string | null;
  merchantPayeeName?: string;
  merchantUpiId?: string;
  merchantVerified?: boolean;
}

export interface AdminAnalytics {
  totalCustomers: number;
  totalProviders: number;
  pendingProvidersCount: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalGrossRevenue: number;
  totalPlatformCommission: number;
  cancellationRate: number;
  popularServices: { name: string; bookings: number; revenue: number }[];
  recentBookingsTimeline: { date: string; bookings: number; revenue: number }[];
  providerLeaderboard: { id: string; name: string; jobs: number; rating: number; earnings: number }[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type UpiPaymentStatus = 'PENDING VERIFICATION' | 'VERIFIED / PAID' | 'REJECTED';

export interface PaymentAuditEntry {
  status: UpiPaymentStatus;
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface PaymentRecord {
  id: string; // e.g. "PAY-2026-000101"
  bookingId: string; // e.g. "bk-01" or "SC-2026-000101"
  bookingCode: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceOrPlan: string;
  amount: number;
  upiId: string; // "ravikanhauli91@ptyes"
  utr: string; // Transaction / Reference ID
  screenshotUrl?: string;
  status: UpiPaymentStatus;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  verifiedByAdminId?: string;
  verifiedByAdminName?: string;
  rejectionReason?: string;
  adminRemarks?: string;
  history?: PaymentAuditEntry[];
}

export interface PaymentStats {
  totalPayments: number;
  totalVerifiedAmount: number;
  totalPendingAmount: number;
  totalRejectedAmount: number;
  totalTransactions: number;
  todayPaymentsCount: number;
  todayPaymentsAmount: number;
  thisMonthPaymentsCount: number;
  thisMonthPaymentsAmount: number;
}
