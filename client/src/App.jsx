import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { TimelinePage } from './pages/TimelinePage';
import { TeamsPage } from './pages/TeamsPage';
import { ContactPage } from './pages/ContactPage';
import { MyTeamPage } from './pages/MyTeamPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Landing & Information Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Protected Portals */}
        <Route
          path="/my-team"
          element={
            <ProtectedRoute>
              <MyTeamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Legacy .html route redirects */}
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/about.html" element={<Navigate to="/about" replace />} />
        <Route path="/timeline.html" element={<Navigate to="/timeline" replace />} />
        <Route path="/teams.html" element={<Navigate to="/teams" replace />} />
        <Route path="/contact.html" element={<Navigate to="/contact" replace />} />
        <Route path="/my-team.html" element={<Navigate to="/my-team" replace />} />
        <Route path="/admin.html" element={<Navigate to="/admin" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
