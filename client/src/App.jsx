import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Login from './pages/auth/login';
import BaseLayout from './components/layouts/BaseLayout';
import Dashboard from './components/dashboard/DashboardComponent';
import Properties from './pages/admin/PropertiesPage';
import UsersPage from './pages/admin/Users.page.jsx';
import TenantsPage from './pages/manager/TenantsPage';
import DocumentPage from './pages/shared/DocumentPage';
import ProtectedRoute from './components/ProtectedRoute';
import PaymentsPage from './pages/shared/PaymentsPage';

// Import shared components
import PageLayoutComponent from './components/layouts/shared/PageLayoutComponent';
import Button from './components/layouts/shared/Button';
import SearchFilterComponent from './components/layouts/shared/SearchFilterComponent';
import Tables from './components/layouts/shared/Tables';
import ConfirmDialog from './components/layouts/shared/ConfirmDialog';
import FormComponent from './components/layouts/shared/forms/FormComponent';
import LoadingSpinner from './components/layouts/shared/LoadingSpinner';

// Placeholder components for routes that haven't been created yet
const Maintenance = () => <div>Maintenance Page</div>;

function App() {
  return (
    <HelmetProvider>
      <Routes>
        {/* Public route: Login */}
        <Route path="/login" element={<Login />} />

        {/* Manager routes */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <BaseLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="documents" element={<DocumentPage role="manager" />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
        
        {/* Tenant routes */}
        <Route
          path="/tenant"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <BaseLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="documents" element={<DocumentPage role="tenant" />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <BaseLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="properties" element={<Properties />} />
          <Route path="documents" element={<DocumentPage role="admin" />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HelmetProvider>
  );
}

export default App;
