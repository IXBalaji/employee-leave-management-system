import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { EmployeeListPage } from './features/employees/EmployeeListPage';
import { EmployeeCreatePage } from './features/employees/EmployeeCreatePage';
import { EmployeeDetailPage } from './features/employees/EmployeeDetailPage';
import { MyProfileRedirect } from './features/employees/MyProfileRedirect';
import { TeamPage } from './features/employees/TeamPage';
import { ApplyLeavePage } from './features/leave/ApplyLeavePage';
import { LeaveHistoryPage } from './features/leave/LeaveHistoryPage';
import { ApprovalsPage } from './features/leave/ApprovalsPage';
import { HolidayCalendarPage } from './features/leave/HolidayCalendarPage';
import { DepartmentsPage } from './features/admin/DepartmentsPage';
import { LeavePoliciesPage } from './features/admin/LeavePoliciesPage';
import { HolidaysPage } from './features/admin/HolidaysPage';

function AccessibilityBugDemo() {
  return (
    <div style={{ padding: '2rem', display: 'grid', gap: '1rem' }}>
      <h1>Accessibility regression demo</h1>
      <img src="placeholder-image.png" />
      <button type="button"></button>
      <a href="#"></a>
      <input id="unlabeled-input" type="text" />
      <p className="low-contrast" style={{ color: '#9b9b9b' }}>
        This text has insufficient contrast.
      </p>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AccessibilityBugDemo />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<MyProfileRedirect />} />
            <Route
              path="/employees"
              element={
                <ProtectedRoute roles={['HR', 'ADMIN']}>
                  <EmployeeListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees/new"
              element={
                <ProtectedRoute roles={['HR', 'ADMIN']}>
                  <EmployeeCreatePage />
                </ProtectedRoute>
              }
            />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            <Route
              path="/team"
              element={
                <ProtectedRoute roles={['MANAGER', 'HR', 'ADMIN']}>
                  <TeamPage />
                </ProtectedRoute>
              }
            />
            <Route path="/leave/apply" element={<ApplyLeavePage />} />
            <Route path="/leave/history" element={<LeaveHistoryPage />} />
            <Route
              path="/leave/approvals"
              element={
                <ProtectedRoute roles={['MANAGER', 'HR', 'ADMIN']}>
                  <ApprovalsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/leave/calendar" element={<HolidayCalendarPage />} />
            <Route
              path="/admin/departments"
              element={
                <ProtectedRoute roles={['HR', 'ADMIN']}>
                  <DepartmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leave-policies"
              element={
                <ProtectedRoute roles={['HR', 'ADMIN']}>
                  <LeavePoliciesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/holidays"
              element={
                <ProtectedRoute roles={['HR', 'ADMIN']}>
                  <HolidaysPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
