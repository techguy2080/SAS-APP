import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';

import PageLayout from '../../components/layouts/shared/PageLayoutComponent';
import Card from '../../components/layouts/shared/Card';

// SVG icon replacements
const UserIcon = () => (
  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a7.5 7.5 0 0113 0" />
  </svg>
);
const ToolIcon = () => (
  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M14.7 6.3a5 5 0 01-7.07 7.07l-3.54 3.54a2 2 0 102.83 2.83l3.54-3.54a5 5 0 017.07-7.07z" />
  </svg>
);
const HomeIcon = () => (
  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M3 9.75V19a2 2 0 002 2h3v-7h4v7h3a2 2 0 002-2V9.75M9 22V12h6v10" />
  </svg>
);
const DollarIcon = () => (
  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H7" />
  </svg>
);

const DEEP_BLUE = '#0052CC';
const DARK_TEXT = '#24292e';

// Example: Fetch dashboard stats with React Query (replace with your API endpoints)
const fetchDashboardStats = async () => {
  // Replace with your API call
  return {
    tenants: 48,
    maintenance: 7,
    vacant: 5,
    revenue: 24500
  };
};

const ManagerDashboard = () => {
  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ['manager-dashboard-stats'],
    queryFn: fetchDashboardStats
  });

  return (
    <>
      <Helmet>
        <title>Manager Dashboard | Kidega Apartments</title>
        <meta name="description" content="Property manager dashboard for monitoring tenants, maintenance, and revenue." />
      </Helmet>

      <PageLayout
        title="Dashboard"
        containerStyle={{ maxWidth: 1400 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dashboard-card">
            <div className="flex items-center gap-4">
              <UserIcon />
              <div>
                <div className="text-gray-500 text-sm">Active Tenants</div>
                <div className="text-2xl font-bold" style={{ color: DEEP_BLUE }}>
                  {isLoading ? '...' : stats.tenants}
                  <span className="ml-2 text-base text-gray-400">Tenants</span>
                </div>
                <div className="stat-label">Current tenants</div>
              </div>
            </div>
          </Card>
          <Card className="dashboard-card">
            <div className="flex items-center gap-4">
              <ToolIcon />
              <div>
                <div className="text-gray-500 text-sm">Maintenance Requests</div>
                <div className="text-2xl font-bold" style={{ color: DEEP_BLUE }}>
                  {isLoading ? '...' : stats.maintenance}
                  <span className="ml-2 text-base text-gray-400">Pending</span>
                </div>
                <div className="stat-label">Pending requests</div>
              </div>
            </div>
          </Card>
          <Card className="dashboard-card">
            <div className="flex items-center gap-4">
              <HomeIcon />
              <div>
                <div className="text-gray-500 text-sm">Vacant Units</div>
                <div className="text-2xl font-bold" style={{ color: DEEP_BLUE }}>
                  {isLoading ? '...' : stats.vacant}
                  <span className="ml-2 text-base text-gray-400">Units</span>
                </div>
                <div className="stat-label">Available for rent</div>
              </div>
            </div>
          </Card>
          <Card className="dashboard-card">
            <div className="flex items-center gap-4">
              <DollarIcon />
              <div>
                <div className="text-gray-500 text-sm">This Month's Revenue</div>
                <div className="text-2xl font-bold" style={{ color: DEEP_BLUE }}>
                  {isLoading ? '...' : `$${stats.revenue?.toLocaleString()}`}
                  <span className="ml-2 text-base text-gray-400">USD</span>
                </div>
                <div className="stat-label">From rent collection</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Additional dashboard content can go here */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <Card
              title="Recent Activity"
              bordered={false}
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
            >
              <p>Recent tenant activities and updates will appear here.</p>
              {/* You could add a timeline or activity feed component here */}
            </Card>
          </div>
          <div>
            <Card
              title="Quick Actions"
              bordered={false}
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
            >
              <p>Common tasks and shortcuts will appear here.</p>
              {/* You could add action buttons here */}
            </Card>
          </div>
        </div>

        <style jsx>{`
          .stat-label {
            color: #6b7280;
            font-size: 0.875rem;
            margin-top: 8px;
          }
          .dashboard-card {
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            cursor: pointer;
            border-radius: 0.75rem;
            padding: 1.5rem;
            background: #fff;
          }
          .dashboard-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
          }
        `}</style>
      </PageLayout>
    </>
  );
};

export default ManagerDashboard;