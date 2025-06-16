import React, { useState, useEffect } from 'react';
// Removed Ant Design imports
// import { Tabs, App } from 'antd';
// import { HomeOutlined, BuildOutlined, PlusOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import axios from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Import our modular components
import BuildingsList from './properties/BuildingsList';
import BuildingForm from './properties/BuildingForm';
import UnitsList from './properties/UnitsList';
import UnitForm from './properties/UnitForm';

// Import our shared components
import PageLayout from '../../components/layouts/shared/PageLayoutComponent';
import Button from '../../components/layouts/shared/Button';
import Card from '../../components/layouts/shared/Card';
import SearchFilter from '../../components/layouts/shared/SearchFilterComponent';
import LoadingSpinner from '../../components/layouts/shared/LoadingSpinner';
import ConfirmDialog from '../../components/layouts/shared/ConfirmDialog';

// Simple SVG icon replacements
const BuildIcon = () => (
  <svg className="inline w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M21 13.255V21a1 1 0 01-1 1h-7.745a1 1 0 01-.707-1.707l7.745-7.745a1 1 0 011.707.707z" />
    <path d="M16.5 7.5a4 4 0 11-5.657-5.657 4 4 0 015.657 5.657z" />
  </svg>
);
const HomeIcon = () => (
  <svg className="inline w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M3 9.75V19a2 2 0 002 2h3v-7h4v7h3a2 2 0 002-2V9.75M9 22V12h6v10" />
  </svg>
);
const PlusIcon = () => (
  <svg className="inline w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M12 4v16m8-8H4" />
  </svg>
);

const DARK_TEXT = '#24292e';

const fetchBuildings = async () => {
  const response = await axios.get(`/api/apartment-buildings?_t=${Date.now()}`);
  return response.data;
};
const fetchManagers = async () => {
  const response = await axios.get('/api/users?role=manager');
  return response.data.filter(user => user.role === 'manager');
};

