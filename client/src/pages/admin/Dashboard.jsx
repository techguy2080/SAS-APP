import React from 'react';
import { Helmet } from 'react-helmet-async'; // For SEO and document head management
import DynamicDashboard from '../../components/dashboard/DashboardComponent';

/**
 * Admin Dashboard Page
 * Leverages the shared dashboard component with role-specific rendering
 */
const AdminDashboard = () => {
  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Kidega Apartments</title>
        <meta name="description" content="Admin dashboard for Kidega Apartments management system" />
      </Helmet>

      {/* The DynamicDashboard component will automatically render the admin view */}
      <DynamicDashboard />
    </>
  );
};

export default AdminDashboard;