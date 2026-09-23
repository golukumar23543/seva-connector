import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  User,
  CustomerProfile,
  ProviderProfile,
  ServiceCategory,
  Booking,
  BookingStatusHistory,
  Review,
  CommissionRecord,
  NotificationItem,
  PlatformSettings,
  BookingStatus,
  UserRole,
  VerificationStatus,
  AvailabilityStatus,
  RegistrationMethod,
  CompleteAddress,
  PaymentRecord,
  PaymentStats,
} from '../src/types.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'sevaconnect_db.json');
const SECRET_KEY = process.env.JWT_SECRET || 'sevaconnect-secure-signature-secret-key-2026';

export interface DatabaseSchema {
  users: (User & { passwordHash: string; salt: string })[];
  customerProfiles: CustomerProfile[];
  providerProfiles: ProviderProfile[];
  services: ServiceCategory[];
  bookings: Booking[];
  bookingStatusHistory: BookingStatusHistory[];
  reviews: Review[];
  commissions: CommissionRecord[];
  notifications: NotificationItem[];
  settings: PlatformSettings;
  payments: PaymentRecord[];
}

// -------------------------------------------------------------
// 4-DIGIT REGISTRATION CODE MANAGEMENT (5-MIN ROTATING EXPIRY)
// -------------------------------------------------------------
export interface RegistrationCodeStatus {
  code: string;
  createdAt: number;
  expiresAt: number;
  remainingSeconds: number;
  totalSeconds: number;
}

export class RegistrationCodeManager {
  private currentCode: string;
  private createdAt: number;
  private expiresAt: number;
  private readonly durationMs = 5 * 60 * 1000; // 5 minutes = 300 seconds

  constructor() {
    this.currentCode = this.generateRandom4Digit();
    this.createdAt = Date.now();
    this.expiresAt = this.createdAt + this.durationMs;
  }

  private generateRandom4Digit(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  public getStatus(): RegistrationCodeStatus {
    const now = Date.now();
    if (now >= this.expiresAt) {
      this.regenerate();
    }
    const remaining = Math.max(0, Math.ceil((this.expiresAt - Date.now()) / 1000));
    return {
      code: this.currentCode,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      remainingSeconds: remaining,
      totalSeconds: 300,
    };
  }

  public regenerate(): RegistrationCodeStatus {
    this.currentCode = this.generateRandom4Digit();
    this.createdAt = Date.now();
    this.expiresAt = this.createdAt + this.durationMs;
    return this.getStatus();
  }

  public validate(code: string): { valid: boolean; error?: string } {
    if (!code || typeof code !== 'string' || !code.trim()) {
      return {
        valid: false,
        error: 'Please enter the 4-digit registration code. Contact the administrator to obtain your code.',
      };
    }
    const now = Date.now();
    if (now >= this.expiresAt) {
      this.regenerate();
      return {
        valid: false,
        error: 'This 4-digit registration code has expired. Please contact the administrator for a fresh code.',
      };
    }
    if (code.trim() !== this.currentCode) {
      return {
        valid: false,
        error: 'Invalid 4-digit registration code. Please contact the administrator to get the correct active code.',
      };
    }
    return { valid: true };
  }
}

export const registrationCodeManager = new RegistrationCodeManager();

// Password hashing utilities
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const testHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return testHash === hash;
}

