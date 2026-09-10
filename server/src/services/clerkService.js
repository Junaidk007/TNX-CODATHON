import { clerkClient } from '@clerk/express';

/**
 * Ensure a user exists in Clerk's user directory.
 * If user doesn't exist, pre-creates them with verified email so they can
 * directly sign in using Email OTP without getting "Couldn't find your account".
 * 
 * @param {string} email 
 * @param {string} name 
 * @returns {Promise<string|null>} Clerk User ID
 */
export async function ensureClerkUser(email, name = '') {
  if (!process.env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY.startsWith('sk_test_...')) {
    return null;
  }

  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail) return null;

  try {
    // 1. Check if user already exists in Clerk
    const existing = await clerkClient.users.getUserList({ emailAddress: [cleanEmail] });
    if (existing.data && existing.data.length > 0) {
      return existing.data[0].id;
    }

    // 2. Extract first and last name
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] || 'Participant';
    const lastName = parts.slice(1).join(' ') || undefined;

    // 3. Pre-create user in Clerk with verified email and skip password
    const newUser = await clerkClient.users.createUser({
      emailAddress: [cleanEmail],
      firstName,
      lastName,
      skipPasswordRequirement: true,
    });

    console.log(`✅ Pre-created user in Clerk: ${cleanEmail} (${newUser.id})`);
    return newUser.id;
  } catch (err) {
    // If user already exists (race condition or different casing), fetch ID
    if (err.errors && err.errors.some((e) => e.code === 'form_identifier_exists')) {
      try {
        const recheck = await clerkClient.users.getUserList({ emailAddress: [cleanEmail] });
        if (recheck.data && recheck.data.length > 0) {
          return recheck.data[0].id;
        }
      } catch (_) {}
    }
    console.warn(`⚠️ Could not auto-sync ${cleanEmail} to Clerk:`, err.message || err);
    return null;
  }
}
