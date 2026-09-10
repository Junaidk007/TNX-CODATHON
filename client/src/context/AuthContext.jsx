import React, { createContext, useContext, useState, useEffect, useCallback, useTransition } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { apiRequest, setAuthTokenGetter } from '../services/api';

const AuthContext = createContext(null);

const CACHE_PROFILE_KEY = 'tnx_user_profile_cache';
const CACHE_TOKEN_KEY = 'tnx_clerk_token';

function getCachedProfile() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const { user, isSignedIn, isLoaded: isClerkLoaded } = useUser();
  const { getToken } = useAuth();
  const { openSignIn, signOut } = useClerk();

  const [userProfile, setUserProfile] = useState(() => getCachedProfile());
  const [clerkToken, setClerkToken] = useState(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(CACHE_TOKEN_KEY);
  });
  const [blockedEmail, setBlockedEmail] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Hook global token retriever into apiRequest
  useEffect(() => {
    setAuthTokenGetter(async () => {
      try {
        const t = await getToken();
        if (t) {
          sessionStorage.setItem(CACHE_TOKEN_KEY, t);
          setClerkToken(t);
        }
        return t;
      } catch {
        return sessionStorage.getItem(CACHE_TOKEN_KEY);
      }
    });
  }, [getToken]);

  const refreshProfile = useCallback(async () => {
    if (!isSignedIn) {
      setUserProfile(null);
      setClerkToken(null);
      setBlockedEmail(null);
      sessionStorage.removeItem(CACHE_PROFILE_KEY);
      sessionStorage.removeItem(CACHE_TOKEN_KEY);
      return null;
    }

    setProfileLoading(true);
    setBlockedEmail(null);

    try {
      const token = await getToken();
      if (token) {
        sessionStorage.setItem(CACHE_TOKEN_KEY, token);
        setClerkToken(token);
      }

      const profile = await apiRequest('/users/me', { token });
      setUserProfile(profile);
      sessionStorage.setItem(CACHE_PROFILE_KEY, JSON.stringify(profile));
      return profile;
    } catch (err) {
      console.error('[AuthContext] Failed to resolve user profile:', err);
      if (err.status === 403 || err.code === 'EMAIL_NOT_REGISTERED') {
        const detectedEmail =
          user?.primaryEmailAddress?.emailAddress ||
          user?.emailAddresses?.[0]?.emailAddress ||
          'your email';
        setBlockedEmail(detectedEmail);
      }
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, [isSignedIn, getToken, user]);

  useEffect(() => {
    if (!isClerkLoaded) return;

    if (isSignedIn) {
      refreshProfile();
    } else {
      setUserProfile(null);
      setClerkToken(null);
      setBlockedEmail(null);
      sessionStorage.removeItem(CACHE_PROFILE_KEY);
      sessionStorage.removeItem(CACHE_TOKEN_KEY);
    }
  }, [isClerkLoaded, isSignedIn, refreshCount, refreshProfile]);

  const login = useCallback((redirectUrl) => {
    if (typeof openSignIn === 'function') {
      openSignIn({
        afterSignInUrl: redirectUrl || window.location.pathname,
        afterSignUpUrl: redirectUrl || window.location.pathname,
      });
    }
  }, [openSignIn]);

  const logout = useCallback(async () => {
    sessionStorage.removeItem(CACHE_PROFILE_KEY);
    sessionStorage.removeItem(CACHE_TOKEN_KEY);
    setUserProfile(null);
    setClerkToken(null);
    setBlockedEmail(null);
    if (typeof signOut === 'function') {
      await signOut();
    }
  }, [signOut]);

  // Auth readiness: Clerk has initialized, AND if signed in, profile has either been retrieved or cached
  const isAuthReady = isClerkLoaded && (!isSignedIn || userProfile !== null || blockedEmail !== null || !profileLoading);

  const value = {
    user,
    isSignedIn: Boolean(isSignedIn),
    isClerkLoaded,
    isAuthReady,
    userProfile,
    setUserProfile,
    role: userProfile?.role || null,
    clerkToken,
    blockedEmail,
    profileLoading,
    refreshProfile: () => setRefreshCount((c) => c + 1),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
