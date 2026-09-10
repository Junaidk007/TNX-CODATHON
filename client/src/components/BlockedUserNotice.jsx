import React from 'react';
import { AlertTriangle, Mail, ArrowLeft, LogOut } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';

export const BlockedUserNotice = ({ userEmail, onBack }) => {
  const { signOut } = useClerk();

  const handleSignOut = () => {
    sessionStorage.removeItem('tnx_user_profile_cache');
    sessionStorage.removeItem('tnx_clerk_token');
    if (typeof signOut === 'function') signOut();
    if (onBack) onBack();
  };

  return (
    <div className="max-w-lg w-full mx-auto p-8 bg-[#121212] border border-[var(--border)] hud-frame text-center text-neutral-100 shadow-2xl">
      <div className="w-14 h-14 bg-red-950/40 border border-[var(--red2)] text-[var(--red2)] flex items-center justify-center mx-auto mb-5 rounded">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <div className="eyebrow justify-center" style={{ color: 'var(--red2)' }}>
        SYS.AUTH REJECTED
      </div>
      <h3 className="text-2xl font-black uppercase text-white mb-2">Email Not Registered</h3>
      <p className="dim text-sm mb-6 leading-relaxed">
        The email <span className="text-white font-bold">{userEmail || 'you logged in with'}</span> is
        not currently associated with any confirmed finalist or wildcard team for TNX Codathon 2K26.
      </p>

      <div className="p-4 bg-black/60 border border-[var(--border)] text-left text-xs space-y-2 mb-6 rounded">
        <div className="font-bold text-white flex items-center gap-1.5 mono text-[11px]">
          <Mail className="w-3.5 h-3.5 text-[var(--red2)]" />
          <span>RESOLUTION PROTOCOL:</span>
        </div>
        <p className="dim">1. Contact the TechNeekX team at <strong>teamtechneekx@gmail.com</strong>.</p>
        <p className="dim">2. If your team leader provided a different email on Unstop, contact organizers to sync your profile.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleSignOut}
          className="btn btn-ghost text-xs inline-flex items-center justify-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
        {onBack && (
          <button
            onClick={onBack}
            className="btn btn-primary text-xs inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </button>
        )}
      </div>
    </div>
  );
};
