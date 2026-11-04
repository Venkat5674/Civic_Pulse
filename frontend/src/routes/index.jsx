import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { ExplorePage } from '../pages/public/ExplorePage';
import { IssueMapPage } from '../pages/public/IssueMapPage';
import { IssueDetailPage } from '../pages/public/IssueDetailPage';
import { GuestPage } from '../pages/public/GuestPage';
import { GuestDashboardPage } from '../pages/public/GuestDashboardPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { GuestLoginPage } from '../pages/auth/GuestLoginPage';
import { GuestRegisterPage } from '../pages/auth/GuestRegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { UnauthorizedPage } from '../pages/auth/UnauthorizedPage';
import { NotFoundPage } from '../pages/auth/NotFoundPage';

// Citizen Pages
import { CitizenDashboardPage } from '../pages/citizen/CitizenDashboardPage';
import { ReportIssuePage } from '../pages/citizen/ReportIssuePage';
import { MyIssuesPage } from '../pages/citizen/MyIssuesPage';
import { NotificationsPage } from '../pages/citizen/NotificationsPage';
import { ProfilePage } from '../pages/citizen/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminIssuesPage } from '../pages/admin/AdminIssuesPage';
import { AdminIssueReviewPage } from '../pages/admin/AdminIssueReviewPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminAnalyticsPage } from '../pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

// Route Guards
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { useAuth } from '../context/AuthContext';

function DashboardRouteWrapper() {
  const { user } = useAuth();
  if (!user || user.role === 'GUEST') {
    return <GuestDashboardPage />;
  }
  if (user.role === 'ADMIN') {
    return <AdminDashboardPage />;
  }
  return <CitizenDashboardPage />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public & Guest Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/guest" element={<GuestPage />} />
      <Route path="/guest-dashboard" element={<GuestDashboardPage />} />
      <Route path="/map" element={<IssueMapPage />} />
      <Route path="/issues/:id" element={<IssueDetailPage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/guest-login" element={<GuestLoginPage />} />
      <Route path="/guest-register" element={<GuestRegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/403" element={<UnauthorizedPage />} />

      {/* Dashboard Route (Handles Citizen or Guest dynamically) */}
      <Route path="/dashboard" element={<DashboardRouteWrapper />} />
      <Route
        path="/report"
        element={
          <ProtectedRoute>
            <ReportIssuePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-issues"
        element={
          <ProtectedRoute>
            <MyIssuesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/issues"
        element={
          <AdminRoute>
            <AdminIssuesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/review/:id"
        element={
          <AdminRoute>
            <AdminIssueReviewPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminRoute>
            <AdminCategoriesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AdminRoute>
            <AdminAnalyticsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminSettingsPage />
          </AdminRoute>
        }
      />

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
