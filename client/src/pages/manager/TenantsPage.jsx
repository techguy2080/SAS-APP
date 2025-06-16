import React, { useState } from 'react'; // removed useEffect
// Removed Ant Design imports
// import { Modal, message, Input, Alert, Empty } from 'antd';
// import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query'; // removed useQueryClient
import axios from 'axios';
import FormComponent from '../../components/layouts/shared/forms/FormComponent';
import Tables from '../../components/layouts/shared/Tables';
import PageLayout from '../../components/layouts/shared/PageLayoutComponent';
import Button from '../../components/layouts/shared/Button';

// Simple Plus icon SVG
const PlusIcon = () => (
  <svg className="inline w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M12 4v16m8-8H4" />
  </svg>
);

const DARK_TEXT = '#24292e';

const TenantsPage = () => {
  // Removed unused queryClient and useEffect
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch tenants with React Query
  const { data: tenants = [], isLoading: loading, refetch: refetchTenants } = useQuery({
    queryKey: ['manager-tenants'],
    queryFn: async () => {
      const res = await axios.get('/api/users/manager-tenants');
      return res.data;
    }
  });

  // Fetch available units with React Query
  const { data: availableUnits = [], refetch: refetchUnits } = useQuery({
    queryKey: ['manager-available-units'],
    queryFn: async () => {
      const res = await axios.get('/api/apartment-units/manager');
      // Only show unoccupied units
      return res.data.filter(unit => !unit.isOccupied && unit.status !== 'occupied');
    }
  });

  // Filter tenants by search
  const filteredTenants = React.useMemo(() => {
    let filtered = [...tenants];
    if (searchText) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        t =>
          (t.first_name && t.first_name.toLowerCase().includes(lower)) ||
          (t.last_name && t.last_name.toLowerCase().includes(lower)) ||
          (t.email && t.email.toLowerCase().includes(lower)) ||
          (t.username && t.username.toLowerCase().includes(lower))
      );
    }
    return filtered;
  }, [searchText, tenants]);

  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        ...values,
        role: 'tenant',
        unit: values.unit
      };
      await axios.post('/api/users', payload);
    },
    onSuccess: async () => {
      setFormSuccess('Tenant created successfully!');
      setFormError('');
      await refetchTenants();
      await refetchUnits();
      setTimeout(() => {
        setShowTenantModal(false);
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
        errorMsg = error.message || 'Failed to create tenant';
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
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number' },
    { title: 'Unit', key: 'unit', render: (text, record) => record.unit ? record.unit.unitNumber : '-' },
    { title: 'Lease Start', key: 'lease_start', render: (text, record) => record.tenant_details?.lease_start ? new Date(record.tenant_details.lease_start).toLocaleDateString() : '-' },
    { title: 'Lease End', key: 'lease_end', render: (text, record) => record.tenant_details?.lease_end ? new Date(record.tenant_details.lease_end).toLocaleDateString() : '-' }
  ];

  // Tenant form fields (with unit selection)
  const tenantFormFields = [
    { name: 'first_name', label: 'First Name', type: 'text', rules: [{ required: true }] },
    { name: 'last_name', label: 'Last Name', type: 'text', rules: [{ required: true }] },
    { name: 'email', label: 'Email', type: 'email', rules: [{ required: true, type: 'email' }] },
    { name: 'username', label: 'Username', type: 'text', rules: [{ required: true }] },
    { name: 'password', label: 'Password', type: 'password', rules: [{ required: true, min: 6 }] },
    { name: 'phone_number', label: 'Phone Number', type: 'text', rules: [{ required: true }] },
    {
      name: 'unit',
      label: 'Unit',
      type: 'select',
      rules: [{ required: true, message: 'Please select a unit' }],
      options: availableUnits.map(unit => ({
        value: unit._id,
        label: `Unit ${unit.unitNumber} - Floor ${unit.floor}`
      }))
    },
    {
      name: ['tenant_details', 'lease_start'],
      label: 'Lease Start',
      type: 'date',
      rules: [{ required: false }]
    },
    {
      name: ['tenant_details', 'lease_end'],
      label: 'Lease End',
      type: 'date',
      rules: [{ required: false }]
    }
  ];

  // Modal replacement
  const TenantModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={() => {
            setShowTenantModal(false);
            setFormError('');
            setFormSuccess('');
          }}
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-bold mb-4">Create Tenant</h2>
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
          fields={tenantFormFields}
          onSubmit={(values) => {
            setFormLoading(true);
            createTenantMutation.mutate(values);
          }}
          submitText="Create"
          submitButtonProps={{
            type: "primary",
            style: {
              fontWeight: 500
            }
          }}
          showResetButton={false}
          loading={formLoading}
        />
      </div>
    </div>
  );

  return (
    <PageLayout
      title="Tenants"
      actionButton={
        <Button
          type="primary"
          icon={<PlusIcon />}
          onClick={() => setShowTenantModal(true)}
          disabled={availableUnits.length === 0}
          style={{
            fontWeight: 500
          }}
        >
          Create Tenant
          {availableUnits.length === 0 && " (No Units Available)"}
        </Button>
      }
      search={
        <input
          type="text"
          placeholder="Search by name, email, or username"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="border rounded px-3 py-2 w-80"
          style={{ width: 320 }}
        />
      }
      loading={loading}
      empty={tenants.length === 0 && (
        <div className="text-center text-gray-400 py-8">No tenants found</div>
      )}
    >
      <Tables
        columns={columns}
        dataSource={filteredTenants}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Total ${total} tenants`
        }}
      />

      {showTenantModal && <TenantModal />}
    </PageLayout>
  );
};

export default TenantsPage;