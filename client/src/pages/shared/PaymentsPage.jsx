import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPayments, updatePayment, createPayment } from '../../services/payment.service';
import LoadingSpinner from '../../components/layouts/shared/LoadingSpinner';
import Button from '../../components/layouts/shared/Button';
import Card from '../../components/layouts/shared/Card';
import ConfirmDialog from '../../components/layouts/shared/ConfirmDialog';
import Tables from '../../components/layouts/shared/Tables';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axiosConfig';

const PaymentsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Dropdown data
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  // Modal and form state
  const [showEdit, setShowEdit] = useState(false);
  const [editPayment, setEditPayment] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', notes: '' });
  const [editLoading, setEditLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    tenant: '',
    unit: '',
    type: 'rent',
    amount: '',
    status: 'completed',
    paidAt: '',
    paymentMethod: 'cash',
    notes: ''
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Confirm dialog state
  const [showConfirm, setShowConfirm] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  // Fetch payments with React Query
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const res = await getPayments();
      return res.data;
    }
  });

  // Fetch tenants and units for dropdowns
  React.useEffect(() => {
    if (user?.role === 'manager') {
      setDropdownLoading(true);
      Promise.all([
        axios.get('/users?role=tenant'),
        axios.get('/apartment-units')
      ]).then(([tenantsRes, unitsRes]) => {
        setTenants(Array.isArray(tenantsRes.data) ? tenantsRes.data : tenantsRes.data.tenants || []);
        setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : unitsRes.data.units || []);
      }).catch(() => {
        alert('Failed to fetch tenants or units');
      }).finally(() => setDropdownLoading(false));
    }
  }, [user?.role]);

  // Mutations
  const createPaymentMutation = useMutation({
    mutationFn: (data) => createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setShowCreate(false);
      setCreateForm({
        tenant: '',
        unit: '',
        type: 'rent',
        amount: '',
        status: 'completed',
        paidAt: '',
        paymentMethod: 'cash',
        notes: ''
      });
    },
    onSettled: () => setCreateLoading(false),
    onError: () => alert('Failed to create payment')
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, data }) => updatePayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setShowEdit(false);
    },
    onSettled: () => setEditLoading(false),
    onError: () => alert('Failed to update payment')
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id) => axios.delete(`/payments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setShowConfirm(false);
    },
    onError: () => alert('Failed to delete payment')
  });

  // Handlers
  const handleEditClick = (payment) => {
    setEditPayment(payment);
    setEditForm({
      status: payment.status,
      notes: payment.notes || ''
    });
    setShowEdit(true);
  };

  const handleFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setEditLoading(true);
    updatePaymentMutation.mutate({ id: editPayment._id, data: editForm });
  };

  const handleCreateFormChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setCreateLoading(true);
    createPaymentMutation.mutate({
      ...createForm,
      paidAt: createForm.paidAt || new Date().toISOString()
    });
  };

  // Table columns definition
  const columns = [
    { title: 'Tenant', render: p => `${p.tenant?.first_name || ''} ${p.tenant?.last_name || ''}` },
    { title: 'Unit', render: p => p.unit?.unitNumber },
    { title: 'Amount', dataIndex: 'amount' },
    { title: 'Type', dataIndex: 'type' },
    { title: 'Status', dataIndex: 'status' },
    { title: 'Paid At', render: p => p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-' },
    ...(user?.role === 'manager'
      ? [{
          title: 'Actions',
          render: p => (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleEditClick(p)}>Edit</Button>
              <Button size="sm" type="danger" onClick={() => { setPaymentToDelete(p); setShowConfirm(true); }}>Delete</Button>
            </div>
          )
        }]
      : [])
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Payments</h2>
      <div className="mb-2 text-gray-600">
        {user?.role === 'admin' && 'Viewing all payments'}
        {user?.role === 'manager' && 'Viewing payments for your building(s)'}
        {user?.role === 'tenant' && 'Viewing your payments'}
      </div>
      {user?.role === 'manager' && (
        <Button
          type="primary"
          className="mb-4"
          onClick={() => setShowCreate(true)}
        >
          Record Payment
        </Button>
      )}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Card>
          <Tables columns={columns} dataSource={payments} />
        </Card>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit Payment</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleFormChange}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Notes</label>
                <textarea
                  name="notes"
                  value={editForm.notes}
                  onChange={handleFormChange}
                  className="w-full border rounded px-2 py-1"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setShowEdit(false)}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Record Payment</h3>
            <form onSubmit={handleCreateSubmit}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Tenant</label>
                <select
                  name="tenant"
                  value={createForm.tenant}
                  onChange={handleCreateFormChange}
                  className="w-full border rounded px-2 py-1"
                  required
                  disabled={dropdownLoading}
                >
                  <option value="">Select Tenant</option>
                  {Array.isArray(tenants) && tenants.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.first_name} {t.last_name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Unit</label>
                <select
                  name="unit"
                  value={createForm.unit}
                  onChange={handleCreateFormChange}
                  className="w-full border rounded px-2 py-1"
                  required
                  disabled={dropdownLoading}
                >
                  <option value="">Select Unit</option>
                  {units.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.unitNumber} (Floor {u.floor})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Type</label>
                <select
                  name="type"
                  value={createForm.type}
                  onChange={handleCreateFormChange}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="rent">Rent</option>
                  <option value="security">Security</option>
                  <option value="utility">Utility</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="deposit">Deposit</option>
                  <option value="parking">Parking</option>
                  <option value="penalty">Penalty</option>
                  <option value="service">Service</option>
                  <option value="insurance">Insurance</option>
                  <option value="internet">Internet</option>
                  <option value="water">Water</option>
                  <option value="electricity">Electricity</option>
                  <option value="garbage">Garbage</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={createForm.amount}
                  onChange={handleCreateFormChange}
                  className="w-full border rounded px-2 py-1"
                  required
                  min="0"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Status</label>
                <select
                  name="status"
                  value={createForm.status}
                  onChange={handleCreateFormChange}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Paid At</label>
                <input
                  type="datetime-local"
                  name="paidAt"
                  value={createForm.paidAt}
                  onChange={handleCreateFormChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={createForm.paymentMethod}
                  onChange={handleCreateFormChange}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mpesa">Mpesa</option>
                  <option value="cheque">Cheque</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Notes</label>
                <textarea
                  name="notes"
                  value={createForm.notes}
                  onChange={handleCreateFormChange}
                  className="w-full border rounded px-2 py-1"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setShowCreate(false)}
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  disabled={createLoading}
                >
                  {createLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showConfirm}
        title="Delete Payment"
        description="Are you sure you want to delete this payment?"
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => {
          if (paymentToDelete) {
            deletePaymentMutation.mutate(paymentToDelete._id);
          }
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default PaymentsPage;