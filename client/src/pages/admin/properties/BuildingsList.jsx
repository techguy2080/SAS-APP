// BuildingsList.jsx
import React from 'react';

// Removed Ant Design imports
// import { Space, Tooltip } from 'antd';
// import { EditOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons';

// Import shared components
import Tables from '../../../components/layouts/shared/Tables';
import Button from '../../../components/layouts/shared/Button';
import LoadingSpinner from '../../../components/layouts/shared/LoadingSpinner';

// Simple icon SVGs to replace Ant Design icons
const HomeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M3 9.75V19a2 2 0 002 2h3v-7h4v7h3a2 2 0 002-2V9.75M9 22V12h6v10" />
  </svg>
);
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

const BuildingsList = ({ 
  buildings,
  managers, 
  loading,
  onEdit,
  onDelete,
  onViewUnits 
}) => {
  // Get manager name from manager object/id - existing function
  const getManagerName = (managerRef) => {
    if (!managerRef) return 'Not assigned';
    const managerId = typeof managerRef === 'object' ? managerRef._id : managerRef;
    const manager = managers.find(m => m._id === managerId);
    return manager 
      ? `${manager.first_name} ${manager.last_name}` 
      : 'Unknown';
  };

  // Column definitions - update Delete button to pass full building object
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { 
      title: 'Manager', 
      dataIndex: 'manager', 
      key: 'manager',
      render: manager => getManagerName(manager)
    },
    { 
      title: 'Units', 
      key: 'units', 
      render: (_, record) => record.units?.length || 0
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <button
            title="View Units"
            className="p-1 rounded hover:bg-blue-100"
            onClick={() => onViewUnits(record._id)}
            type="button"
          >
            <HomeIcon />
          </button>
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
            onClick={() => onDelete(record)}
            type="button"
          >
            <DeleteIcon />
          </button>
        </div>
      ),
    },
  ];

  if (loading && (!buildings || buildings.length === 0)) {
    return <LoadingSpinner text="Loading buildings..." />;
  }

  return (
    <Tables
      columns={columns}
      dataSource={buildings}
      rowKey="_id"
      loading={loading}
      pagination={{ 
        pageSize: 10,
        showTotal: (total) => `Total ${total} buildings` 
      }}
    />
  );
};

export default BuildingsList;