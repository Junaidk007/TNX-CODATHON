import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { Menu, X, Flame, Shield, ArrowRight, LogOut } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn, userProfile, role, login, logout } = useAuthContext();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Timeline', path: '/timeline' },
    { label: 'Teams', path: '/teams' },
    { label: 'Contact', path: '/contact' },
  ];

  const teamName = userProfile?.teamId?.teamName || userProfile?.teamName || '';

  // Dynamic telemetry status line based on authentication role
  let hudStatus = (
    <>
      SYS.STATUS: <span className="live">REGISTRATION CLOSED — 38 TEAMS CONFIRMED</span>
    </>
  );

  if (isSignedIn && userProfile) {
    if (role === 'admin') {
      hudStatus = (
        <>
          SYS.STATUS: <span className="live">ADMIN SESSION — FULL ACCESS</span>
        </>
      );
    } else if (teamName) {
      hudStatus = (
        <>
          SYS.STATUS: <span className="live">AUTHENTICATED — TEAM: {teamName.toUpperCase()} · ROLE: {role?.toUpperCase()}</span>
        </>
      );
    } else {
      hudStatus = (
        <>
          SYS.STATUS: <span className="live">AUTHENTICATED — {userProfile.name?.toUpperCase()}</span>
        </>
      );
    }
  }

  return (
    <>
      {/* Top HUD Bar */}
      <div className="hud-bar">
        <div className="wrap">
          {[0, 1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <span>{hudStatus}</span>
              <span className="dot">•</span>
              <span>REGN.MODE: OFFLINE @ AIMT, LUCKNOW</span>
              <span className="dot">•</span>
              <span>ORGANIZED BY TECHNEEKX · POWERED BY UNSTOP</span>
              <span className="dot">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <header className="nav">
        <div className="wrap nav-inner">
          {/* Brand */}
          <Link to="/" className="brand min-w-0" onClick={() => setMobileOpen(false)}>
            <img src="/logo.png" alt="TNX Codathon logo" className="shrink-0" />
            <span className="brand-text">
              <span className="name text-sm sm:text-base">
                TNX <span className="x">CODATHON</span> 2K26
              </span>
              <span className="org text-[9px] sm:text-[9.5px]">ORGANIZED BY TECHNEEKX</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="navlinks">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={isActive ? 'active' : ''}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Nav CTA / Auth */}
          <div className="nav-cta shrink-0">
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex flex-col items-end text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    {userProfile?.name || 'Authenticated'}
                  </span>
                  <span className="text-[10px] mono text-[var(--red2)] font-bold tracking-widest uppercase">
                    {role === 'admin' ? 'ORGANIZER / ADMIN' : `${teamName || 'PARTICIPANT'} [${role?.toUpperCase() || 'MEMBER'}]`}
                  </span>
                </div>

                {role === 'admin' ? (
                  <Link to="/admin" className="btn btn-primary text-xs py-1.5 px-4 hidden md:inline-flex">
                    Admin Console
                  </Link>
                ) : (
                  <Link to="/my-team" className="btn btn-primary text-xs py-1.5 px-4 hidden md:inline-flex">
                    My Team
                  </Link>
                )}

                <div className="border-l border-[var(--border)] pl-2 flex items-center gap-2">
                  <UserButton afterSignOutUrl="/" />
                  <button
                    onClick={() => logout()}
                    className="btn btn-ghost text-xs py-1.5 px-3 text-neutral-300 hover:text-white inline-flex items-center gap-1.5"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[var(--red2)]" />
                    <span className="hidden xl:inline">Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/my-team" className="btn btn-primary hidden md:inline-flex">
                  My Team
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-neutral-300 hover:text-white shrink-0 ml-1"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X className="w-5 h-5 text-[var(--red2)]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[var(--border)] bg-[#0c0c0c] px-6 py-5 space-y-4">
            <div className="flex flex-col space-y-3 mono text-sm uppercase" style={{
              gap: '1rem',
              padding: '1rem'
            }}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`py-1.5 transition-colors ${isActive ? 'text-[var(--red2)] font-bold' : 'text-neutral-400 hover:text-white'}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-3">
              {isSignedIn ? (
                <>
                  <div className="text-xs text-neutral-400 mono">
                    Logged in as <strong className="text-white">{userProfile?.name || 'User'}</strong> ({role || 'Session Active'})
                  </div>
                  <Link
                    to={role === 'admin' ? '/admin' : '/my-team'}
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-primary w-full text-center"
                  >
                    Open {role === 'admin' ? 'Admin Portal' : 'My Team Portal'} →
                  </Link>
                  <button
                    onClick={async () => {
                      setMobileOpen(false);
                      await logout();
                    }}
                    className="btn btn-ghost w-full text-center text-xs text-red-400 flex items-center justify-center gap-2 py-2.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/my-team"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-primary w-full text-center"
                >
                  Sign In / My Team →
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
