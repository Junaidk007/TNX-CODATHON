import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { BlockedUserNotice } from '../BlockedUserNotice';

export function ProtectedRoute({ children, requiredRole }) {
  const {
    isAuthReady,
    isSignedIn,
    userProfile,
    role,
    blockedEmail,
    login,
  } = useAuthContext();

  // 1. Session verification in-flight: Show HUD telemetry loader without jumping or prompting prematurely
  if (!isAuthReady) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="hud-frame p-8 sm:p-10 text-center max-w-md w-full">
          <div className="eyebrow justify-center">SYS.AUTH TELEMETRY</div>
          <div className="grad-text mono text-lg sm:text-xl font-bold mt-2 tracking-wider">
            VERIFYING CREDENTIALS...
          </div>
          <p className="dim mono text-xs mt-3">
            Connecting to secure event roster &amp; identity registry
          </p>
          <div className="w-full bg-[#161616] border border-[var(--border)] h-1.5 mt-6 overflow-hidden rounded-full">
            <div className="bg-[var(--red2)] h-full animate-pulse w-3/4 rounded-full" />
          </div>
          <div className="mono dim text-[10px] mt-4 tracking-widest uppercase">
            [ TNX · CODATHON · SECURE LINK ]
          </div>
        </div>
      </div>
    );
  }

  // 2. Unregistered email blocked notice
  if (blockedEmail) {
    return (
      <div className="wrap py-12">
        <BlockedUserNotice userEmail={blockedEmail} onBack={() => window.history.back()} />
      </div>
    );
  }

  // 3. User is not logged in: show in-theme authentication request
  if (!isSignedIn) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-6">
        <div className="hud-frame p-8 sm:p-12 text-center max-w-lg w-full">
          <div className="eyebrow justify-center">AUTHENTICATION REQUIRED</div>
          <h2 className="text-2xl sm:text-3xl font-black mt-3">
            RESTRICTED <span className="grad-text">ZONE</span>
          </h2>
          <p className="dim text-sm mt-3 leading-relaxed">
            {requiredRole === 'admin'
              ? 'Access to the Organizer Console requires an authenticated admin session.'
              : 'Access to your team roster and deck submission portal requires sign-in with your registered email.'}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => login()} className="btn btn-primary w-full sm:w-auto">
              Sign In With Email →
            </button>
            <Link to="/" className="btn btn-ghost w-full sm:w-auto">
              Back to Home
            </Link>
          </div>
          <div className="mono dim text-[10px] mt-6 tracking-wider">
            [ ONLY PRE-REGISTERED FINALISTS & ORGANIZERS HAVE ACCESS ]
          </div>
        </div>
      </div>
    );
  }

  // 4. Role restriction: e.g. participant trying to view admin
  if (requiredRole === 'admin' && role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="hud-frame p-8 sm:p-10 max-w-lg text-center w-full">
          <div className="eyebrow justify-center" style={{ color: 'var(--red2)' }}>
            ACCESS RESTRICTED
          </div>
          <h2 className="text-2xl font-black mt-2">ADMIN PRIVILEGES REQUIRED</h2>
          <p className="dim text-sm mt-3 leading-relaxed">
            Your account ({userProfile?.email}) is registered with role{' '}
            <strong className="text-white uppercase font-bold">{role || 'PARTICIPANT'}</strong>.
            The Admin Console is reserved for hackathon organizers.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/my-team" className="btn btn-primary">
              Go to My Team Portal →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