// Token creation & verification
export function createToken(payload: { userId: string; role: UserRole; email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { userId: string; role: UserRole; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(`${header}.${body}`)
      .digest('base64url');
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

class RelationalDatabase {
  private db: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.db = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const loaded = JSON.parse(raw) as DatabaseSchema;
        // Backfill customer records with complete fields if loaded from older structure
        if (loaded.users) {
          loaded.users.forEach((u) => {
            if (u.role === 'CUSTOMER') {
              if (!u.registrationMethod) {
                u.registrationMethod = u.googleId ? 'GOOGLE' : 'EMAIL_PHONE';
              }
              if (!u.verificationStatus) {
                u.verificationStatus = u.registrationMethod === 'GOOGLE' ? 'Google Identity Verified' : 'Admin Code Verified';
              }
              if (!u.firstName && u.name) {
                const parts = u.name.trim().split(' ');
                u.firstName = parts[0] || u.name;
                u.lastName = parts.slice(1).join(' ') || 'Customer';
              }
              if (!u.dob) {
                u.dob = '1996-05-20';
              }
              if (!u.address) {
                u.address = {
                  houseFlat: 'Flat 402, Royal Palms Residency',
                  streetArea: 'VT Road, Mansarovar',
                  city: 'Jaipur',
                  state: 'Rajasthan',
                  pincode: '302020',
                };
              }
              if (!u.lastLoginAt) {
                u.lastLoginAt = u.createdAt;
              }
            }
          });
        }
        if (loaded.customerProfiles) {
          loaded.customerProfiles.forEach((cp) => {
            const user = loaded.users.find((u) => u.id === cp.userId);
            if (user) {
              if (!cp.firstName) cp.firstName = user.firstName || user.name;
              if (!cp.lastName) cp.lastName = user.lastName || '';
              if (!cp.dob) cp.dob = user.dob;
              if (!cp.phone) cp.phone = user.phone;
              if (!cp.address && user.address) cp.address = user.address;
              if (!cp.registrationMethod) cp.registrationMethod = user.registrationMethod || 'EMAIL_PHONE';
              if (!cp.verificationStatus) cp.verificationStatus = user.verificationStatus || 'Admin Code Verified';
              if (!cp.lastLoginAt) cp.lastLoginAt = user.lastLoginAt || user.createdAt;
            }
          });
        }
        // If no Google customer exists in db yet, seed one so admin panel has sample representation
        const hasGoogleCust = loaded.users.some((u) => u.role === 'CUSTOMER' && u.registrationMethod === 'GOOGLE');
        if (!hasGoogleCust) {
          const googleCustomerUser = {
            id: 'usr-cust-02',
            email: 'pooja.sharma.tech@gmail.com',
            name: 'Pooja Sharma',
            firstName: 'Pooja',
            lastName: 'Sharma',
            dob: '1998-11-23',
            phone: '+91 98290 55443',
            altPhone: '+91 98290 55440',
            address: {
              houseFlat: 'Villa 12, Gulab Vatika',
              streetArea: 'Gopalpura Bypass',
              city: 'Jaipur',
              state: 'Rajasthan',
              pincode: '302018',
            },
            role: 'CUSTOMER' as UserRole,
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            createdAt: '2026-02-04T12:30:00.000Z',
            isActive: true,
            registrationMethod: 'GOOGLE' as RegistrationMethod,
            verificationStatus: 'Google Identity Verified',
            googleId: 'g-sub-1049285028492019',
            lastLoginAt: '2026-09-20T09:15:00.000Z',
            passwordHash: hashPassword('dummyPassSecret123').hash,
            salt: hashPassword('dummyPassSecret123').salt,
          };
          loaded.users.push(googleCustomerUser);
          loaded.customerProfiles.push({
            id: 'cp-02',
            userId: googleCustomerUser.id,
            firstName: 'Pooja',
            lastName: 'Sharma',
            dob: '1998-11-23',
            phone: '+91 98290 55443',
            altPhone: '+91 98290 55440',
            address: googleCustomerUser.address,
            defaultAddress: 'Villa 12, Gulab Vatika, Gopalpura Bypass, Jaipur, Rajasthan - 302018',
            city: 'Jaipur',
            area: 'Gopalpura Bypass',
            pincode: '302018',
            registrationMethod: 'GOOGLE',
            verificationStatus: 'Google Identity Verified',
            googleId: 'g-sub-1049285028492019',
            lastLoginAt: '2026-09-20T09:15:00.000Z',
          });
        }
        if (!loaded.payments) {
          loaded.payments = [];
        }
        if (loaded.payments.length === 0) {
          loaded.payments = [
            {
              id: 'PAY-2026-000101',
              bookingId: 'bk-01',
              bookingCode: 'SC-2026-000101',
              customerId: 'usr-cust-01',
              customerName: 'Rahul Verma',
              customerEmail: 'rahul.customer@gmail.com',
              customerPhone: '+91 98290 22222',
              serviceOrPlan: 'Electrician Service (Kitchen Switchboard)',
              amount: 470,
              upiId: 'ravikanhauli91@ptyes',
              utr: '427819034821',
              status: 'VERIFIED / PAID',
              createdAt: '2026-09-10T10:15:00.000Z',
              updatedAt: '2026-09-10T10:30:00.000Z',
              verifiedAt: '2026-09-10T10:30:00.000Z',
              verifiedByAdminId: 'usr-admin-01',
              verifiedByAdminName: 'Super Administrator',
              adminRemarks: 'Verified in Axis UPI merchant statement. Transaction settled.',
              history: [
                {
                  status: 'PENDING VERIFICATION',
                  changedBy: 'Rahul Verma',
                  changedAt: '2026-09-10T10:15:00.000Z',
                  note: 'Payment submitted with UTR: 427819034821',
                },
                {
                  status: 'VERIFIED / PAID',
                  changedBy: 'Super Administrator',
                  changedAt: '2026-09-10T10:30:00.000Z',
                  note: 'Verified in Axis UPI merchant statement. Transaction settled.',
                },
              ],
            },
            {
              id: 'PAY-2026-000102',
              bookingId: 'bk-02',
              bookingCode: 'SC-2026-000102',
              customerId: 'usr-cust-01',
              customerName: 'Rahul Verma',
              customerEmail: 'rahul.customer@gmail.com',
              customerPhone: '+91 98290 22222',
              serviceOrPlan: 'Plumber Service (Bathroom Concealed Leakage)',
              amount: 600,
              upiId: 'ravikanhauli91@ptyes',
              utr: '427829045192',
              status: 'PENDING VERIFICATION',
              createdAt: '2026-09-22T08:30:00.000Z',
              updatedAt: '2026-09-22T08:30:00.000Z',
              history: [
                {
                  status: 'PENDING VERIFICATION',
                  changedBy: 'Rahul Verma',
                  changedAt: '2026-09-22T08:30:00.000Z',
                  note: 'Payment submitted via GPay, awaiting bank credit verification.',
                },
              ],
            },
            {
              id: 'PAY-2026-000103',
              bookingId: 'ORD-SUB-902',
              bookingCode: 'SUB-VIP-0902',
              customerId: 'usr-cust-02',
              customerName: 'Pooja Sharma',
              customerEmail: 'pooja.sharma.tech@gmail.com',
              customerPhone: '+91 98290 55443',
              serviceOrPlan: 'Elite Home Care Annual Subscription',
              amount: 2499,
              upiId: 'ravikanhauli91@ptyes',
              utr: '427805128394',
              status: 'VERIFIED / PAID',
              createdAt: '2026-09-21T14:20:00.000Z',
              updatedAt: '2026-09-21T14:45:00.000Z',
              verifiedAt: '2026-09-21T14:45:00.000Z',
              verifiedByAdminId: 'usr-admin-01',
              verifiedByAdminName: 'Super Administrator',
              adminRemarks: 'Credit verified in bank passbook. Annual subscription activated.',
              history: [
                {
                  status: 'PENDING VERIFICATION',
                  changedBy: 'Pooja Sharma',
                  changedAt: '2026-09-21T14:20:00.000Z',
                  note: 'UPI Payment submitted for Annual Plan',
                },
                {
                  status: 'VERIFIED / PAID',
                  changedBy: 'Super Administrator',
                  changedAt: '2026-09-21T14:45:00.000Z',
                  note: 'Credit verified in bank passbook. Annual subscription activated.',
                },
              ],
            },
          ];
        }
        if (loaded.settings) {
          if (loaded.settings.merchantPhotoUrl === undefined) {
            loaded.settings.merchantPhotoUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
          }
          if (!loaded.settings.merchantPayeeName) {
            loaded.settings.merchantPayeeName = 'Ravi Kumar';
          }
          if (!loaded.settings.merchantUpiId || loaded.settings.merchantUpiId === '8709107808@okbizaxis') {
            loaded.settings.merchantUpiId = 'ravikanhauli91@ptyes';
          }
          if (loaded.settings.merchantVerified === undefined) {
            loaded.settings.merchantVerified = true;
          }
          if (!loaded.settings.selectedCity || loaded.settings.selectedCity === 'Jaipur') {
            loaded.settings.selectedCity = 'Patna';
          }
        }
        if (!loaded.notifications) {
          loaded.notifications = [];
        }
        const hasBroadcast = loaded.notifications.some((n: any) => n.userId === 'ALL' || n.role === 'ALL');
        if (!hasBroadcast) {
          loaded.notifications.unshift(
            {
              id: 'notif-broadcast-01',
              userId: 'ALL',
              role: 'ALL',
              title: '🎉 Welcome to SevaConnect Doorstep Services',
              message: 'Book verified experts for AC repair, electrical, plumbing, cleaning & appliance servicing with 45-min arrival SLA.',
              type: 'ANNOUNCEMENT',
              isRead: false,
              link: '/#services-section',
              createdAt: new Date().toISOString(),
              priority: 'HIGH',
            },
            {
              id: 'notif-broadcast-02',
              userId: 'ALL',
              role: 'ALL',
              title: '⚡ Flat ₹150 OFF Welcome Discount: SEVA150',
              message: 'Use promo code SEVA150 on your booking above ₹499. Instant doorstep discount applied at checkout!',
              type: 'OFFER',
              isRead: false,
              link: '/#packages-section',
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              priority: 'HIGH',
            },
            {
              id: 'notif-broadcast-03',
              userId: 'ALL',
              role: 'ALL',
              title: '🛡️ 100% Police & Biometric Verified Experts',
              message: 'All SevaConnect service technicians carry biometric photo ID cards and adhere to strict safety & hygiene protocols.',
              type: 'SYSTEM',
              isRead: false,
              createdAt: new Date(Date.now() - 7200000).toISOString(),
              priority: 'NORMAL',
            },
            {
              id: 'notif-broadcast-04',
              userId: 'ALL',
              role: 'ALL',
              title: '💳 UPI QR & Instant Cashless Payments Live',
              message: 'Pay hassle-free via PhonePe, Google Pay, Paytm or BHIM UPI directly on completion of doorstep repair.',
              type: 'ANNOUNCEMENT',
              isRead: false,
              createdAt: new Date(Date.now() - 14400000).toISOString(),
              priority: 'NORMAL',
            }
          );
        }
        return loaded;
      } catch (err) {
        console.error('Failed to parse database file, reinitializing default seed:', err);
      }
    }
    const seed = this.createInitialSeed();
    this.saveDatabase(seed);
    return seed;
  }

  public persist() {
    this.saveDatabase(this.db);
  }

  private saveDatabase(data: DatabaseSchema) {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  // --- SEED GENERATION ---
  private createInitialSeed(): DatabaseSchema {
    const defaultSettings: PlatformSettings = {
      platformName: 'SevaConnect',
      supportPhone: '+91 98290 12345',
      supportEmail: 'support@sevaconnect.in',
      defaultCommissionPercentage: 10,
      platformFee: 49,
      selectedCity: 'Jaipur',
      currencySymbol: '₹',
      cancellationWindowHours: 2,
      instantApproval: false,
      merchantPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      merchantPayeeName: 'Ravi Kumar',
      merchantUpiId: 'ravikanhauli91@ptyes',
      merchantVerified: true,
    };

    // Services
    const services: ServiceCategory[] = [
      {
        id: 'srv-electrician',
        name: 'Electrician',
        slug: 'electrician',
        description: 'Wiring, switchboard repair, MCB tripping, fan & light installation, inverter repair',
        iconName: 'Zap',
        basePrice: 199,
        categoryGroup: 'Home Maintenance',
        popular: true,
        isActive: true,
      },
      {
        id: 'srv-plumber',
        name: 'Plumber',
        slug: 'plumber',
        description: 'Tap & pipe leakage, toilet repair, water motor, sanitary fitting, pipeline blockages',
        iconName: 'Wrench',
        basePrice: 249,
        categoryGroup: 'Home Maintenance',
        popular: true,
        isActive: true,
      },
      {
        id: 'srv-ac-repair',
        name: 'AC Repair & Service',
        slug: 'ac-repair',
        description: 'Split & window AC deep cleaning, gas refilling, cooling issues, compressor inspection',
        iconName: 'Wind',
        basePrice: 499,
        categoryGroup: 'Appliance Care',
        popular: true,
        isActive: true,
      },
      {
        id: 'srv-fridge-repair',
        name: 'Fridge Repair',
        slug: 'fridge-repair',
        description: 'Single/Double door refrigerator diagnostics, thermostat, coil cleaning, gas charging',
        iconName: 'Cpu',
        basePrice: 399,
        categoryGroup: 'Appliance Care',
        popular: true,
        isActive: true,
      },
      {
        id: 'srv-ro-repair',
        name: 'RO Purifier Service',
        slug: 'ro-repair',
        description: 'Water purifier filter replacement, membrane change, TDS adjustment, leakage fix',
        iconName: 'Droplets',
        basePrice: 349,
        categoryGroup: 'Appliance Care',
        popular: true,
        isActive: true,
      },
      {
        id: 'srv-laptop-pc',
        name: 'Computer & Laptop Repair',
        slug: 'computer-laptop-repair',
        description: 'Windows/Mac OS install, SSD upgrade, screen replacement, overheating, virus removal',
        iconName: 'Laptop',
        basePrice: 449,
        categoryGroup: 'IT & Electronics',
        popular: true,
        isActive: true,
      },
      {
        id: 'srv-cleaning',
        name: 'Full Home & Kitchen Cleaning',
        slug: 'cleaning',
        description: 'Deep home sanitization, bathroom scrubbing, kitchen de-greasing, sofa shampooing',
        iconName: 'Sparkles',
        basePrice: 799,
        categoryGroup: 'Cleaning & Pest',
        popular: true,
        isActive: true,
      },
      {
        id: 'srv-painter',
        name: 'Painter & Wall Care',
        slug: 'painter',
        description: 'Interior & exterior painting, water-proofing, putty touch-up, texture design',
        iconName: 'Paintbrush',
        basePrice: 599,
        categoryGroup: 'Renovation',
        popular: false,
        isActive: true,
      },
      {
        id: 'srv-appliance',
        name: 'Washing Machine Repair',
        slug: 'washing-machine-repair',
        description: 'Top/Front load washing machine spin failure, motor repair, drum balancing, water drain',
        iconName: 'Settings',
        basePrice: 399,
        categoryGroup: 'Appliance Care',
        popular: true,
        isActive: true,
      },
    ];

    // Seed Users & Passwords
    const adminPass = hashPassword('admin123');
    const providerPass = hashPassword('provider123');
    const customerPass = hashPassword('customer123');

    const adminUser = {
      id: 'usr-admin-01',
      email: 'admin@sevaconnect.in',
      name: 'Mr. Golu Prajapati (Admin)',
      phone: '+91 8709107808',
      role: 'ADMIN' as UserRole,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-01T08:00:00.000Z',
      isActive: true,
      passwordHash: adminPass.hash,
      salt: adminPass.salt,
    };

    const coAdminUser = {
      id: 'usr-admin-02',
      email: 'coadmin@sevaconnect.in',
      name: 'Alok Prajapati (Co-Admin)',
      phone: '+91 8409021577',
      role: 'ADMIN' as UserRole,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-01T08:00:00.000Z',
      isActive: true,
      passwordHash: adminPass.hash,
      salt: adminPass.salt,
    };

    const customerUser = {
      id: 'usr-cust-01',
      email: 'rahul.customer@gmail.com',
      name: 'Rahul Verma',
      phone: '+91 98290 22222',
      role: 'CUSTOMER' as UserRole,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-10T10:00:00.000Z',
      isActive: true,
      passwordHash: customerPass.hash,
      salt: customerPass.salt,
    };

    const customerProfile: CustomerProfile = {
      id: 'cp-01',
      userId: customerUser.id,
      defaultAddress: 'Flat 402, Royal Palms Residency, VT Road',
      city: 'Jaipur',
      area: 'Mansarovar',
      pincode: '302020',
    };

    // Providers
    const rawProviders = [
      {
        id: 'usr-prov-01',
        email: 'rajesh.electrician@sevaconnect.in',
        name: 'Rajesh Sharma',
        phone: '+91 98290 33001',
        avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
        category: 'Electrician',
        services: ['Wiring & Rewiring', 'Switchboard Repair', 'MCB & Inverter Setup', 'Fan Installation'],
        exp: 9,
        bio: 'Government certified licensed technician with 9+ years of on-field expertise in residential and commercial electrical systems across Jaipur.',
        areas: ['Mansarovar', 'Malviya Nagar', 'Vaishali Nagar', 'Civil Lines'],
        price: 299,
        status: 'APPROVED' as VerificationStatus,
        rating: 4.9,
        reviews: 142,
        jobs: 168,
        portfolio: [
          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80',
        ],
      },
      {
        id: 'usr-prov-02',
        email: 'amit.plumber@sevaconnect.in',
        name: 'Amit Kumar Saini',
        phone: '+91 98290 33002',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        category: 'Plumber',
        services: ['Tap & Pipe Leakage', 'Water Tank Cleaning', 'Bathroom Fitting', 'Water Motor Repair'],
        exp: 7,
        bio: 'Expert sanitary & plumbing technician. Specialized in emergency leak repairs, CPVC piping, and concealed bathroom installations with 1-month warranty.',
        areas: ['Malviya Nagar', 'C-Scheme', 'Raja Park', 'Mansarovar'],
        price: 249,
        status: 'APPROVED' as VerificationStatus,
        rating: 4.8,
        reviews: 118,
        jobs: 135,
        portfolio: [
          'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&auto=format&fit=crop&q=80',
        ],
      },
      {
        id: 'usr-prov-03',
        email: 'vikram.ac@sevaconnect.in',
        name: 'Vikram Singh Shekhawat',
        phone: '+91 98290 33003',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        category: 'AC Repair & Service',
        services: ['Jet Pump AC Service', 'Gas Charging (R32/R410)', 'PCB Circuit Repair', 'Cooling Diagnostics'],
        exp: 11,
        bio: 'Certified HVAC engineer. Trained in Daikin, Voltas, LG, and Blue Star inverter units. Equipped with digital manifold gauges and high-pressure jet pumps.',
        areas: ['Vaishali Nagar', 'Mansarovar', 'Ajmer Road', 'Sodala'],
        price: 499,
        status: 'APPROVED' as VerificationStatus,
        rating: 4.95,
        reviews: 215,
        jobs: 240,
        portfolio: [
          'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&auto=format&fit=crop&q=80',
        ],
      },
      {
        id: 'usr-prov-04',
        email: 'suresh.ro@sevaconnect.in',
        name: 'Suresh Verma',
        phone: '+91 98290 33004',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        category: 'RO Purifier Service',
        services: ['RO Filter Replacement', 'Membrane Flush & Change', 'TDS Meter Calibration', 'UV/UF Lamp Setup'],
        exp: 6,
        bio: 'Dedicated water purification specialist. Genuine NSF-grade replacement filters for Kent, Aquaguard, Pureit, and Livpure. Free TDS water purity testing included.',
        areas: ['Mansarovar', 'Tonk Road', 'Malviya Nagar', 'Jagatpura'],
        price: 349,
        status: 'APPROVED' as VerificationStatus,
        rating: 4.75,
        reviews: 94,
        jobs: 110,
        portfolio: [],
      },
      {
        id: 'usr-prov-05',
        email: 'rohit.computer@sevaconnect.in',
        name: 'Rohit Mehra Tech',
        phone: '+91 98290 33005',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        category: 'Computer & Laptop Repair',
        services: ['Laptop Screen & Battery', 'SSD & RAM Upgrades', 'Chip-level Motherboard Repair', 'OS Reinstall & Data Recovery'],
        exp: 8,
        bio: 'Certified hardware & network engineer with chip-level diagnostic lab. Quick 60-minute doorstep diagnostics for Dell, HP, Lenovo, Asus, and Apple MacBooks.',
        areas: ['Mansarovar', 'Malviya Nagar', 'Vaishali Nagar', 'Raja Park', 'C-Scheme'],
        price: 449,
        status: 'APPROVED' as VerificationStatus,
        rating: 4.88,
        reviews: 88,
        jobs: 104,
        portfolio: [
          'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=80',
        ],
      },
      {
        id: 'usr-prov-06',
        email: 'neha.cleaner@sevaconnect.in',
        name: 'Neha Deep Cleaning Pros',
        phone: '+91 98290 33006',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        category: 'Full Home & Kitchen Cleaning',
        services: ['Deep Bathroom Scrubbing', 'Modular Kitchen De-greasing', 'Sofa & Carpet Shampooing', 'Full House Move-in Clean'],
        exp: 5,
        bio: 'Professional eco-friendly residential and office sanitization service. Trained team with Taski industrial chemicals and Kärcher vacuum machinery.',
        areas: ['Mansarovar', 'Malviya Nagar', 'Vaishali Nagar', 'Jagatpura', 'Bani Park'],
        price: 799,
        status: 'APPROVED' as VerificationStatus,
        rating: 4.92,
        reviews: 180,
        jobs: 195,
        portfolio: [
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80',
        ],
      },
      {
        id: 'usr-prov-07',
        email: 'pawan.painter@sevaconnect.in',
        name: 'Pawan Kumar Painters',
        phone: '+91 98290 33007',
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
        category: 'Painter & Wall Care',
        services: ['Interior Plastic Emulsion', 'Waterproofing & Seepage Care', 'Royal Luxury Shyne', 'Wood Polish'],
        exp: 4,
        bio: 'Asian Paints trained master painter. Free color consultancy, laser measurement estimate, and dust-free mechanized sanding tools.',
        areas: ['Mansarovar', 'Sanganer', 'Tonk Road'],
        price: 599,
        status: 'PENDING' as VerificationStatus, // Verification Pending for testing admin approval!
        rating: 4.6,
        reviews: 12,
        jobs: 15,
        portfolio: [],
      },
    ];

    const users: DatabaseSchema['users'] = [adminUser, coAdminUser, customerUser];
    const providerProfiles: ProviderProfile[] = [];

    rawProviders.forEach((p) => {
      users.push({
        id: p.id,
        email: p.email,
        name: p.name,
        phone: p.phone,
        role: 'PROVIDER',
        avatarUrl: p.avatarUrl,
        createdAt: '2026-01-15T09:00:00.000Z',
        isActive: true,
        passwordHash: providerPass.hash,
        salt: providerPass.salt,
      });

      providerProfiles.push({
        id: `pp-${p.id}`,
        userId: p.id,
        serviceCategory: p.category,
        services: p.services,
        experienceYears: p.exp,
        bio: p.bio,
        serviceAreas: p.areas,
        pricingStartingAt: p.price,
        availabilityStatus: 'AVAILABLE',
        workingHours: '08:30 AM - 08:00 PM',
        verificationStatus: p.status,
        rating: p.rating,
        reviewCount: p.reviews,
        completedJobsCount: p.jobs,
        portfolioPhotos: p.portfolio,
      });
    });

    // Seed Bookings with realistic status history & commission
    const bookings: Booking[] = [
      {
        id: 'bk-01',
        bookingCode: 'SC-2026-000101',
        customerId: customerUser.id,
        customerName: customerUser.name,
        customerPhone: customerUser.phone,
        customerEmail: customerUser.email,
        providerId: 'usr-prov-01',
        providerName: 'Rajesh Sharma',
        providerPhone: '+91 98290 33001',
        providerAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
        serviceId: 'srv-electrician',
        serviceName: 'Electrician',
        serviceCategory: 'Home Maintenance',
        date: '2026-09-10',
        timeSlot: '10:00 AM - 12:00 PM',
        address: 'Flat 402, Royal Palms Residency, VT Road',
        city: 'Jaipur',
        area: 'Mansarovar',
        pincode: '302020',
        problemDescription: 'Kitchen main switchboard sparking and MCB tripping when microwave is turned on.',
        estimatedPrice: 399,
        platformFee: 49,
        taxAmount: 22,
        totalAmount: 470,
        platformCommission: 40,
        providerEarnings: 359,
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        paymentMethod: 'Cash on Service',
        completedAt: '2026-09-10T11:45:00.000Z',
        createdAt: '2026-09-09T14:30:00.000Z',
        updatedAt: '2026-09-10T11:45:00.000Z',
        statusHistory: [
          {
            id: 'sh-01',
            bookingId: 'bk-01',
            status: 'PENDING',
            changedByRole: 'CUSTOMER',
            note: 'Booking submitted by customer',
            timestamp: '2026-09-09T14:30:00.000Z',
          },
          {
            id: 'sh-02',
            bookingId: 'bk-01',
            status: 'ACCEPTED',
            changedByRole: 'PROVIDER',
            note: 'Rajesh Sharma accepted the request',
            timestamp: '2026-09-09T14:45:00.000Z',
          },
          {
            id: 'sh-03',
            bookingId: 'bk-01',
            status: 'PROVIDER_ON_THE_WAY',
            changedByRole: 'PROVIDER',
            note: 'Technician dispatched with replacement 32A MCB and toolkit',
            timestamp: '2026-09-10T09:40:00.000Z',
          },
          {
            id: 'sh-04',
            bookingId: 'bk-01',
            status: 'IN_PROGRESS',
            changedByRole: 'PROVIDER',
            note: 'Diagnosing neutral wire burnout and rewiring switchboard',
            timestamp: '2026-09-10T10:15:00.000Z',
          },
          {
            id: 'sh-05',
            bookingId: 'bk-01',
            status: 'COMPLETED',
            changedByRole: 'PROVIDER',
            note: 'Rewiring complete. Load test passed successfully.',
            timestamp: '2026-09-10T11:45:00.000Z',
          },
        ],
      },
      {
        id: 'bk-02',
        bookingCode: 'SC-2026-000102',
        customerId: customerUser.id,
        customerName: customerUser.name,
        customerPhone: customerUser.phone,
        customerEmail: customerUser.email,
        providerId: 'usr-prov-03',
        providerName: 'Vikram Singh Shekhawat',
        providerPhone: '+91 98290 33003',
        providerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        serviceId: 'srv-ac-repair',
        serviceName: 'AC Repair & Service',
        serviceCategory: 'Appliance Care',
        date: '2026-09-15',
        timeSlot: '02:00 PM - 04:00 PM',
        address: 'Flat 402, Royal Palms Residency, VT Road',
        city: 'Jaipur',
        area: 'Mansarovar',
        pincode: '302020',
        problemDescription: 'Split AC indoor unit leaking water and cooling is weak. Needs foam jet cleaning.',
        estimatedPrice: 699,
        platformFee: 49,
        taxAmount: 37,
        totalAmount: 785,
        platformCommission: 70,
        providerEarnings: 629,
        status: 'PROVIDER_ON_THE_WAY',
        paymentStatus: 'PENDING',
        paymentMethod: 'UPI / Doorstep Pay',
        createdAt: '2026-09-14T18:00:00.000Z',
        updatedAt: '2026-09-15T13:40:00.000Z',
        statusHistory: [
          {
            id: 'sh-06',
            bookingId: 'bk-02',
            status: 'PENDING',
            changedByRole: 'CUSTOMER',
            note: 'Booking requested by Rahul',
            timestamp: '2026-09-14T18:00:00.000Z',
          },
          {
            id: 'sh-07',
            bookingId: 'bk-02',
            status: 'ACCEPTED',
            changedByRole: 'PROVIDER',
            note: 'Vikram Singh confirmed slot for 2 PM',
            timestamp: '2026-09-14T18:20:00.000Z',
          },
          {
            id: 'sh-08',
            bookingId: 'bk-02',
            status: 'PROVIDER_ON_THE_WAY',
            changedByRole: 'PROVIDER',
            note: 'Heading towards Mansarovar with pressure washer',
            timestamp: '2026-09-15T13:40:00.000Z',
          },
        ],
      },
      {
        id: 'bk-03',
        bookingCode: 'SC-2026-000103',
        customerId: customerUser.id,
        customerName: customerUser.name,
        customerPhone: customerUser.phone,
        customerEmail: customerUser.email,
        providerId: 'usr-prov-02',
        providerName: 'Amit Kumar Saini',
        providerPhone: '+91 98290 33002',
        providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        serviceId: 'srv-plumber',
        serviceName: 'Plumber',
        serviceCategory: 'Home Maintenance',
        date: '2026-09-16',
        timeSlot: '11:00 AM - 01:00 PM',
        address: 'Flat 402, Royal Palms Residency, VT Road',
        city: 'Jaipur',
        area: 'Mansarovar',
        pincode: '302020',
        problemDescription: 'Overhead tank sensor wire broken and bathroom shower mixer valve dripping constantly.',
        estimatedPrice: 349,
        platformFee: 49,
        taxAmount: 20,
        totalAmount: 418,
        platformCommission: 35,
        providerEarnings: 314,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'UPI / Doorstep Pay',
        createdAt: '2026-09-15T08:15:00.000Z',
        updatedAt: '2026-09-15T08:15:00.000Z',
        statusHistory: [
          {
            id: 'sh-09',
            bookingId: 'bk-03',
            status: 'PENDING',
            changedByRole: 'CUSTOMER',
            note: 'Awaiting provider confirmation',
            timestamp: '2026-09-15T08:15:00.000Z',
          },
        ],
      },
    ];

    // Status history collection
    const bookingStatusHistory = bookings.flatMap((b) => b.statusHistory);

    // Seed Review for completed booking
    const reviews: Review[] = [
      {
        id: 'rev-01',
        bookingId: 'bk-01',
        customerId: customerUser.id,
        customerName: 'Rahul Verma',
        customerAvatar: customerUser.avatarUrl,
        providerId: 'usr-prov-01',
        rating: 5,
        reviewText:
          'Rajesh ji arrived strictly on time with proper safety footwear and tester equipment. He quickly identified the burnt neutral wire in the switchboard, replaced the MCB, and left the work area completely clean. Extremely professional and courteous!',
        createdAt: '2026-09-10T12:15:00.000Z',
        isModerated: false,
      },
    ];
    bookings[0].review = reviews[0];

    // Seed Commissions
    const commissions: CommissionRecord[] = [
      {
        id: 'comm-01',
        bookingId: 'bk-01',
        bookingCode: 'SC-2026-000101',
        serviceName: 'Electrician',
        providerId: 'usr-prov-01',
        providerName: 'Rajesh Sharma',
        bookingAmount: 399,
        commissionPercentage: 10,
        commissionAmount: 39.9,
        providerEarnings: 359.1,
        createdAt: '2026-09-10T11:45:00.000Z',
      },
    ];

    // Seed Notifications
    const notifications: NotificationItem[] = [
      {
        id: 'notif-01',
        userId: customerUser.id,
        role: 'CUSTOMER',
        title: 'Technician is On The Way!',
        message: 'Vikram Singh Shekhawat has dispatched for your AC Repair booking (SC-2026-000102).',
        type: 'STATUS_CHANGED',
        isRead: false,
        link: '/customer/bookings',
        createdAt: '2026-09-15T13:40:00.000Z',
      },
      {
        id: 'notif-02',
        userId: 'usr-prov-02',
        role: 'PROVIDER',
        title: 'New Booking Request Received',
        message: 'You have a new plumbing booking request for tomorrow at 11:00 AM (SC-2026-000103).',
        type: 'BOOKING_CREATED',
        isRead: false,
        link: '/provider/dashboard',
        createdAt: '2026-09-15T08:15:00.000Z',
      },
      {
        id: 'notif-03',
        userId: adminUser.id,
        role: 'ADMIN',
        title: 'Provider Verification Pending',
        message: 'Pawan Kumar Painters has applied for partner onboarding. Review credentials.',
        type: 'VERIFICATION',
        isRead: false,
        link: '/admin/providers',
        createdAt: '2026-09-14T11:00:00.000Z',
      },
    ];

    return {
      users,
      customerProfiles: [customerProfile],
      providerProfiles,
      services,
      bookings,
      bookingStatusHistory,
      reviews,
      commissions,
      notifications,
      settings: defaultSettings,
      payments: [],
    };
  }

  // --- QUERY & MUTATION REPOSITORY METHODS ---

  // USERS
  public getUsers() {
    return this.db.users.map(({ passwordHash, salt, ...safeUser }) => safeUser);
  }

  public findUserByEmail(email: string) {
    const user = this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  public findUserById(id: string) {
    const user = this.db.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, salt, ...safeUser } = user;
    const customerProfile = this.db.customerProfiles.find((cp) => cp.userId === id);
    const providerProfile = this.db.providerProfiles.find((pp) => pp.userId === id);
    return {
      ...safeUser,
      customerProfile,
      providerProfile,
    };
  }

  public createUser(data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: UserRole;
    avatarUrl?: string;
  }): User {
    const existing = this.findUserByEmail(data.email);
    if (existing) {
      throw new Error('User with this email already exists.');
    }

    const { hash, salt } = hashPassword(data.password);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newUser = {
      id: userId,
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role,
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      isActive: true,
      passwordHash: hash,
      salt,
    };

    this.db.users.push(newUser);

    if (data.role === 'CUSTOMER') {
      const cp: CustomerProfile = {
        id: `cp-${userId}`,
        userId,
        defaultAddress: '',
        city: this.db.settings.selectedCity,
        area: '',
        pincode: '',
      };
      this.db.customerProfiles.push(cp);
    }

    this.persist();
    const { passwordHash: _, salt: __, ...safeUser } = newUser;
    return safeUser;
  }

  public createCustomerUser(data: {
    firstName: string;
    lastName: string;
    dob: string;
    email: string;
    phone: string;
    altPhone?: string;
    address: CompleteAddress;
    password?: string;
    registrationMethod: RegistrationMethod;
    googleId?: string;
    avatarUrl?: string;
  }): User {
    const fName = data.firstName?.trim();
    const lName = data.lastName?.trim();
    const dob = data.dob?.trim();
    const email = data.email?.toLowerCase().trim();
    const phone = data.phone?.trim();
    const altPhone = data.altPhone?.trim();

    if (!fName || !lName) {
      throw new Error('First Name and Last Name are required.');
    }
    if (!dob) {
      throw new Error('Date of Birth (DOB) is required.');
    }
    if (!email) {
      throw new Error('Email address is required.');
    }
    if (!phone) {
      throw new Error('Phone number is required.');
    }
    if (
      !data.address ||
      !data.address.houseFlat?.trim() ||
      !data.address.streetArea?.trim() ||
      !data.address.city?.trim() ||
      !data.address.state?.trim() ||
      !data.address.pincode?.trim()
    ) {
      throw new Error('Complete address (House/Flat No, Street/Area, City, State, PIN Code) is required.');
    }

    const existingEmail = this.findUserByEmail(email);
    if (existingEmail) {
      throw new Error('An account with this email address already exists.');
    }

    const existingPhone = this.db.users.find((u) => u.phone && u.phone.trim() === phone);
    if (existingPhone) {
      throw new Error('An account with this phone number already exists.');
    }

    let hash = '';
    let salt = '';
    if (data.registrationMethod === 'EMAIL_PHONE') {
      if (!data.password || data.password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }
      const hashed = hashPassword(data.password);
      hash = hashed.hash;
      salt = hashed.salt;
    } else {
      // Secure random secret for Google account; Google passwords are never stored
      const randomSecret = crypto.randomBytes(32).toString('hex');
      const hashed = hashPassword(randomSecret);
      hash = hashed.hash;
      salt = hashed.salt;
    }

    const userId = `usr-cust-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const fullName = `${fName} ${lName}`;
    const defaultAddressStr = `${data.address.houseFlat.trim()}, ${data.address.streetArea.trim()}, ${data.address.city.trim()}, ${data.address.state.trim()} - ${data.address.pincode.trim()}`;
    const regDate = new Date().toISOString();

    const newUser = {
      id: userId,
      email,
      name: fullName,
      firstName: fName,
      lastName: lName,
      dob,
      phone,
      altPhone: altPhone || undefined,
      address: {
        houseFlat: data.address.houseFlat.trim(),
        streetArea: data.address.streetArea.trim(),
        city: data.address.city.trim(),
        state: data.address.state.trim(),
        pincode: data.address.pincode.trim(),
      },
      role: 'CUSTOMER' as UserRole,
      avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      createdAt: regDate,
      isActive: true,
      registrationMethod: data.registrationMethod,
      verificationStatus: data.registrationMethod === 'EMAIL_PHONE' ? 'Admin Code Verified' : 'Google Identity Verified',
      googleId: data.googleId,
      lastLoginAt: regDate,
      passwordHash: hash,
      salt,
    };

    this.db.users.push(newUser);

    const cp: CustomerProfile = {
      id: `cp-${userId}`,
      userId,
      firstName: fName,
      lastName: lName,
      dob,
      phone,
      altPhone: altPhone || undefined,
      address: newUser.address,
      defaultAddress: defaultAddressStr,
      city: data.address.city.trim(),
      area: data.address.streetArea.trim(),
      pincode: data.address.pincode.trim(),
      registrationMethod: data.registrationMethod,
      verificationStatus: newUser.verificationStatus,
      googleId: data.googleId,
      lastLoginAt: regDate,
    };

    this.db.customerProfiles.push(cp);
    this.persist();

    const { passwordHash: _, salt: __, ...safeUser } = newUser;
    return {
      ...safeUser,
      customerProfile: cp,
    };
  }

  public recordUserLogin(userId: string) {
    const user = this.db.users.find((u) => u.id === userId);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      const cp = this.db.customerProfiles.find((c) => c.userId === userId);
      if (cp) {
        cp.lastLoginAt = user.lastLoginAt;
      }
      this.persist();
    }
  }

  public updateUserStatus(userId: string, isActive: boolean) {
    const user = this.db.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    user.isActive = isActive;
    this.persist();
    return this.findUserById(userId);
  }

  public updateUserProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
      phone?: string;
      altPhone?: string;
      dob?: string;
      address?: CompleteAddress;
    }
  ) {
    const user = this.db.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');

    if (data.firstName !== undefined) {
      user.firstName = data.firstName.trim();
    }
    if (data.lastName !== undefined) {
      user.lastName = data.lastName.trim();
    }
    if (data.firstName !== undefined || data.lastName !== undefined) {
      const f = user.firstName || '';
      const l = user.lastName || '';
      user.name = `${f} ${l}`.trim() || user.name;
    }
    if (data.avatarUrl !== undefined) {
      user.avatarUrl = data.avatarUrl;
    }
    if (data.phone !== undefined) {
      user.phone = data.phone.trim();
    }
    if (data.altPhone !== undefined) {
      user.altPhone = data.altPhone.trim();
    }
    if (data.dob !== undefined) {
      user.dob = data.dob.trim();
    }
    if (data.address !== undefined) {
      user.address = {
        houseFlat: data.address.houseFlat?.trim() || '',
        streetArea: data.address.streetArea?.trim() || '',
        city: data.address.city?.trim() || '',
        state: data.address.state?.trim() || '',
        pincode: data.address.pincode?.trim() || '',
      };
    }

    // Sync CustomerProfile if exists
    let cp = this.db.customerProfiles.find((c) => c.userId === userId);
    if (cp) {
      if (user.firstName) cp.firstName = user.firstName;
      if (user.lastName) cp.lastName = user.lastName;
      if (user.dob) cp.dob = user.dob;
      if (user.phone) cp.phone = user.phone;
      if (user.altPhone) cp.altPhone = user.altPhone;
      if (user.address) {
        cp.address = user.address;
        cp.defaultAddress = `${user.address.houseFlat}, ${user.address.streetArea}, ${user.address.city}, ${user.address.state} - ${user.address.pincode}`;
        cp.city = user.address.city;
        cp.area = user.address.streetArea;
        cp.pincode = user.address.pincode;
      }
    }

    // Sync bookings if customer
    if (user.role === 'CUSTOMER') {
      for (const booking of this.db.bookings) {
        if (booking.customerId === userId) {
          booking.customerName = user.name;
          booking.customerPhone = user.phone;
        }
      }
    } else if (user.role === 'PROVIDER') {
      for (const booking of this.db.bookings) {
        if (booking.providerId === userId) {
          booking.providerName = user.name;
          booking.providerPhone = user.phone;
          if (user.avatarUrl) booking.providerAvatar = user.avatarUrl;
        }
      }
    }

    this.persist();
    return this.findUserById(userId);
  }

  // PROVIDER PROFILES
  public createProviderProfile(userId: string, data: Partial<ProviderProfile>): ProviderProfile {
    const newProfile: ProviderProfile = {
      id: `pp-${userId}`,
      userId,
      serviceCategory: data.serviceCategory || 'Electrician',
      services: data.services || [],
      experienceYears: data.experienceYears || 1,
      bio: data.bio || '',
      serviceAreas: data.serviceAreas || [this.db.settings.selectedCity],
      pricingStartingAt: data.pricingStartingAt || 299,
      availabilityStatus: 'AVAILABLE',
      workingHours: data.workingHours || '09:00 AM - 07:00 PM',
      verificationStatus: this.db.settings.instantApproval ? 'APPROVED' : 'PENDING',
      rating: 5.0,
      reviewCount: 0,
      completedJobsCount: 0,
      portfolioPhotos: data.portfolioPhotos || [],
    };

    this.db.providerProfiles.push(newProfile);

    // Notify admin about new provider
    this.addNotification({
      userId: this.db.users.find((u) => u.role === 'ADMIN')?.id || 'usr-admin-01',
      role: 'ADMIN',
      title: 'New Partner Onboarding Application',
      message: `${data.serviceCategory || 'Service'} provider registered. Review credentials.`,
      type: 'VERIFICATION',
      link: '/admin/providers',
    });

    this.persist();
    return newProfile;
  }

  public getProviders(filters?: {
    category?: string;
    area?: string;
    city?: string;
    verificationStatus?: VerificationStatus;
    availability?: AvailabilityStatus;
    minRating?: number;
    search?: string;
    sort?: 'recommended' | 'rating' | 'price_low' | 'experience';
  }) {
    let list = this.db.providerProfiles.map((pp) => {
      const user = this.db.users.find((u) => u.id === pp.userId);
      return {
        ...pp,
        user: user ? { id: user.id, name: user.name, phone: user.phone, email: user.email, avatarUrl: user.avatarUrl, isActive: user.isActive } : null,
      };
    }).filter((p) => p.user && p.user.isActive);

    if (filters?.verificationStatus) {
      list = list.filter((p) => p.verificationStatus === filters.verificationStatus);
    }
    if (filters?.category && filters.category !== 'All') {
      list = list.filter((p) => p.serviceCategory.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.area && filters.area !== 'All Areas') {
      list = list.filter((p) => p.serviceAreas.some((a) => a.toLowerCase().includes(filters.area!.toLowerCase())));
    }
    if (filters?.availability && filters.availability !== 'AVAILABLE') {
      list = list.filter((p) => p.availabilityStatus === filters.availability);
    }
    if (filters?.minRating) {
      list = list.filter((p) => p.rating >= filters.minRating!);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.user?.name.toLowerCase().includes(q) ||
          p.serviceCategory.toLowerCase().includes(q) ||
          p.services.some((s) => s.toLowerCase().includes(q)) ||
          p.serviceAreas.some((a) => a.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (filters?.sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (filters?.sort === 'price_low') {
      list.sort((a, b) => a.pricingStartingAt - b.pricingStartingAt);
    } else if (filters?.sort === 'experience') {
      list.sort((a, b) => b.experienceYears - a.experienceYears);
    } else {
      // Recommended: verified first, then completed jobs and rating
      list.sort((a, b) => {
        if (a.verificationStatus === 'APPROVED' && b.verificationStatus !== 'APPROVED') return -1;
        if (b.verificationStatus === 'APPROVED' && a.verificationStatus !== 'APPROVED') return 1;
        return b.completedJobsCount * b.rating - a.completedJobsCount * a.rating;
      });
    }

    return list;
  }

  public getProviderById(userId: string) {
    const pp = this.db.providerProfiles.find((p) => p.userId === userId);
    if (!pp) return null;
    const user = this.db.users.find((u) => u.id === userId);
    const reviews = this.db.reviews.filter((r) => r.providerId === userId);
    const completedCount = this.db.bookings.filter((b) => b.providerId === userId && b.status === 'COMPLETED').length;

    return {
      ...pp,
      completedJobsCount: Math.max(pp.completedJobsCount, completedCount),
      user: user ? { id: user.id, name: user.name, phone: user.phone, email: user.email, avatarUrl: user.avatarUrl } : null,
      reviews,
    };
  }

  public updateProviderStatus(userId: string, status: VerificationStatus) {
    const pp = this.db.providerProfiles.find((p) => p.userId === userId);
    if (!pp) throw new Error('Provider profile not found');
    pp.verificationStatus = status;

    this.addNotification({
      userId,
      role: 'PROVIDER',
      title: `Account Status: ${status}`,
      message:
        status === 'APPROVED'
          ? 'Congratulations! Your partner account has been verified. You can now accept customer bookings.'
          : `Your partner account status has been updated to ${status}.`,
      type: 'VERIFICATION',
      link: '/provider/dashboard',
    });

    this.persist();
    return pp;
  }

  public updateProviderAvailability(userId: string, status: AvailabilityStatus) {
    const pp = this.db.providerProfiles.find((p) => p.userId === userId);
    if (!pp) throw new Error('Provider profile not found');
    pp.availabilityStatus = status;
    this.persist();
    return pp;
  }

  public updateProviderProfile(userId: string, data: Partial<ProviderProfile>) {
    const pp = this.db.providerProfiles.find((p) => p.userId === userId);
    if (!pp) throw new Error('Provider profile not found');
    Object.assign(pp, data);
    this.persist();
    return pp;
  }

  // SERVICES
  public getServices() {
    return this.db.services;
  }

  public createService(data: Omit<ServiceCategory, 'id'>): ServiceCategory {
    const newService: ServiceCategory = {
      ...data,
      id: `srv-${Date.now()}`,
    };
    this.db.services.push(newService);
    this.persist();
    return newService;
  }

  public updateService(id: string, data: Partial<ServiceCategory>): ServiceCategory {
    const srv = this.db.services.find((s) => s.id === id);
    if (!srv) throw new Error('Service not found');
    Object.assign(srv, data);
    this.persist();
    return srv;
  }

  public deleteService(id: string) {
    const srv = this.db.services.find((s) => s.id === id);
    if (!srv) throw new Error('Service not found');
    srv.isActive = false; // Soft-delete
    this.persist();
    return srv;
  }

  // BOOKINGS
  public createBooking(data: {
    customerId: string;
    providerId: string;
    serviceId: string;
    date: string;
    timeSlot: string;
    address: string;
    city: string;
    area: string;
    pincode: string;
    problemDescription: string;
    problemImageUrl?: string;
    paymentMethod?: string;
  }): Booking {
    const customer = this.findUserById(data.customerId);
    if (!customer) throw new Error('Customer not found');

    const provider = this.getProviderById(data.providerId);
    if (!provider) throw new Error('Provider not found');
    if (provider.verificationStatus !== 'APPROVED') {
      throw new Error('Only approved and verified providers can receive bookings.');
    }

    const service = this.db.services.find((s) => s.id === data.serviceId);
    if (!service) throw new Error('Service not found');

    // Unique Booking Code: e.g. SC-2026-000104
    const seq = String(this.db.bookings.length + 101).padStart(6, '0');
    const bookingCode = `SC-2026-${seq}`;
    const bookingId = `bk-${Date.now()}`;

    const estimatedPrice = Math.max(provider.pricingStartingAt, service.basePrice);
    const platformFee = this.db.settings.platformFee;
    const taxAmount = Math.round(estimatedPrice * 0.05); // 5% GST/Taxes
    const totalAmount = estimatedPrice + platformFee + taxAmount;

    // Commission calculation
    const commissionPercent = this.db.settings.defaultCommissionPercentage;
    const platformCommission = Math.round((estimatedPrice * commissionPercent) / 100);
    const providerEarnings = estimatedPrice - platformCommission;

    const now = new Date().toISOString();

    const initialHistory: BookingStatusHistory = {
      id: `sh-${Date.now()}`,
      bookingId,
      status: 'PENDING',
      changedByRole: 'CUSTOMER',
      note: 'Booking requested by customer',
      timestamp: now,
    };

    const newBooking: Booking = {
      id: bookingId,
      bookingCode,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      providerId: provider.userId,
      providerName: provider.user?.name || 'Service Partner',
      providerPhone: provider.user?.phone,
      providerAvatar: provider.user?.avatarUrl,
      serviceId: service.id,
      serviceName: service.name,
      serviceCategory: service.categoryGroup,
      date: data.date,
      timeSlot: data.timeSlot,
      address: data.address,
      city: data.city,
      area: data.area,
      pincode: data.pincode,
      problemDescription: data.problemDescription,
      problemImageUrl: data.problemImageUrl,
      estimatedPrice,
      platformFee,
      taxAmount,
      totalAmount,
      platformCommission,
      providerEarnings,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMethod: data.paymentMethod || 'UPI / Doorstep Pay',
      createdAt: now,
      updatedAt: now,
      statusHistory: [initialHistory],
    };

    this.db.bookings.push(newBooking);
    this.db.bookingStatusHistory.push(initialHistory);

    // Notify Provider
    this.addNotification({
      userId: provider.userId,
      role: 'PROVIDER',
      title: 'New Booking Request!',
      message: `You have a new request for ${service.name} on ${data.date} at ${data.timeSlot}.`,
      type: 'BOOKING_CREATED',
      link: '/provider/dashboard',
    });

    // Notify Customer
    this.addNotification({
      userId: customer.id,
      role: 'CUSTOMER',
      title: 'Booking Placed Successfully',
      message: `Booking #${bookingCode} placed with ${provider.user?.name}. Awaiting partner confirmation.`,
      type: 'BOOKING_CREATED',
      link: '/customer/bookings',
    });

    // Notify Admin
    this.addNotification({
      userId: this.db.users.find((u) => u.role === 'ADMIN')?.id || 'usr-admin-01',
      role: 'ADMIN',
      title: `New Order: ${bookingCode}`,
      message: `${customer.name} booked ${service.name} with ${provider.user?.name} (₹${totalAmount})`,
      type: 'BOOKING_CREATED',
      link: '/admin/bookings',
    });

    this.persist();
    return newBooking;
  }

  public updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    changedByRole: UserRole,
    note?: string,
    cancellationReason?: string
  ): Booking {
    const booking = this.db.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    const now = new Date().toISOString();
    booking.status = newStatus;
    booking.updatedAt = now;

    if (newStatus === 'CANCELLED') {
      booking.cancelledBy = changedByRole;
      booking.cancellationReason = cancellationReason || note || 'Cancelled by user';
    }

    if (newStatus === 'COMPLETED') {
      booking.completedAt = now;
      booking.paymentStatus = 'PAID';

      // Record Commission
      const commissionRecord: CommissionRecord = {
        id: `comm-${Date.now()}`,
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        serviceName: booking.serviceName,
        providerId: booking.providerId,
        providerName: booking.providerName,
        bookingAmount: booking.estimatedPrice,
        commissionPercentage: this.db.settings.defaultCommissionPercentage,
        commissionAmount: booking.platformCommission,
        providerEarnings: booking.providerEarnings,
        createdAt: now,
      };
      this.db.commissions.push(commissionRecord);

      // Increment provider completed jobs
      const pp = this.db.providerProfiles.find((p) => p.userId === booking.providerId);
      if (pp) {
        pp.completedJobsCount += 1;
      }
    }

    const historyItem: BookingStatusHistory = {
      id: `sh-${Date.now()}`,
      bookingId,
      status: newStatus,
      changedByRole,
      note: note || `Status updated to ${newStatus}`,
      timestamp: now,
    };

    booking.statusHistory.push(historyItem);
    this.db.bookingStatusHistory.push(historyItem);

    // Notify relevant parties
    const statusReadable = newStatus.replace(/_/g, ' ');

    // To Customer
    this.addNotification({
      userId: booking.customerId,
      role: 'CUSTOMER',
      title: `Order Update: ${statusReadable}`,
      message: `Your booking #${booking.bookingCode} is now ${statusReadable}. ${note || ''}`,
      type: 'STATUS_CHANGED',
      link: '/customer/bookings',
    });

    // To Provider (if changed by customer or admin)
    if (changedByRole !== 'PROVIDER') {
      this.addNotification({
        userId: booking.providerId,
        role: 'PROVIDER',
        title: `Booking #${booking.bookingCode} Update`,
        message: `Booking has been marked as ${statusReadable} by ${changedByRole}.`,
        type: 'STATUS_CHANGED',
        link: '/provider/dashboard',
      });
    }

    this.persist();
    return booking;
  }

  public getBookings(filters?: {
    customerId?: string;
    providerId?: string;
    status?: BookingStatus | 'ALL';
    search?: string;
  }) {
    let list = [...this.db.bookings];

    if (filters?.customerId) {
      list = list.filter((b) => b.customerId === filters.customerId);
    }
    if (filters?.providerId) {
      list = list.filter((b) => b.providerId === filters.providerId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((b) => b.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (b) =>
          b.bookingCode.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.providerName.toLowerCase().includes(q) ||
          b.serviceName.toLowerCase().includes(q) ||
          b.area.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Attach reviews if any
    list.forEach((b) => {
      const rev = this.db.reviews.find((r) => r.bookingId === b.id);
      if (rev) b.review = rev;
    });

    return list;
  }

  public getBookingById(id: string) {
    const booking = this.db.bookings.find((b) => b.id === id || b.bookingCode === id);
    if (!booking) return null;
    const rev = this.db.reviews.find((r) => r.bookingId === booking.id);
    if (rev) booking.review = rev;
    return booking;
  }

  // REVIEWS
  public addReview(data: {
    bookingId: string;
    customerId: string;
    rating: number;
    reviewText: string;
  }): Review {
    const booking = this.db.bookings.find((b) => b.id === data.bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.customerId !== data.customerId) throw new Error('Unauthorized');
    if (booking.status !== 'COMPLETED') throw new Error('Reviews can only be added for completed bookings');

    // Prevent duplicate review for the same booking
    const existing = this.db.reviews.find((r) => r.bookingId === data.bookingId);
    if (existing) throw new Error('You have already submitted a review for this booking');

    const customer = this.findUserById(data.customerId);

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      bookingId: data.bookingId,
      customerId: data.customerId,
      customerName: customer?.name || 'Customer',
      customerAvatar: customer?.avatarUrl,
      providerId: booking.providerId,
      rating: Math.min(5, Math.max(1, data.rating)),
      reviewText: data.reviewText,
      createdAt: new Date().toISOString(),
      isModerated: false,
    };

    this.db.reviews.push(newReview);
    booking.review = newReview;

    // Recalculate provider aggregate rating
    const providerReviews = this.db.reviews.filter((r) => r.providerId === booking.providerId);
    const avg = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;
    const pp = this.db.providerProfiles.find((p) => p.userId === booking.providerId);
    if (pp) {
      pp.rating = Math.round(avg * 10) / 10;
      pp.reviewCount = providerReviews.length;
    }

    // Notify Provider
    this.addNotification({
      userId: booking.providerId,
      role: 'PROVIDER',
      title: 'New Customer Review Received!',
      message: `${customer?.name || 'Customer'} rated your service ${data.rating}★: "${data.reviewText.slice(0, 60)}..."`,
      type: 'REVIEW',
      link: '/provider/dashboard',
    });

    this.persist();
    return newReview;
  }

  // NOTIFICATIONS
  public getNotifications(userId?: string, role?: string) {
    return this.db.notifications
      .filter((n) => {
        // If guest (no userId), only return platform broadcast announcements
        if (!userId) {
          return n.userId === 'ALL' || n.role === 'ALL' || n.userId === 'GUEST';
        }
        // If logged in: return user's direct notifications + all platform/role broadcasts
        return (
          n.userId === userId ||
          n.userId === 'ALL' ||
          n.role === 'ALL' ||
          (role && n.role === role)
        );
      })
      .map((n) => {
        // Evaluate isRead state per-user for broadcast items
        if (n.userId === 'ALL' || n.role === 'ALL') {
          const readByList = n.readBy || [];
          const isRead = userId ? readByList.includes(userId) : n.isRead;
          return { ...n, isRead };
        }
        return n;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addNotification(data: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'> & { id?: string; createdAt?: string }) {
    const item: NotificationItem = {
      ...data,
      id: data.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: data.createdAt || new Date().toISOString(),
      isRead: false,
      readBy: [],
    };
    this.db.notifications.unshift(item);
    // Keep last 150 notifications
    if (this.db.notifications.length > 150) {
      this.db.notifications.length = 150;
    }
    this.persist();
    return item;
  }

  public markNotificationRead(id: string, userId?: string) {
    const item = this.db.notifications.find((n) => n.id === id);
    if (!item) return null;
    if (item.userId === userId) {
      item.isRead = true;
    } else if (userId && (item.userId === 'ALL' || item.role === 'ALL')) {
      if (!item.readBy) item.readBy = [];
      if (!item.readBy.includes(userId)) {
        item.readBy.push(userId);
      }
    } else {
      item.isRead = true;
    }
    this.persist();
    return item;
  }

  public markAllNotificationsRead(userId?: string, role?: string) {
    this.db.notifications.forEach((n) => {
      if (!userId) {
        if (n.userId === 'ALL' || n.role === 'ALL') {
          n.isRead = true;
        }
      } else {
        if (n.userId === userId) {
          n.isRead = true;
        } else if (n.userId === 'ALL' || n.role === 'ALL' || (role && n.role === role)) {
          if (!n.readBy) n.readBy = [];
          if (!n.readBy.includes(userId)) {
            n.readBy.push(userId);
          }
        }
      }
    });
    this.persist();
    return true;
  }

  public deleteNotification(id: string, userId?: string, isAdmin?: boolean) {
    const index = this.db.notifications.findIndex((n) => n.id === id);
    if (index === -1) return false;
    const item = this.db.notifications[index];
    if (isAdmin || item.userId === userId || (!userId && item.userId === 'ALL')) {
      this.db.notifications.splice(index, 1);
      this.persist();
      return true;
    }
    return false;
  }

  public getAllNotificationsAdmin() {
    return [...this.db.notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // SETTINGS & COMMISSIONS
  public getSettings() {
    return this.db.settings;
  }

  public updateSettings(data: Partial<PlatformSettings>) {
    Object.assign(this.db.settings, data);
    this.persist();
    return this.db.settings;
  }

  public getCommissions() {
    return [...this.db.commissions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // ANALYTICS
  public getAdminAnalytics() {
    const totalCustomers = this.db.users.filter((u) => u.role === 'CUSTOMER').length;
    const totalProviders = this.db.providerProfiles.length;
    const pendingProvidersCount = this.db.providerProfiles.filter((p) => p.verificationStatus === 'PENDING').length;

    const totalBookings = this.db.bookings.length;
    const activeBookings = this.db.bookings.filter(
      (b) => b.status === 'PENDING' || b.status === 'ACCEPTED' || b.status === 'PROVIDER_ON_THE_WAY' || b.status === 'IN_PROGRESS'
    ).length;
    const completedBookings = this.db.bookings.filter((b) => b.status === 'COMPLETED').length;
    const cancelledBookings = this.db.bookings.filter((b) => b.status === 'CANCELLED').length;

    const totalGrossRevenue = this.db.bookings
      .filter((b) => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const totalPlatformCommission = this.db.commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

    const cancellationRate = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0;

    // Popular services
    const serviceCounts: Record<string, { bookings: number; revenue: number }> = {};
    this.db.bookings.forEach((b) => {
      if (!serviceCounts[b.serviceName]) {
        serviceCounts[b.serviceName] = { bookings: 0, revenue: 0 };
      }
      serviceCounts[b.serviceName].bookings += 1;
      if (b.status === 'COMPLETED') {
        serviceCounts[b.serviceName].revenue += b.totalAmount;
      }
    });

    const popularServices = Object.entries(serviceCounts).map(([name, stat]) => ({
      name,
      bookings: stat.bookings,
      revenue: stat.revenue,
    })).sort((a, b) => b.bookings - a.bookings);

    // Provider Leaderboard
    const providerLeaderboard = this.db.providerProfiles.map((pp) => {
      const user = this.db.users.find((u) => u.id === pp.userId);
      const earned = this.db.commissions
        .filter((c) => c.providerId === pp.userId)
        .reduce((sum, c) => sum + c.providerEarnings, 0);
      return {
        id: pp.userId,
        name: user?.name || 'Partner',
        jobs: pp.completedJobsCount,
        rating: pp.rating,
        earnings: Math.round(earned),
      };
    }).sort((a, b) => b.jobs - a.jobs);

    // Recent 7 days timeline
    const recentBookingsTimeline = [
      { date: 'Sep 09', bookings: 12, revenue: 5400 },
      { date: 'Sep 10', bookings: 16, revenue: 7800 },
      { date: 'Sep 11', bookings: 14, revenue: 6200 },
      { date: 'Sep 12', bookings: 19, revenue: 9100 },
      { date: 'Sep 13', bookings: 22, revenue: 11200 },
      { date: 'Sep 14', bookings: 25, revenue: 12800 },
      { date: 'Sep 15', bookings: 18, revenue: 8900 },
    ];

    return {
      totalCustomers,
      totalProviders,
      pendingProvidersCount,
      totalBookings,
      activeBookings,
      completedBookings,
      cancelledBookings,
      totalGrossRevenue,
      totalPlatformCommission,
      cancellationRate,
      popularServices,
      recentBookingsTimeline,
      providerLeaderboard,
    };
  }

  // Provider Specific Dashboard Stats
  public getProviderDashboard(providerId: string) {
    const pp = this.getProviderById(providerId);
    if (!pp) throw new Error('Provider not found');

    const providerBookings = this.db.bookings.filter((b) => b.providerId === providerId);
    const todayStr = new Date().toISOString().slice(0, 10);

    const todaysBookings = providerBookings.filter((b) => b.date === todayStr && b.status !== 'CANCELLED');
    const pendingRequests = providerBookings.filter((b) => b.status === 'PENDING');
    const activeJobs = providerBookings.filter(
      (b) => b.status === 'ACCEPTED' || b.status === 'PROVIDER_ON_THE_WAY' || b.status === 'IN_PROGRESS'
    );
    const completedJobs = providerBookings.filter((b) => b.status === 'COMPLETED');

    const providerCommissions = this.db.commissions.filter((c) => c.providerId === providerId);
    const grossBookingAmount = completedJobs.reduce((sum, b) => sum + b.estimatedPrice, 0);
    const platformCommissionDeducted = providerCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    const netEarnings = providerCommissions.reduce((sum, c) => sum + c.providerEarnings, 0);

    // Unique customers served
    const uniqueCustomers = new Set(completedJobs.map((b) => b.customerId)).size;

    return {
      profile: pp,
      todaysBookings,
      pendingRequests,
      activeJobs,
      completedJobs,
      grossBookingAmount,
      platformCommissionDeducted,
      netEarnings,
      uniqueCustomers,
      recentBookings: providerBookings.slice(0, 10),
    };
  }

  // --- UPI PAYMENT OPERATIONS ---
  public getPaymentStats(): PaymentStats {
    const payments = this.db.payments || [];
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const thisMonthStr = now.toISOString().slice(0, 7);

    let totalVerifiedAmount = 0;
    let totalPendingAmount = 0;
    let totalRejectedAmount = 0;
    let todayPaymentsCount = 0;
    let todayPaymentsAmount = 0;
    let thisMonthPaymentsCount = 0;
    let thisMonthPaymentsAmount = 0;

    payments.forEach((p) => {
      const amt = Number(p.amount) || 0;
      if (p.status === 'VERIFIED / PAID') {
        totalVerifiedAmount += amt;
      } else if (p.status === 'PENDING VERIFICATION') {
        totalPendingAmount += amt;
      } else if (p.status === 'REJECTED') {
        totalRejectedAmount += amt;
      }

      const pDate = p.createdAt ? p.createdAt.slice(0, 10) : '';
      const pMonth = p.createdAt ? p.createdAt.slice(0, 7) : '';

      if (pDate === todayStr) {
        todayPaymentsCount++;
        todayPaymentsAmount += amt;
      }
      if (pMonth === thisMonthStr) {
        thisMonthPaymentsCount++;
        thisMonthPaymentsAmount += amt;
      }
    });

    return {
      totalPayments: payments.length,
      totalVerifiedAmount,
      totalPendingAmount,
      totalRejectedAmount,
      totalTransactions: payments.length,
      todayPaymentsCount,
      todayPaymentsAmount,
      thisMonthPaymentsCount,
      thisMonthPaymentsAmount,
    };
  }

  public getAllPayments(filters?: {
    status?: string;
    search?: string;
    service?: string;
    startDate?: string;
    endDate?: string;
    customer?: string;
    utr?: string;
    bookingId?: string;
  }): { payments: PaymentRecord[]; stats: PaymentStats } {
    let list = [...(this.db.payments || [])];

    if (filters) {
      if (filters.status && filters.status !== 'ALL') {
        list = list.filter((p) => p.status === filters.status);
      }
      if (filters.service && filters.service !== 'ALL') {
        list = list.filter((p) => p.serviceOrPlan?.toLowerCase().includes(filters.service!.toLowerCase()));
      }
      if (filters.startDate) {
        list = list.filter((p) => p.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        const endIso = filters.endDate.includes('T') ? filters.endDate : `${filters.endDate}T23:59:59.999Z`;
        list = list.filter((p) => p.createdAt <= endIso);
      }
      if (filters.customer) {
        const cLower = filters.customer.toLowerCase();
        list = list.filter(
          (p) =>
            p.customerName?.toLowerCase().includes(cLower) ||
            p.customerEmail?.toLowerCase().includes(cLower)
        );
      }
      if (filters.utr) {
        const utrLower = filters.utr.toLowerCase();
        list = list.filter((p) => p.utr?.toLowerCase().includes(utrLower));
      }
      if (filters.bookingId) {
        const bLower = filters.bookingId.toLowerCase();
        list = list.filter(
          (p) =>
            p.bookingId?.toLowerCase().includes(bLower) ||
            p.bookingCode?.toLowerCase().includes(bLower)
        );
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(
          (p) =>
            p.customerName?.toLowerCase().includes(q) ||
            p.customerEmail?.toLowerCase().includes(q) ||
            (p.customerPhone && p.customerPhone.includes(q)) ||
            p.utr?.toLowerCase().includes(q) ||
            p.bookingCode?.toLowerCase().includes(q) ||
            p.bookingId?.toLowerCase().includes(q) ||
            p.serviceOrPlan?.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q)
        );
      }
    }

    // Sort descending by created date
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      payments: list,
      stats: this.getPaymentStats(),
    };
  }

  public getPaymentById(id: string): PaymentRecord | undefined {
    return (this.db.payments || []).find((p) => p.id === id);
  }

  public getPaymentsByCustomerId(customerId: string): PaymentRecord[] {
    return (this.db.payments || [])
      .filter((p) => p.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public findPaymentByUtr(utr: string): PaymentRecord | undefined {
    if (!utr) return undefined;
    const cleanUtr = utr.trim().toLowerCase();
    return (this.db.payments || []).find((p) => p.utr.trim().toLowerCase() === cleanUtr);
  }

  public submitPayment(params: {
    bookingId?: string;
    bookingCode?: string;
    serviceOrPlan?: string;
    amount?: number;
    customerId: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    utr: string;
    screenshotUrl?: string;
  }): PaymentRecord {
    const rawUtr = (params.utr || '').trim();
    if (!rawUtr) {
      throw new Error('UTR / Transaction ID is required.');
    }

    // Reasonable format validation: alphanumeric, dashes, dots, underscores, between 6 and 35 chars
    if (!/^[a-zA-Z0-9_\-\/\@\.]{6,35}$/.test(rawUtr)) {
      throw new Error('Please enter a valid UPI UTR / Transaction ID (6-35 characters).');
    }

    // Server-side duplicate check
    const existing = this.findPaymentByUtr(rawUtr);
    if (existing) {
      throw new Error('This UTR/Transaction ID has already been submitted.');
    }

    // Resolve authoritative booking and customer records
    let linkedBooking: Booking | undefined;
    if (params.bookingId || params.bookingCode) {
      linkedBooking = this.db.bookings.find(
        (b) => b.id === params.bookingId || b.bookingCode === params.bookingCode || b.id === params.bookingCode
      );
    }

    const customerUser = this.db.users.find((u) => u.id === params.customerId);
    const customerName = linkedBooking?.customerName || customerUser?.name || params.customerName || 'Customer';
    const customerEmail = linkedBooking?.customerEmail || customerUser?.email || params.customerEmail || '';
    const customerPhone = linkedBooking?.customerPhone || customerUser?.phone || params.customerPhone || '';

    // Authoritative amount and service from real backend booking/plan
    const amount = linkedBooking ? Number(linkedBooking.totalAmount) : (Number(params.amount) || 499);
    const serviceOrPlan = linkedBooking ? linkedBooking.serviceName : (params.serviceOrPlan || 'Standard Service');
    const bookingId = linkedBooking ? linkedBooking.id : (params.bookingId || `ORD-${Date.now().toString().slice(-6)}`);
    const bookingCode = linkedBooking ? linkedBooking.bookingCode : (params.bookingCode || bookingId);

    const now = new Date().toISOString();
    const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: PaymentRecord = {
      id: paymentId,
      bookingId,
      bookingCode,
      customerId: params.customerId,
      customerName,
      customerEmail,
      customerPhone,
      serviceOrPlan,
      amount,
      upiId: 'ravikanhauli91@ptyes',
      utr: rawUtr,
      screenshotUrl: params.screenshotUrl,
      status: 'PENDING VERIFICATION',
      createdAt: now,
      updatedAt: now,
      history: [
        {
          status: 'PENDING VERIFICATION',
          changedBy: customerName,
          changedAt: now,
          note: `Payment submitted for verification with UTR: ${rawUtr}`,
        },
      ],
    };

    if (!this.db.payments) {
      this.db.payments = [];
    }
    this.db.payments.unshift(newPayment);

    // Update booking payment status
    if (linkedBooking) {
      linkedBooking.paymentStatus = 'PENDING';
      linkedBooking.paymentMethod = 'UPI (ravikanhauli91@ptyes)';
      if (!linkedBooking.statusHistory) linkedBooking.statusHistory = [];
      linkedBooking.statusHistory.push({
        id: `sh-${Date.now()}`,
        bookingId: linkedBooking.id,
        status: linkedBooking.status,
        changedByRole: 'CUSTOMER',
        timestamp: now,
        note: `UPI Payment submitted with UTR ${rawUtr}. Awaiting Admin Verification.`,
      });
    }

    this.persist();
    return newPayment;
  }

  public getUserById(id: string): User | undefined {
    return this.db.users.find((u) => u.id === id);
  }

  public verifyPayment(paymentId: string, adminId: string, adminName: string, remarks?: string): PaymentRecord {
    const payment = (this.db.payments || []).find((p) => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment record not found.');
    }

    const now = new Date().toISOString();
    payment.status = 'VERIFIED / PAID';
    payment.verifiedAt = now;
    payment.verifiedByAdminId = adminId;
    payment.verifiedByAdminName = adminName;
    payment.updatedAt = now;
    if (remarks) {
      payment.adminRemarks = remarks;
    }

    if (!payment.history) payment.history = [];
    payment.history.push({
      status: 'VERIFIED / PAID',
      changedBy: `${adminName} (Admin)`,
      changedAt: now,
      note: remarks || 'Payment confirmed and verified via UPI settlement records.',
    });

    // Update linked booking
    const booking = this.db.bookings.find(
      (b) => b.id === payment.bookingId || b.bookingCode === payment.bookingCode
    );
    if (booking) {
      booking.paymentStatus = 'PAID';
      booking.paymentMethod = 'UPI (ravikanhauli91@ptyes)';
      if (booking.status === 'PENDING') {
        booking.status = 'ACCEPTED';
      }
      if (!booking.statusHistory) booking.statusHistory = [];
      booking.statusHistory.push({
        id: `sh-${Date.now()}`,
        bookingId: booking.id,
        status: booking.status,
        changedByRole: 'ADMIN',
        timestamp: now,
        note: `Payment verified via UTR ${payment.utr}. Status set to PAID.`,
      });
    }

    this.persist();
    return payment;
  }

  public rejectPayment(
    paymentId: string,
    adminId: string,
    adminName: string,
    rejectionReason: string,
    remarks?: string
  ): PaymentRecord {
    const payment = (this.db.payments || []).find((p) => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment record not found.');
    }

    const reason = (rejectionReason || '').trim() || 'Payment could not be verified in UPI settlement';
    const now = new Date().toISOString();
    payment.status = 'REJECTED';
    payment.verifiedAt = now;
    payment.verifiedByAdminId = adminId;
    payment.verifiedByAdminName = adminName;
    payment.rejectionReason = reason;
    payment.updatedAt = now;
    if (remarks) {
      payment.adminRemarks = remarks;
    }

    if (!payment.history) payment.history = [];
    payment.history.push({
      status: 'REJECTED',
      changedBy: `${adminName} (Admin)`,
      changedAt: now,
      note: `Payment rejected: ${reason}`,
    });

    // Update linked booking
    const booking = this.db.bookings.find(
      (b) => b.id === payment.bookingId || b.bookingCode === payment.bookingCode
    );
    if (booking) {
      booking.paymentStatus = 'FAILED';
      if (!booking.statusHistory) booking.statusHistory = [];
      booking.statusHistory.push({
        id: `sh-${Date.now()}`,
        bookingId: booking.id,
        status: booking.status,
        changedByRole: 'ADMIN',
        timestamp: now,
        note: `UPI Payment (UTR: ${payment.utr}) rejected: ${reason}`,
      });
    }

    this.persist();
    return payment;
  }
}

// Global Singleton Instance to maintain state across hot reloads
declare global {
  var _sevaConnectDB: RelationalDatabase | undefined;
}

if (!global._sevaConnectDB) {
  global._sevaConnectDB = new RelationalDatabase();
}

export const db = global._sevaConnectDB;
