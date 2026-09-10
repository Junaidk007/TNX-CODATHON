import { clerkMiddleware, getAuth, clerkClient } from '@clerk/express';
import { User } from '../models/User.js';

/**
 * Middleware to verify Clerk authentication and associate request with MongoDB User.
 */
export const requireAuth = async (req, res, next) => {
  try {
    // 1. Dev / Test Mode fallback if Clerk keys are missing and header provided in development
    if (
      process.env.NODE_ENV !== 'production' &&
      (!process.env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY.startsWith('sk_test_...'))
    ) {
      const devEmail = req.headers['x-dev-user-email'] || 'admin@techneekx.com';
      let user = await User.findOne({ email: devEmail.toLowerCase().trim() });

      if (!user) {
        if (devEmail === 'admin@techneekx.com') {
          user = await User.create({
            name: 'TechNeekX Admin',
            email: 'admin@techneekx.com',
            role: 'admin',
            isActivated: true,
          });
        } else {
          return res.status(403).json({
            error: 'EMAIL_NOT_REGISTERED',
            message: "Your email isn't registered. Contact organizers.",
          });
        }
      }

      req.user = user;
      return next();
    }

    // 2. Production / Real Clerk Verification
    const auth = getAuth(req);

    if (!auth || !auth.userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication session is missing or invalid.',
      });
    }

    // First try finding user by clerkId directly
    let user = await User.findOne({ clerkId: auth.userId });

    if (!user) {
      // If not yet linked by clerkId, retrieve verified email from Clerk SDK
      let userEmail = auth.sessionClaims?.email || auth.sessionClaims?.primary_email;

      if (!userEmail) {
        try {
          const clerkUser = await clerkClient.users.getUser(auth.userId);
          const primaryId = clerkUser.primaryEmailAddressId;
          const matchedEmailObj = clerkUser.emailAddresses?.find((e) => e.id === primaryId);
          userEmail = matchedEmailObj?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;
        } catch (fetchErr) {
          console.error('Error fetching email from Clerk API:', fetchErr);
        }
      }

      if (userEmail) {
        user = await User.findOne({ email: userEmail.toLowerCase().trim() });
        if (user) {
          user.clerkId = auth.userId;
          user.isActivated = true;
          await user.save();
          console.log(`🔗 Successfully auto-linked Clerk ID ${auth.userId} with preloaded User: ${user.email} (${user.role})`);
        }
      }
    }

    if (!user) {
      return res.status(403).json({
        error: 'EMAIL_NOT_REGISTERED',
        message: "Your email isn't registered. Contact organizers.",
      });
    }

    // Attach MongoDB user entity to request
    req.user = user;
    req.auth = auth;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify user authorization.',
    });
  }
};