const Properties = () => {
  const navigate = useNavigate();
  useAuth();

  // React Query for buildings and managers
  const queryClient = useQueryClient();
  const { data: buildings = [], isLoading: loadingBuildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: fetchBuildings,
  });
  const { data: managers = [], isLoading: loadingManagers } = useQuery({
    queryKey: ['managers'],
    queryFn: fetchManagers,
  });

  // UI state
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [buildingSearchText, setBuildingSearchText] = useState('');
  const [buildingFilterValues, setBuildingFilterValues] = useState({});
  const [unitSearchText, setUnitSearchText] = useState('');
  const [unitFilterValues, setUnitFilterValues] = useState({});
  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [activeTab, setActiveTab] = useState('buildings');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deletingBuilding, setDeletingBuilding] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Delete mutation
  const deleteBuildingMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/apartment-buildings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in. Redirecting to login page...');
      navigate('/login');
    }
  }, [navigate]);

  // Filter buildings when search or filters change
  useEffect(() => {
    if (!buildings.length) return;
    let filtered = [...buildings];
    if (buildingSearchText) {
      const lower = buildingSearchText.toLowerCase();
      filtered = filtered.filter(building =>
        (building.name && building.name.toLowerCase().includes(lower)) ||
        (building.address && building.address.toLowerCase().includes(lower))
      );
    }
    if (buildingFilterValues.manager) {
      filtered = filtered.filter(building =>
        building.manager && building.manager._id === buildingFilterValues.manager
      );
    }
    setFilteredBuildings(filtered);
  }, [buildingSearchText, buildingFilterValues, buildings]);

  // Filter units when search or filters change
  useEffect(() => {
    if (activeTab === 'units' && selectedBuilding) {
      setUnitFilterValues(prev => ({
        ...prev,
        building: selectedBuilding
      }));
    }
  }, [activeTab, selectedBuilding]);

  const handleDeleteBuildingClick = (building) => {
    setDeletingBuilding(building);
    setDeleteDialogVisible(true);
  };

  const handleDeleteBuildingConfirm = async () => {
    if (!deletingBuilding) return;
    setDeleteLoading(true);
    try {
      await deleteBuildingMutation.mutateAsync(deletingBuilding._id);
      setDeleteDialogVisible(false);
    } catch (error) {
      alert('Delete failed: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewBuildingUnits = (buildingId) => {
    setSelectedBuilding(buildingId);
    setActiveTab('units');
  };

  // Filter options
  const buildingFilters = [
    {
      name: 'manager',
      placeholder: 'Filter by Manager',
      options: managers.map(manager => ({
        label: `${manager.first_name} ${manager.last_name}`,
        value: manager._id
      }))
    }
  ];
  const unitFilters = [
    {
      name: 'building',
      placeholder: 'Filter by Building',
      options: buildings.map(building => ({
        label: building.name,
        value: building._id
      }))
    },
    {
      name: 'status',
      placeholder: 'Filter by Status',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Occupied', value: 'occupied' },
        { label: 'Maintenance', value: 'maintenance' }
      ]
    }
  ];

  // Initial load spinner for the entire page
  if (loadingBuildings && loadingManagers && !buildings.length) {
    return (
      <PageLayout title="Properties">
        <LoadingSpinner text="Loading properties data..." size="large" />
      </PageLayout>
    );
  }

  // Render Building Form with loading spinner
  if (showBuildingForm) {
    return (
      <PageLayout title={editingBuilding ? "Edit Building" : "Add New Building"}>
        {formLoading ? (
          <LoadingSpinner text={editingBuilding ? "Updating building..." : "Creating building..."} />
        ) : (
          <BuildingForm
            initialValues={editingBuilding}
            onCancel={() => {
              setShowBuildingForm(false);
              setEditingBuilding(null);
            }}
            onSuccess={() => {
              setShowBuildingForm(false);
              setEditingBuilding(null);
              queryClient.invalidateQueries({ queryKey: ['buildings'] });
            }}
            onSubmitStart={() => setFormLoading(true)}
            onSubmitEnd={() => setFormLoading(false)}
          />
        )}
      </PageLayout>
    );
  }

  // Render Unit Form with loading spinner
  if (showUnitForm) {
    return (
      <PageLayout title={editingUnit ? "Edit Apartment Unit" : "Add New Apartment Unit"}>
        {formLoading ? (
          <LoadingSpinner text={editingUnit ? "Updating unit..." : "Creating unit..."} />
        ) : (
          <UnitForm
            initialValues={editingUnit}
            selectedBuilding={selectedBuilding}
            onCancel={() => {
              setShowUnitForm(false);
              setEditingUnit(null);
            }}
            onSuccess={() => {
              setShowUnitForm(false);
              setEditingUnit(null);
            }}
            onSubmitStart={() => setFormLoading(true)}
            onSubmitEnd={() => setFormLoading(false)}
          />
        )}
      </PageLayout>
    );
  }

  // Main tabbed view (custom tabs, no AntD)
  return (
    <PageLayout
      title="Properties"
      actionButton={
        <Button
          type="primary"
          icon={<PlusIcon />}
          onClick={() => {
            if (activeTab === 'buildings') {
              setShowBuildingForm(true);
            } else {
              setShowUnitForm(true);
            }
          }}
          disabled={formLoading}
        >
          Add New {activeTab === 'buildings' ? 'Building' : 'Unit'}
        </Button>
      }
    >
      <Helmet>
        <title>Properties | Kidega Apartments</title>
      </Helmet>

      <Card
        bordered={false}
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        {/* Custom Tabs */}
        <div className="flex border-b mb-4">
          <button
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
              activeTab === 'buildings'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-gray-600'
            }`}
            onClick={() => setActiveTab('buildings')}
          >
            <BuildIcon />
            Buildings
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
              activeTab === 'units'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-gray-600'
            }`}
            onClick={() => setActiveTab('units')}
          >
            <HomeIcon />
            Apartment Units
          </button>
        </div>

        {activeTab === 'buildings' ? (
          <>
            <SearchFilter
              searchText={buildingSearchText}
              onSearchChange={setBuildingSearchText}
              placeholder="Search by building name or address"
              filters={buildingFilters}
              filterValues={buildingFilterValues}
              onFilterChange={setBuildingFilterValues}
              style={{ marginBottom: 16 }}
            />
            {loadingBuildings ? (
              <LoadingSpinner text="Loading buildings..." />
            ) : (
              <BuildingsList
                buildings={filteredBuildings}
                managers={managers}
                loading={loadingBuildings}
                onEdit={(building) => {
                  setEditingBuilding(building);
                  setShowBuildingForm(true);
                }}
                onDelete={handleDeleteBuildingClick}
                onViewUnits={handleViewBuildingUnits}
              />
            )}
          </>
        ) : (
          <>
            <SearchFilter
              searchText={unitSearchText}
              onSearchChange={setUnitSearchText}
              placeholder="Search by unit number or building"
              filters={unitFilters}
              filterValues={unitFilterValues}
              onFilterChange={setUnitFilterValues}
              style={{ marginBottom: 16 }}
            />
            <UnitsList
              buildings={buildings}
              selectedBuilding={selectedBuilding}
              onSelectBuilding={building => {
                setSelectedBuilding(building);
                setUnitFilterValues(prev => ({ ...prev, building }));
              }}
              onEdit={(unit) => {
                setEditingUnit(unit);
                setShowUnitForm(true);
              }}
              onAddNew={() => setShowUnitForm(true)}
            />
          </>
        )}
      </Card>

      {/* Full page loading spinner for delete operations */}
      {formLoading && <LoadingSpinner fullPage text="Processing request..." />}

      <ConfirmDialog
        visible={deleteDialogVisible}
        onCancel={() => setDeleteDialogVisible(false)}
        onConfirm={handleDeleteBuildingConfirm}
        title="Delete Building"
        message="Are you sure you want to delete this building? This action cannot be undone."
        itemName={deletingBuilding ? deletingBuilding.name : ''}
        loading={deleteLoading}
      />

      <style jsx>{`
        .custom-tabs {
          margin-bottom: 16px;
        }
        .custom-tab {
          color: ${DARK_TEXT};
          padding: 8px 16px;
        }
        .custom-tab-active {
          font-weight: 500;
        }
      `}</style>
    </PageLayout>
  );
};

export default Properties;

