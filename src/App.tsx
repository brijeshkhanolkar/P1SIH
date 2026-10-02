import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './lib/store';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InstrumentsPage from './pages/InstrumentsPage';
import InstrumentProfilePage from './pages/InstrumentProfilePage';
import TestPlansPage from './pages/TestPlansPage';
import TestingPage from './pages/TestingPage';
import TestExecutionPage from './pages/TestExecutionPage';
import ReportsPage from './pages/ReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';
import RepositoryPage from './pages/RepositoryPage';
import AuditPage from './pages/AuditPage';
import UsersPage from './pages/UsersPage';
import RulesPage from './pages/RulesPage';
import SettingsPage from './pages/SettingsPage';
import type { UserRole } from './types';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const currentUser = useAppStore(s => s.currentUser);
  if (!currentUser || !roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  const isAuthenticated = useAppStore(s => s.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="instruments" element={<InstrumentsPage />} />
          <Route path="instruments/:id" element={<InstrumentProfilePage />} />
          <Route path="test-plans" element={<TestPlansPage />} />
          <Route path="testing" element={<TestingPage />} />
          <Route path="testing/:sessionId" element={<TestExecutionPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/:id" element={<ReportDetailPage />} />
          <Route path="repository" element={<RepositoryPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="users" element={<RoleRoute roles={['admin']}><UsersPage /></RoleRoute>} />
          <Route path="rules" element={<RulesPage />} />
          <Route path="settings" element={<RoleRoute roles={['admin']}><SettingsPage /></RoleRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
