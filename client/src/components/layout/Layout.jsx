import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      {/* Ambient background animations */}
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="bg-scan" />

      {/* Navigation */}
      <Navbar />

      {/* Main Routed Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
