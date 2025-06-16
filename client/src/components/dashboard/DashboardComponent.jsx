import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../layouts/shared/Button';

// Replace AntD Typography
const Title = ({ level = 2, children }) => {
  const Tag = `h${level}`;
  return <Tag className={`font-bold text-${level === 2 ? '2xl' : 'xl'} mb-2`}>{children}</Tag>;
};
const Text = ({ strong, type, children }) => (
  <span className={`${strong ? 'font-semibold' : ''} ${type === 'secondary' ? 'text-gray-500' : ''}`}>{children}</span>
);

// Simple SVG icon replacements
const UserIcon = () => <svg className="inline w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0113 0" /></svg>;
const HomeIcon = () => <svg className="inline w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 9.75V19a2 2 0 002 2h3v-7h4v7h3a2 2 0 002-2V9.75M9 22V12h6v10" /></svg>;
const ToolIcon = () => <svg className="inline w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M14.7 6.3a5 5 0 01-7.07 7.07l-3.54 3.54a2 2 0 102.83 2.83l3.54-3.54a5 5 0 017.07-7.07z" /></svg>;
const DollarIcon = () => <svg className="inline w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H7" /></svg>;
const FileIcon = () => <svg className="inline w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /></svg>;
const CheckCircleIcon = () => <svg className="inline w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4-4" /></svg>;
const ClockCircleIcon = () => <svg className="inline w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;

const DEEP_BLUE = '#0052CC';
const SUCCESS_GREEN = '#52c41a';
const WARNING_ORANGE = '#faad14';
const SECONDARY_TEXT = 'rgba(0, 0, 0, 0.45)';

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role || 'tenant';

  // Render different dashboard based on user role
  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'tenant':
      return <TenantDashboard />;
    default:
      return <TenantDashboard />;
  }
};

const AdminDashboard = () => {
  // Admin-specific data
  const recentUsers = [
    { id: 1, name: 'John Doe', role: 'tenant', date: '2025-06-01' },
    { id: 2, name: 'Sarah Miller', role: 'manager', date: '2025-05-30' },
    { id: 3, name: 'Robert Johnson', role: 'tenant', date: '2025-05-29' },
  ];
  
  const propertyStats = [
    { name: 'Occupied', value: 85, color: SUCCESS_GREEN },
    { name: 'Vacant', value: 15, color: WARNING_ORANGE },
  ];

  return (
    <div>
      <Title level={2}>Admin Dashboard</Title>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-600">
                <UserIcon />
              </div>
              <div className="ml-4">
                <Text>Total Users</Text>
                <Text strong>{42}</Text>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-600">
                <HomeIcon />
              </div>
              <div className="ml-4">
                <Text>Properties</Text>
                <Text strong>{12}</Text>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-600">
                <ToolIcon />
              </div>
              <div className="ml-4">
                <Text>Maintenance Requests</Text>
                <Text strong>{8}</Text>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-600">
                <DollarIcon />
              </div>
              <div className="ml-4">
                <Text>Monthly Revenue</Text>
                <Text strong>{21350} <span className="text-sm">USD</span></Text>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-center">
              <Text strong>Recent Users</Text>
              <Button type="link">View All</Button>
            </div>
            <div className="mt-4">
              {recentUsers.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center">
                    <div className="text-blue-600">
                      <UserIcon />
                    </div>
                    <div className="ml-3">
                      <Text strong>{item.name}</Text>
                      <Text type="secondary">Added on {item.date}</Text>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.role === 'tenant' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      {item.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white shadow rounded-lg p-4">
            <Text strong>Occupancy Rate</Text>
            <div className="mt-4">
              {propertyStats.map(stat => (
                <div key={stat.name} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <Text>{stat.name}</Text>
                    <Text strong>{stat.value}%</Text>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${stat.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManagerDashboard = () => {
  // Manager-specific data
  const maintenanceRequests = [
    { id: 1, title: 'Plumbing issue in Apt 101', status: 'pending', date: '2025-06-03' },
    { id: 2, title: 'Electrical repair needed in Apt 204', status: 'in-progress', date: '2025-06-02' },
    { id: 3, title: 'HVAC maintenance in Apt 305', status: 'completed', date: '2025-06-01' },
  ];
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockCircleIcon />;
      case 'in-progress':
        return <ToolIcon />;
      case 'completed':
        return <CheckCircleIcon />;
      default:
        return <ClockCircleIcon />;
    }
  };

  return (
    <div>
      <Title level={2}>Manager Dashboard</Title>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-600">
                <UserIcon />
              </div>
              <div className="ml-4">
                <Text>Total Tenants</Text>
                <Text strong>{24}</Text>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-600">
                <ToolIcon />
              </div>
              <div className="ml-4">
                <Text>Maintenance Requests</Text>
                <Text strong>{5}</Text>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-600">
                <FileIcon />
              </div>
              <div className="ml-4">
                <Text>Documents</Text>
                <Text strong>{12}</Text>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mt-4">
        <div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-center">
              <Text strong>Recent Maintenance Requests</Text>
              <Button type="link">View All</Button>
            </div>
            <div className="mt-4">
              {maintenanceRequests.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center">
                    <div className="text-blue-600">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="ml-3">
                      <Text strong>{item.title}</Text>
                      <Text type="secondary">Submitted on {item.date}</Text>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'completed' ? 'bg-green-100 text-green-600' : item.status === 'in-progress' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mt-4">
        <div>
          <div className="bg-blue-100 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H7" />
                </svg>
              </div>
              <div className="ml-4">
                <Text strong>Property Inspection Reminder</Text>
                <Text type="secondary">The quarterly property inspection is scheduled for June 15, 2025.</Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TenantDashboard = () => (
  <div>
    <Title level={2}>Tenant Dashboard</Title>
    <div className="bg-white shadow rounded-lg p-4 mt-6">
      <Text strong>Welcome to your dashboard!</Text>
      <div className="mt-2 text-gray-600">Here you can view your payments, maintenance requests, and documents.</div>
    </div>
  </div>
);

export default Dashboard;