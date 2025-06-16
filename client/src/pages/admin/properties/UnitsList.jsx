import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../../utils/axiosConfig';

import Button from '../../../components/layouts/shared/Button';
import Tables from '../../../components/layouts/shared/Tables';
import LoadingSpinner from '../../../components/layouts/shared/LoadingSpinner';
import Grids, { GridCol } from '../../../components/layouts/shared/Grids';
import ConfirmDialog from '../../../components/layouts/shared/ConfirmDialog';

// Simple tag component to replace AntD Tag
const StatusTag = ({ status }) => {
  const color =
    status === 'available'
      ? 'bg-green-100 text-green-800'
      : status === 'occupied'
      ? 'bg-blue-100 text-blue-800'
      : status === 'maintenance'
      ? 'bg-orange-100 text-orange-800'
      : 'bg-red-100 text-red-800';
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
      {status?.toUpperCase() || 'UNKNOWN'}
    </span>
  );
};

// Simple icon SVGs to replace Ant Design icons
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M15.232 5.232l3.536 3.536M9 11l6 6M3 17v4h4l10.293-10.293a1 1 0 000-1.414l-3.586-3.586a1 1 0 00-1.414 0L3 17z" />
  </svg>
);
const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M12 4v16m8-8H4" />
  </svg>
);

const UnitsList = ({
  buildings = [],
  selectedBuilding,
  onSelectBuilding,
  onEdit,
  onAddNew
}) => {
  const queryClient = useQueryClient();

  // Fetch units with React Query
  const { data: units = [], isLoading: loading } = useQuery({
    queryKey: ['units', selectedBuilding],
    queryFn: async () => {
      let url = '/api/apartment-units';
      if (selectedBuilding) {
        url = `/api/apartment-units?building=${selectedBuilding}`;
      }
      const response = await axios.get(url);
      return response.data;
    }
  });

  // Delete mutation
  const deleteUnitMutation = useMutation({
    mutationFn: (unitId) => axios.delete(`/api/apartment-units/${unitId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    }
  });

  // Delete dialog state
  const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false);
  const [deletingUnit, setDeletingUnit] = React.useState(null);

  const handleDeleteClick = (unit) => {
    setDeletingUnit(unit);
    setDeleteDialogVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUnit) return;
    try {
      await deleteUnitMutation.mutateAsync(deletingUnit._id);
      setDeleteDialogVisible(false);
    } catch (error) {
      alert('Failed to delete unit: ' + (error.response?.data?.message || error.message));
    }
  };

  const getBuildingName = (buildingRef) => {
    if (!buildingRef) return 'Unknown';
    const buildingId = typeof buildingRef === 'object' ? buildingRef._id : buildingRef;
    const building = buildings.find(b => b._id === buildingId);
    return building ? building.name : 'Unknown';
  };

  const columns = [
    {
      title: 'Building',
      dataIndex: 'building',
      key: 'building',
      render: buildingRef => getBuildingName(buildingRef)
    },
    { title: 'Unit #', dataIndex: 'unitNumber', key: 'unitNumber' },
    { title: 'Floor', dataIndex: 'floor', key: 'floor' },
    { title: 'Beds', dataIndex: 'numberOfRooms', key: 'numberOfRooms' },
    { title: 'Baths', dataIndex: 'numberOfBathrooms', key: 'numberOfBathrooms' },
    { title: 'Size (sq ft)', dataIndex: 'sizeSqFt', key: 'sizeSqFt' },
    { title: 'Rent ($)', dataIndex: 'rent', key: 'rent' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => <StatusTag status={status} />
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <button
            title="Edit"
            className="p-1 rounded hover:bg-yellow-100"
            onClick={() => onEdit(record)}
            type="button"
          >
            <EditIcon />
          </button>
          <button
            title="Delete"
            className="p-1 rounded hover:bg-red-100 text-red-600"
            onClick={() => handleDeleteClick(record)}
            type="button"
          >
            <DeleteIcon />
          </button>
        </div>
      ),
    },
  ];

  if (loading && (!units || units.length === 0)) {
    return <LoadingSpinner text="Loading apartment units..." />;
  }

  return (
    <>
      <Grids gutter={16} style={{ marginBottom: 16 }}>
        <GridCol xs={24} md={16}>
          <select
            className="w-full border rounded px-2 py-1"
            value={selectedBuilding || ''}
            onChange={e => onSelectBuilding(e.target.value || null)}
          >
            <option value="">All Buildings</option>
            {buildings.map(building => (
              <option key={building._id} value={building._id}>
                {building.name}
              </option>
            ))}
          </select>
        </GridCol>
        <GridCol xs={24} md={8} style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            onClick={onAddNew}
          >
            <PlusIcon />
            Add Unit
          </Button>
        </GridCol>
      </Grids>

      <Tables
        columns={columns}
        dataSource={units}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Total ${total} units`
        }}
      />

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogVisible}
        onCancel={() => setDeleteDialogVisible(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Unit"
        description="Are you sure you want to delete this apartment unit? This action cannot be undone."
        itemName={deletingUnit ? `${deletingUnit.unitNumber} (${getBuildingName(deletingUnit.building)})` : ''}
        loading={deleteUnitMutation.isLoading}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default UnitsList;