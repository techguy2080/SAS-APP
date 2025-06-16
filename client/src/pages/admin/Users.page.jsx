import React, { useState } from 'react'; 
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import PageLayout from '../../components/layouts/shared/PageLayoutComponent';
import Button from '../../components/layouts/shared/Button';
import FormComponent from '../../components/layouts/shared/forms/FormComponent';
import Tables from '../../components/layouts/shared/Tables';
import SearchFilter from '../../components/layouts/shared/SearchFilterComponent';

// Simple Plus icon SVG
const PlusIcon = () => (
  <svg className="inline w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M12 4v16m8-8H4" />
  </svg>
);

const DARK_TEXT = '#24292e';

const UsersPage = () => {
  const queryClient = useQueryClient();
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Define filters for SearchFilter component
  const filters = [
    {
      name: 'role',
      placeholder: 'Filter by Role',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Manager', value: 'manager' },
        { label: 'Tenant', value: 'tenant' }
      ]
    }
  ];

  // Fetch users with React Query
  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axios.get('/api/users');
      return res.data;
    }
  });

  // Filter users when filters or search change
  const filteredUsers = React.useMemo(() => {
    let filtered = [...users];
    if (filterValues.role) {
      filtered = filtered.filter(u => u.role === filterValues.role);
    }
    if (searchText) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        u =>
          (u.first_name && u.first_name.toLowerCase().includes(lower)) ||
          (u.last_name && u.last_name.toLowerCase().includes(lower)) ||
          (u.email && u.email.toLowerCase().includes(lower)) ||
          (u.username && u.username.toLowerCase().includes(lower))
      );
    }
    return filtered;
  }, [users, filterValues, searchText]);

  // Create manager mutation
  const createManagerMutation = useMutation({
    mutationFn: async (values) => {
      const managerData = { ...values, role: 'manager' };
      delete managerData.apartment;
      delete managerData.unit;
      delete managerData.tenant_details;
      await axios.post('/api/users', managerData);
    },
    onSuccess: async () => {
      setFormSuccess('Manager created successfully!');
      setFormError('');
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      setTimeout(() => {
        setShowManagerModal(false);
        setFormSuccess('');
      }, 2000);
    },
    onError: (error) => {
      let errorMsg;
      if (typeof error.response?.data === 'string') {
        errorMsg = error.response.data;
      } else if (error.response?.data) {
        errorMsg = error.response?.data.message ||
          error.response?.data.error ||
          JSON.stringify(error.response?.data);
      } else {
        errorMsg = error.message || 'Failed to create manager';
      }
      setFormError(errorMsg);
      setFormSuccess('');
    },
    onSettled: () => setFormLoading(false)
  });

  // Table columns
  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (text, record) => `${record.first_name || ''} ${record.last_name || ''}`,
      sorter: (a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => role.charAt(0).toUpperCase() + role.slice(1)
    },
    { title: 'Username', dataIndex: 'username', key: 'username' }
  ];

  // Manager form fields
  const managerFormFields = [
    { name: 'first_name', label: 'First Name', type: 'text', rules: [{ required: true }] },
    { name: 'last_name', label: 'Last Name', type: 'text', rules: [{ required: true }] },
    { name: 'email', label: 'Email', type: 'email', rules: [{ required: true, type: 'email' }] },
    { name: 'username', label: 'Username', type: 'text', rules: [{ required: true }] },
    { name: 'password', label: 'Password', type: 'password', rules: [{ required: true, min: 6 }] },
    { name: 'phone_number', label: 'Phone Number', type: 'text', rules: [{ required: true }] }
  ];

  return (
    <PageLayout
      title="Users"
      actionButton={
        <Button
          type="primary"
          icon={<PlusIcon />}
          onClick={() => setShowManagerModal(true)}
        >
          Create Manager
        </Button>
      }
      search={
        <SearchFilter
          searchText={searchText}
          onSearchChange={setSearchText}
          placeholder="Search by name, email, or username"
          filters={filters}
          filterValues={filterValues}
          onFilterChange={(name, value) => setFilterValues(prev => ({ ...prev, [name]: value }))}
        />
      }
      loading={loading}
    >
      <Tables
        columns={columns}
        dataSource={filteredUsers}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Total ${total} users`
        }}
      />

      {/* Modal replacement */}
      {showManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => {
                setShowManagerModal(false);
                setFormError('');
                setFormSuccess('');
              }}
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-4">Create Manager</h2>
            {formError && (
              <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-200">
                <strong>Error:</strong> {formError}
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 p-3 rounded bg-green-100 text-green-700 border border-green-200">
                <strong>Success:</strong> {formSuccess}
              </div>
            )}
            <FormComponent
              fields={managerFormFields}
              onSubmit={(values) => {
                setFormLoading(true);
                createManagerMutation.mutate(values);
              }}
              submitText="Create"
              submitButtonProps={{
                type: "primary"
              }}
              showResetButton={false}
              loading={formLoading}
            />
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default UsersPage;