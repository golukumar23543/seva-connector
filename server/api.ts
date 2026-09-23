import express, { Request, Response, NextFunction } from 'express';
import { db, createToken, verifyToken, verifyPassword, registrationCodeManager } from './db.ts';
import type { UserRole, BookingStatus, VerificationStatus, AvailabilityStatus } from '../src/types.ts';

export const apiRouter = express.Router();

// Middleware: Authenticate user from Bearer token
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
    email: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized: Expired or invalid token' });
  }

  req.user = payload;
  next();
}

export function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}

export function roleMiddleware(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
}

// -------------------------------------------------------------
// AUTH ENDPOINTS
// -------------------------------------------------------------

// POST /api/auth/register
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone, role, providerDetails } = req.body;

    if (!email || !password || !name || !phone || !role) {
      return res.status(400).json({ error: 'Missing required registration fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const newUser = db.createUser({
      email,
      password,
      name,
      phone,
      role,
    });

    if (role === 'PROVIDER' && providerDetails) {
      db.createProviderProfile(newUser.id, {
        serviceCategory: providerDetails.serviceCategory,
        services: providerDetails.services || [],
        experienceYears: Number(providerDetails.experienceYears) || 1,
        bio: providerDetails.bio || '',
        serviceAreas: providerDetails.serviceAreas || ['Jaipur'],
        pricingStartingAt: Number(providerDetails.pricingStartingAt) || 299,
        workingHours: providerDetails.workingHours || '09:00 AM - 07:00 PM',
      });
    }

    const token = createToken({
      userId: newUser.id,
      role: newUser.role,
      email: newUser.email,
    });

    const fullUser = db.findUserById(newUser.id);
    return res.status(201).json({ user: fullUser, token });
  } catch (error: any) {
    console.error('Registration failed:', error);
    return res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

// POST /api/auth/register-customer
// Dedicated Customer Registration via Email + Phone with 4-digit Admin Code
apiRouter.post('/auth/register-customer', async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      dob,
      email,
      phone,
      altPhone,
      address,
      password,
      confirmPassword,
      registrationCode,
    } = req.body;

    // 1. Mandatory validations
    if (!firstName || !lastName || !dob || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All required fields (Name, DOB, Email, Phone, Passwords) must be filled.' });
    }

    if (
      !address ||
      !address.houseFlat ||
      !address.streetArea ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      return res.status(400).json({
        error: 'Complete address (House/Flat No, Street/Area, City, State, PIN Code) is required.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match. Please re-enter your password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // 2. Validate 4-digit Registration Code against Admin rotating code
    const codeValidation = registrationCodeManager.validate(registrationCode);
    if (!codeValidation.valid) {
      return res.status(400).json({ error: codeValidation.error || 'Invalid or expired 4-digit registration code.' });
    }

    // 3. Create customer account with EMAIL_PHONE method
    const newUser = db.createCustomerUser({
      firstName,
      lastName,
      dob,
      email,
      phone,
      altPhone,
      address,
      password,
      registrationMethod: 'EMAIL_PHONE',
    });

    // 4. Generate Auth Token
    const token = createToken({
      userId: newUser.id,
      role: newUser.role,
      email: newUser.email,
    });

    const fullUser = db.findUserById(newUser.id);
    return res.status(201).json({
      user: fullUser,
      token,
      message: 'Your customer account has been created successfully.',
    });
  } catch (error: any) {
    console.error('Customer registration failed:', error);
    return res.status(400).json({ error: error.message || 'Customer registration failed' });
  }
});

// POST /api/auth/google/verify
// Verifies Google login or returns if profile completion is required
apiRouter.post('/auth/google/verify', async (req: Request, res: Response) => {
  try {
    const { googleId, email, name, avatarUrl } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Google email is required' });
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      if (!existingUser.isActive) {
        return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
      }
      db.recordUserLogin(existingUser.id);
      const token = createToken({
        userId: existingUser.id,
        role: existingUser.role,
        email: existingUser.email,
      });
      const fullUser = db.findUserById(existingUser.id);
      return res.json({
        status: 'LOGGED_IN',
        user: fullUser,
        token,
        message: 'Signed in successfully with Google.',
      });
    }

    // Customer needs profile completion (DOB, phone, complete address)
    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return res.json({
      status: 'NEEDS_PROFILE_COMPLETION',
      googleUser: {
        googleId: googleId || `g-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        email: email.toLowerCase().trim(),
        firstName,
        lastName,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
      },
    });
  } catch (error: any) {
    console.error('Google verification failed:', error);
    return res.status(500).json({ error: error.message || 'Google verification failed' });
  }
});

// POST /api/auth/google/register-customer
// Creates Google registered customer account with completed profile details
apiRouter.post('/auth/google/register-customer', async (req: Request, res: Response) => {
  try {
    const {
      googleId,
      email,
      firstName,
      lastName,
      dob,
      phone,
      altPhone,
      address,
      avatarUrl,
    } = req.body;

    if (!email || !firstName || !lastName || !dob || !phone) {
      return res.status(400).json({ error: 'First Name, Last Name, DOB, and Phone Number are required.' });
    }

    if (
      !address ||
      !address.houseFlat ||
      !address.streetArea ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      return res.status(400).json({
        error: 'Complete address (House/Flat No, Street/Area, City, State, PIN Code) is required.',
      });
    }

    const newUser = db.createCustomerUser({
      firstName,
      lastName,
      dob,
      email,
      phone,
      altPhone,
      address,
      registrationMethod: 'GOOGLE',
      googleId: googleId || `g-sub-${Date.now()}`,
      avatarUrl,
    });

    const token = createToken({
      userId: newUser.id,
      role: newUser.role,
      email: newUser.email,
    });

    const fullUser = db.findUserById(newUser.id);
    return res.status(201).json({
      user: fullUser,
      token,
      message: 'Your customer account has been created successfully.',
    });
  } catch (error: any) {
    console.error('Google customer registration failed:', error);
    return res.status(400).json({ error: error.message || 'Customer registration failed' });
  }
});

// POST /api/auth/login
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const userWithSecrets = db.findUserByEmail(email);
    if (!userWithSecrets) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!userWithSecrets.isActive) {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
    }

    const valid = verifyPassword(password, userWithSecrets.passwordHash, userWithSecrets.salt);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    db.recordUserLogin(userWithSecrets.id);

    const token = createToken({
      userId: userWithSecrets.id,
      role: userWithSecrets.role,
      email: userWithSecrets.email,
    });

    const fullUser = db.findUserById(userWithSecrets.id);
    return res.json({ user: fullUser, token });
  } catch (error: any) {
    console.error('Login failed:', error);
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// GET /api/auth/me
apiRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = db.findUserById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch user' });
  }
});

// PUT /api/auth/profile (Update customer/user profile: name, avatar, phone, address, etc.)
apiRouter.put('/auth/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { firstName, lastName, avatarUrl, phone, altPhone, dob, address } = req.body;

    if (firstName !== undefined && !firstName.trim()) {
      return res.status(400).json({ error: 'First name cannot be empty.' });
    }
    if (lastName !== undefined && !lastName.trim()) {
      return res.status(400).json({ error: 'Last name cannot be empty.' });
    }

    const updatedUser = db.updateUserProfile(userId, {
      firstName,
      lastName,
      avatarUrl,
      phone,
      altPhone,
      dob,
      address,
    });

    return res.json({
      user: updatedUser,
      message: 'Profile updated successfully.',
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(400).json({ error: error.message || 'Failed to update profile' });
  }
});

// POST /api/auth/demo-login (Quick switcher for testing end-to-end flow!)
apiRouter.post('/auth/demo-login', (req: Request, res: Response) => {
  try {
    const { demoRole } = req.body; // 'ADMIN' | 'CO_ADMIN' | 'PROVIDER_ELECTRICIAN' | 'PROVIDER_AC' | 'CUSTOMER'
    let targetEmail = 'admin@sevaconnect.in';

    if (demoRole === 'CUSTOMER') {
      targetEmail = 'rahul.customer@gmail.com';
    } else if (demoRole === 'PROVIDER_ELECTRICIAN') {
      targetEmail = 'rajesh.electrician@sevaconnect.in';
    } else if (demoRole === 'PROVIDER_AC') {
      targetEmail = 'vikram.ac@sevaconnect.in';
    } else if (demoRole === 'CO_ADMIN') {
      targetEmail = 'coadmin@sevaconnect.in';
    } else if (demoRole === 'ADMIN') {
      targetEmail = 'admin@sevaconnect.in';
    }

    let user = db.findUserByEmail(targetEmail) as any;
    if (!user && demoRole === 'CO_ADMIN') {
      user = db.findUserById('usr-admin-02') || db.findUserByEmail('alok.admin@sevaconnect.in');
    }
    if (!user && demoRole === 'ADMIN') {
      user = db.findUserById('usr-admin-01');
    }
    if (!user) {
      return res.status(404).json({ error: 'Demo user not found' });
    }

    const token = createToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    const fullUser = db.findUserById(user.id);
    return res.json({ user: fullUser, token });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Demo login failed' });
  }
});

// POST /api/auth/admin-login (Secure hidden super admin authentication)
apiRouter.post('/auth/admin-login', (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const expectedPassword = process.env.ADMIN_PASSWORD || 'Golu@12';

    if (!password || password !== expectedPassword) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const adminUser = db.findUserByEmail('admin@sevaconnect.in') || db.findUserById('usr-admin-01');
    if (!adminUser) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    const token = createToken({
      userId: adminUser.id,
      role: 'ADMIN',
      email: adminUser.email,
    });

    const fullUser = db.findUserById(adminUser.id);
    return res.json({ user: fullUser, token });
  } catch (error: any) {
    return res.status(500).json({ error: 'Admin authentication failed' });
  }
});

// -------------------------------------------------------------
// SERVICES ENDPOINTS
// -------------------------------------------------------------

// GET /api/services
apiRouter.get('/services', (req: Request, res: Response) => {
  try {
    const services = db.getServices();
    return res.json(services);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch services' });
  }
});

// POST /api/services (Admin only)
apiRouter.post('/services', authMiddleware, roleMiddleware(['ADMIN']), (req: Request, res: Response) => {
  try {
    const { name, slug, description, iconName, basePrice, categoryGroup, popular, isActive } = req.body;
    if (!name || !basePrice) {
      return res.status(400).json({ error: 'Name and base price are required' });
    }

    const newService = db.createService({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description: description || '',
      iconName: iconName || 'Wrench',
      basePrice: Number(basePrice),
      categoryGroup: categoryGroup || 'General Service',
      popular: Boolean(popular),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return res.status(201).json(newService);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create service' });
  }
});

// PUT /api/services/:id (Admin only)
apiRouter.put('/services/:id', authMiddleware, roleMiddleware(['ADMIN']), (req: Request, res: Response) => {
  try {
    const updated = db.updateService(req.params.id, req.body);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update service' });
  }
});

// DELETE /api/services/:id (Admin only)
apiRouter.delete('/services/:id', authMiddleware, roleMiddleware(['ADMIN']), (req: Request, res: Response) => {
  try {
    const deactivated = db.deleteService(req.params.id);
    return res.json(deactivated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete service' });
  }
});

// -------------------------------------------------------------
// PROVIDERS ENDPOINTS
// -------------------------------------------------------------

// GET /api/providers
apiRouter.get('/providers', (req: Request, res: Response) => {
  try {
    const { category, area, city, verificationStatus, availability, minRating, search, sort } = req.query;

    const providers = db.getProviders({
      category: category as string,
      area: area as string,
      city: city as string,
      verificationStatus: verificationStatus as VerificationStatus,
      availability: availability as AvailabilityStatus,
      minRating: minRating ? Number(minRating) : undefined,
      search: search as string,
      sort: sort as any,
    });

    return res.json(providers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch providers' });
  }
});

// GET /api/providers/:id
apiRouter.get('/providers/:id', (req: Request, res: Response) => {
  try {
    const provider = db.getProviderById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    return res.json(provider);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch provider' });
  }
});

// PUT /api/providers/:id/status (Admin only: APPROVE, REJECT, SUSPEND, PENDING)
apiRouter.put('/providers/:id/status', authMiddleware, roleMiddleware(['ADMIN']), (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const updated = db.updateProviderStatus(req.params.id, status as VerificationStatus);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update provider status' });
  }
});

// PUT /api/providers/availability (Provider only)
apiRouter.put('/providers/availability', authMiddleware, roleMiddleware(['PROVIDER']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Availability status is required' });
    }
    const updated = db.updateProviderAvailability(req.user!.userId, status as AvailabilityStatus);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update availability' });
  }
});

// PUT /api/providers/profile (Provider only)
apiRouter.put('/providers/profile', authMiddleware, roleMiddleware(['PROVIDER']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateProviderProfile(req.user!.userId, req.body);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

// -------------------------------------------------------------
// BOOKINGS ENDPOINTS
// -------------------------------------------------------------

// POST /api/bookings (Multi-step booking creation)
apiRouter.post('/bookings', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      providerId,
      serviceId,
      date,
      timeSlot,
      address,
      city,
      area,
      pincode,
      problemDescription,
      problemImageUrl,
      paymentMethod,
    } = req.body;

    if (!providerId || !serviceId || !date || !timeSlot || !address) {
      return res.status(400).json({ error: 'Missing required booking parameters' });
    }

    const booking = db.createBooking({
      customerId: req.user!.userId,
      providerId,
      serviceId,
      date,
      timeSlot,
      address,
      city: city || 'Jaipur',
      area: area || 'Mansarovar',
      pincode: pincode || '302020',
      problemDescription: problemDescription || '',
      problemImageUrl,
      paymentMethod,
    });

    return res.status(201).json(booking);
  } catch (error: any) {
    console.error('Booking creation error:', error);
    return res.status(400).json({ error: error.message || 'Failed to create booking' });
  }
});

// GET /api/bookings
apiRouter.get('/bookings', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    const role = req.user!.role;
    const userId = req.user!.userId;

    let customerId: string | undefined = undefined;
    let providerId: string | undefined = undefined;

    if (role === 'CUSTOMER') {
      customerId = userId;
    } else if (role === 'PROVIDER') {
      providerId = userId;
    }
    // If ADMIN, sees all bookings

    const list = db.getBookings({
      customerId,
      providerId,
      status: status as any,
      search: search as string,
    });

    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/:id
apiRouter.get('/bookings/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const booking = db.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Role check: customer, provider or admin only
    if (
      req.user!.role !== 'ADMIN' &&
      booking.customerId !== req.user!.userId &&
      booking.providerId !== req.user!.userId
    ) {
      return res.status(403).json({ error: 'Forbidden: You cannot view this booking' });
    }

    return res.json(booking);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve booking' });
  }
});

// PUT /api/bookings/:id/status (Lifecycle transitions)
apiRouter.put('/bookings/:id/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, note, cancellationReason } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const booking = db.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const role = req.user!.role;
    const userId = req.user!.userId;

    // Authorization checks:
    // Customer can only cancel
    if (role === 'CUSTOMER') {
      if (booking.customerId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      if (status !== 'CANCELLED') {
        return res.status(400).json({ error: 'Customers can only cancel bookings' });
      }
      if (booking.status === 'COMPLETED' || booking.status === 'IN_PROGRESS') {
        return res.status(400).json({ error: 'Cannot cancel an order that is already in-progress or completed' });
      }
    }

    // Provider can transition ACCEPTED -> ON_THE_WAY -> IN_PROGRESS -> COMPLETED or CANCELLED
    if (role === 'PROVIDER') {
      if (booking.providerId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    const updated = db.updateBookingStatus(
      booking.id,
      status as BookingStatus,
      role,
      note,
      cancellationReason
    );

    return res.json(updated);
  } catch (error: any) {
    console.error('Status update failed:', error);
    return res.status(400).json({ error: error.message || 'Failed to update booking status' });
  }
});

// -------------------------------------------------------------
// REVIEWS ENDPOINTS
// -------------------------------------------------------------

// POST /api/reviews
apiRouter.post('/reviews', authMiddleware, roleMiddleware(['CUSTOMER']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookingId, rating, reviewText } = req.body;
    if (!bookingId || !rating || !reviewText) {
      return res.status(400).json({ error: 'Missing booking ID, rating, or review text' });
    }

    const review = db.addReview({
      bookingId,
      customerId: req.user!.userId,
      rating: Number(rating),
      reviewText,
    });

    return res.status(201).json(review);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to submit review' });
  }
});

// -------------------------------------------------------------
// NOTIFICATIONS ENDPOINTS
// -------------------------------------------------------------

// GET /api/notifications (Supports both logged-in users and guests)
apiRouter.get('/notifications', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const items = db.getNotifications(userId, role);
    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/public (Dedicated public announcements endpoint)
apiRouter.get('/notifications/public', (_req: Request, res: Response) => {
  try {
    const items = db.getNotifications();
    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch public notifications' });
  }
});

// PUT /api/notifications/:id/read
apiRouter.put('/notifications/:id/read', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = db.markNotificationRead(req.params.id, req.user?.userId);
    return res.json(item || { success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to mark read' });
  }
});

// PUT /api/notifications/read-all
apiRouter.put('/notifications/read-all', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    db.markAllNotificationsRead(req.user?.userId, req.user?.role);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to mark all read' });
  }
});

// DELETE /api/notifications/:id (Dismiss/delete notification)
apiRouter.delete('/notifications/:id', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const success = db.deleteNotification(req.params.id, req.user?.userId, isAdmin);
    return res.json({ success });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete notification' });
  }
});

// GET /api/admin/notifications (Admin: view all system & broadcast notifications)
apiRouter.get('/admin/notifications', authMiddleware, roleMiddleware(['ADMIN']), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const items = db.getAllNotificationsAdmin();
    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch all notifications for admin' });
  }
});

// POST /api/admin/notifications/broadcast (Admin: broadcast to all or specific roles)
apiRouter.post('/admin/notifications/broadcast', authMiddleware, roleMiddleware(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, message, type, role, link, priority } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required for broadcast.' });
    }

    const newNotification = db.addNotification({
      userId: 'ALL',
      role: role || 'ALL',
      title: title.trim(),
      message: message.trim(),
      type: type || 'ANNOUNCEMENT',
      link: link ? link.trim() : undefined,
      priority: priority || 'NORMAL',
    });

    return res.json({
      success: true,
      message: 'Notification successfully broadcasted to users.',
      notification: newNotification,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to broadcast notification' });
  }
});

// -------------------------------------------------------------
// PROVIDER DASHBOARD STATS
// -------------------------------------------------------------

// GET /api/provider/dashboard
apiRouter.get('/provider/dashboard', authMiddleware, roleMiddleware(['PROVIDER']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = db.getProviderDashboard(req.user!.userId);
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch provider dashboard' });
  }
});

// -------------------------------------------------------------
// ADMIN ENDPOINTS
// -------------------------------------------------------------

// GET /api/admin/analytics
apiRouter.get('/admin/analytics', authMiddleware, roleMiddleware(['ADMIN']), (req: Request, res: Response) => {
  try {
    const analytics = db.getAdminAnalytics();
    return res.json(analytics);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch admin analytics' });
  }
});

// GET /api/admin/bookings
apiRouter.get('/admin/bookings', authMiddleware, roleMiddleware(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    const bookings = db.getBookings({
      status: status as any,
      search: search as string,
    });
    return res.json(bookings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch admin bookings' });
  }
});

// GET /api/admin/providers
apiRouter.get('/admin/providers', authMiddleware, roleMiddleware(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, area, city, verificationStatus, search } = req.query;
    const providers = db.getProviders({
      category: category as string,
      area: area as string,
      city: city as string,
      verificationStatus: verificationStatus as any,
      search: search as string,
    });
    return res.json(providers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch admin providers' });
  }
});

// PUT /api/admin/providers/:id/verify
apiRouter.put('/admin/providers/:id/verify', authMiddleware, roleMiddleware(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = req.body.verificationStatus || req.body.status;
    if (!status) {
      return res.status(400).json({ error: 'Verification status is required' });
    }
    const updated = db.updateProviderStatus(req.params.id, status as VerificationStatus);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update provider verification status' });
  }
});

// POST /api/admin/services
apiRouter.post('/admin/services', authMiddleware, roleMiddleware(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, description, iconName, basePrice, categoryGroup, popular, isActive } = req.body;
    if (!name || !basePrice) {
      return res.status(400).json({ error: 'Name and base price are required' });
    }

    const newService = db.createService({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description: description || '',
      iconName: iconName || 'Wrench',
      basePrice: Number(basePrice),
      categoryGroup: categoryGroup || 'General Service',
      popular: Boolean(popular),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return res.status(201).json(newService);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create service' });
  }
});

// PUT /api/admin/services/:id
apiRouter.put('/admin/services/:id', authMiddleware, roleMiddleware(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateService(req.params.id, req.body);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update service' });
  }
});

// DELETE /api/admin/services/:id
apiRouter.delete('/admin/services/:id', authMiddleware, roleMiddleware(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const deactivated = db.deleteService(req.params.id);
    return res.json(deactivated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete service' });
  }
});

// -------------------------------------------------------------
// ADMIN REGISTRATION CODE ENDPOINTS (4-digit, 5-min rotation)
// -------------------------------------------------------------
// GET /api/admin/registration-code
apiRouter.get('/admin/registration-code', authMiddleware, roleMiddleware(['ADMIN']), (req: Request, res: Response) => {
  try {
    const status = registrationCodeManager.getStatus();
    return res.json(status);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch registration code' });
  }
});

// POST /api/admin/registration-code/regenerate
apiRouter.post('/admin/registration-code/regenerate', authMiddleware, roleMiddleware(['ADMIN']), (req: Request, res: Response) => {
  try {
    const status = registrationCodeManager.regenerate();
    return res.json(status);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to regenerate registration code' });
  }
});

// GET /api/admin/customers
apiRouter.get('/admin/customers', authMiddleware, roleMiddleware(['ADMIN']), (req: Request, res: Response) => {
  try {
    const allUsers = db.getUsers().filter((u) => u.role === 'CUSTOMER');
    const enriched = allUsers.map((u) => {
      const userBookings = db.getBookings({ customerId: u.id });
      const completed = userBookings.filter((b) => b.status === 'COMPLETED');
      const totalSpent = completed.reduce((sum, b) => sum + b.totalAmount, 0);
      return {
        ...u,
        totalBookings: userBookings.length,
        completedBookings: completed.length,
        totalSpent,
      };
    });
    return res.json(enriched);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch customers' });
  }
});

// PUT /api/admin/customers/:id/status
apiRouter.put('/admin/customers/:id/status', authMiddleware, roleMiddleware(['ADMIN']), (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    const updated = db.updateUserStatus(req.params.id, Boolean(isActive));
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update customer status' });
  }
});

// GET /api/admin/commissions
apiRouter.get('/admin/commissions', authMiddleware, roleMiddleware(['ADMIN']), (req: Request, res: Response) => {
  try {
    const commissions = db.getCommissions();
    return res.json(commissions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch commissions' });
  }
});

// GET /api/public/merchant-config (Public endpoint for UPI QR Card and checkout)
apiRouter.get('/public/merchant-config', (req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    return res.json({
      merchantPhotoUrl: settings.merchantPhotoUrl ?? null,
      merchantPayeeName: settings.merchantPayeeName || 'Ravi Kumar',
      merchantUpiId: settings.merchantUpiId || 'ravikanhauli91@ptyes',
      merchantVerified: settings.merchantVerified !== false,
      platformFee: settings.platformFee || 49,
      supportPhone: settings.supportPhone || '+91 98290 12345',
      supportEmail: settings.supportEmail || 'support@sevaconnect.in',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch merchant configuration' });
  }
});

// GET /api/admin/settings
apiRouter.get('/admin/settings', (req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    return res.json(settings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch settings' });
  }
});

// PUT /api/admin/settings
apiRouter.put('/admin/settings', authMiddleware, roleMiddleware(['ADMIN']), (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update settings' });
  }
});

// PUT /api/admin/merchant-config (Quick update for merchant photo, payee name, upi ID)
apiRouter.put('/admin/merchant-config', authMiddleware, roleMiddleware(['ADMIN']), (req: Request, res: Response) => {
  try {
    const { merchantPhotoUrl, merchantPayeeName, merchantUpiId, merchantVerified } = req.body;
    const updateData: any = {};
    if (merchantPhotoUrl !== undefined) updateData.merchantPhotoUrl = merchantPhotoUrl;
    if (merchantPayeeName !== undefined) updateData.merchantPayeeName = merchantPayeeName;
    if (merchantUpiId !== undefined) updateData.merchantUpiId = merchantUpiId;
    if (merchantVerified !== undefined) updateData.merchantVerified = merchantVerified;

    const updated = db.updateSettings(updateData);
    return res.json({
      success: true,
      message: 'Merchant profile and photo updated successfully',
      settings: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update merchant configuration' });
  }
});

// -------------------------------------------------------------
// UPI PAYMENTS & VERIFICATION ENDPOINTS
// -------------------------------------------------------------

// POST /api/payments/submit
// Customer submits payment details and UTR after completing scan & pay
apiRouter.post('/payments/submit', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      bookingId,
      bookingCode,
      serviceOrPlan,
      amount,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      utr,
      screenshotUrl,
    } = req.body;

    const resolvedCustomerId = req.user?.userId || customerId || 'guest-cust';

    if (!utr || !utr.trim()) {
      return res.status(400).json({ error: 'UTR / Transaction ID is required.' });
    }

    const payment = db.submitPayment({
      bookingId,
      bookingCode,
      serviceOrPlan,
      amount,
      customerId: resolvedCustomerId,
      customerName: req.user?.email || customerName,
      customerEmail: req.user?.email || customerEmail,
      customerPhone,
      utr,
      screenshotUrl,
    });

    return res.status(201).json({
      success: true,
      message: 'Payment submitted for verification successfully.',
      payment,
    });
  } catch (error: any) {
    const status = error.message && error.message.includes('already been submitted') ? 400 : 400;
    return res.status(status).json({ error: error.message || 'Payment submission failed.' });
  }
});

// GET /api/payments/my-payments
// Customer fetches their own payment records
apiRouter.get('/payments/my-payments', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const payments = db.getPaymentsByCustomerId(req.user!.userId);
    return res.json({ payments });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch customer payments.' });
  }
});

// GET /api/payments/:id
apiRouter.get('/payments/:id', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const payment = db.getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found.' });
    }
    // Security check: only owner or admin can view
    if (req.user && req.user.role !== 'ADMIN' && req.user.userId !== payment.customerId) {
      return res.status(403).json({ error: 'Unauthorized to view this payment.' });
    }
    return res.json({ payment });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve payment details.' });
  }
});

// GET /api/admin/payments
// Super Admin fetches payments list + statistics with filtering
apiRouter.get('/admin/payments', authMiddleware, roleMiddleware(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search, service, startDate, endDate, customer, utr, bookingId } = req.query;
    const result = db.getAllPayments({
      status: status as string,
      search: search as string,
      service: service as string,
      startDate: startDate as string,
      endDate: endDate as string,
      customer: customer as string,
      utr: utr as string,
      bookingId: bookingId as string,
    });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch admin payment records.' });
  }
});

// POST /api/admin/payments/:id/verify
// Super Admin marks payment as VERIFIED / PAID
apiRouter.post('/admin/payments/:id/verify', authMiddleware, roleMiddleware(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { adminRemarks } = req.body;
    const adminId = req.user?.userId || 'admin';
    const adminUser = db.getUserById(adminId);
    const adminName = adminUser?.name || 'Super Administrator';

    const updatedPayment = db.verifyPayment(req.params.id, adminId, adminName, adminRemarks);
    return res.json({
      success: true,
      message: 'Payment verified and marked as PAID successfully.',
      payment: updatedPayment,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to verify payment.' });
  }
});

// POST /api/admin/payments/:id/reject
// Super Admin marks payment as REJECTED with reason
apiRouter.post('/admin/payments/:id/reject', authMiddleware, roleMiddleware(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { rejectionReason, adminRemarks } = req.body;
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required.' });
    }

    const adminId = req.user?.userId || 'admin';
    const adminUser = db.getUserById(adminId);
    const adminName = adminUser?.name || 'Super Administrator';

    const updatedPayment = db.rejectPayment(req.params.id, adminId, adminName, rejectionReason, adminRemarks);
    return res.json({
      success: true,
      message: 'Payment rejected successfully.',
      payment: updatedPayment,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to reject payment.' });
  }
});
