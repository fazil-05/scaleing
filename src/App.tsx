// src/App.tsx
// Main application router with protected routes and role guards — Clean Light Theme

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import type { UserRole } from './types';

// Lazy loaded page components
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const CompanyDashboard = lazy(() => import('./pages/dashboards/CompanyDashboard').then(m => ({ default: m.CompanyDashboard })));
const SuperAdminDashboard = lazy(() => import('./pages/dashboards/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const DirectorDashboard = lazy(() => import('./pages/dashboards/DirectorDashboard').then(m => ({ default: m.DirectorDashboard })));
const BranchManagerDashboard = lazy(() => import('./pages/dashboards/BranchManagerDashboard').then(m => ({ default: m.BranchManagerDashboard })));
const EmployeeDashboard = lazy(() => import('./pages/dashboards/EmployeeDashboard').then(m => ({ default: m.EmployeeDashboard })));

const EmployeesPage = lazy(() => import('./pages/employees/EmployeesPage').then(m => ({ default: m.EmployeesPage })));
const BranchesPage = lazy(() => import('./pages/branches/BranchesPage').then(m => ({ default: m.BranchesPage })));
const MarkAttendancePage = lazy(() => import('./pages/attendance/MarkAttendancePage').then(m => ({ default: m.MarkAttendancePage })));
const LiveMapPage = lazy(() => import('./pages/attendance/LiveMapPage').then(m => ({ default: m.LiveMapPage })));
const DailyReportPage = lazy(() => import('./pages/reports/DailyReportPage').then(m => ({ default: m.DailyReportPage })));
const TasksPage = lazy(() => import('./pages/tasks/TasksPage').then(m => ({ default: m.TasksPage })));
const SOPLibraryPage = lazy(() => import('./pages/sops/SOPLibraryPage').then(m => ({ default: m.SOPLibraryPage })));
const ResourceCenterPage = lazy(() => import('./pages/resources/ResourceCenterPage').then(m => ({ default: m.ResourceCenterPage })));
const LeaveRequestsPage = lazy(() => import('./pages/leaves/LeaveRequestsPage').then(m => ({ default: m.LeaveRequestsPage })));
const PerformancePage = lazy(() => import('./pages/performance/PerformancePage').then(m => ({ default: m.PerformancePage })));
const CompanySettingsPage = lazy(() => import('./pages/settings/CompanySettingsPage').then(m => ({ default: m.CompanySettingsPage })));
const AIChatPage = lazy(() => import('./pages/chat/AIChatPage').then(m => ({ default: m.AIChatPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-slate-500 text-xs font-semibold">Loading Virtual Manager AI...</p>
    </div>
  </div>
);

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboards/company" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboards/company" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={
        <PublicRoute><Suspense fallback={<PageLoader />}><LoginPage /></Suspense></PublicRoute>
      } />

      {/* Protected App Layout Routes */}
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboards/super-admin" element={<Suspense fallback={<PageLoader />}><SuperAdminDashboard /></Suspense>} />
        <Route path="/dashboards/company" element={<Suspense fallback={<PageLoader />}><CompanyDashboard /></Suspense>} />
        <Route path="/dashboards/director" element={<Suspense fallback={<PageLoader />}><DirectorDashboard /></Suspense>} />
        <Route path="/dashboards/branch" element={<Suspense fallback={<PageLoader />}><BranchManagerDashboard /></Suspense>} />
        <Route path="/dashboards/employee" element={<Suspense fallback={<PageLoader />}><EmployeeDashboard /></Suspense>} />

        <Route path="/employees" element={<Suspense fallback={<PageLoader />}><EmployeesPage /></Suspense>} />
        <Route path="/branches" element={<Suspense fallback={<PageLoader />}><BranchesPage /></Suspense>} />
        <Route path="/attendance/mark" element={<Suspense fallback={<PageLoader />}><MarkAttendancePage /></Suspense>} />
        <Route path="/attendance/live" element={<Suspense fallback={<PageLoader />}><LiveMapPage /></Suspense>} />
        <Route path="/reports/daily" element={<Suspense fallback={<PageLoader />}><DailyReportPage /></Suspense>} />
        <Route path="/reports/audit" element={<Suspense fallback={<PageLoader />}><DailyReportPage /></Suspense>} />
        <Route path="/tasks" element={<Suspense fallback={<PageLoader />}><TasksPage /></Suspense>} />
        <Route path="/sops" element={<Suspense fallback={<PageLoader />}><SOPLibraryPage /></Suspense>} />
        <Route path="/resources" element={<Suspense fallback={<PageLoader />}><ResourceCenterPage /></Suspense>} />
        <Route path="/leaves" element={<Suspense fallback={<PageLoader />}><LeaveRequestsPage /></Suspense>} />
        <Route path="/performance" element={<Suspense fallback={<PageLoader />}><PerformancePage /></Suspense>} />
        <Route path="/chat" element={<Suspense fallback={<PageLoader />}><AIChatPage /></Suspense>} />
        <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><DirectorDashboard /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<PageLoader />}><CompanySettingsPage /></Suspense>} />
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/dashboards/company" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider>
          <AuthProvider>
            <AppRoutes />
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
