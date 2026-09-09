import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { ExplorePage } from '../pages/public/ExplorePage';
import { IssueMapPage } from '../pages/public/IssueMapPage';
import { IssueDetailPage } from '../pages/public/IssueDetailPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
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

// Route Guards
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/map" element={<IssueMapPage />} />
      <Route path="/issues/:id" element={<IssueDetailPage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/403" element={<UnauthorizedPage />} />

      {/* Citizen Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <CitizenDashboardPage />
          </ProtectedRoute>
        }
      />
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

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
