import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../../utils/axiosConfig';

import BuildingsList from '../properties/BuildingsList';
import BuildingForm from '../properties/BuildingForm';
import UnitsList from '../properties/UnitsList';
import UnitForm from '../properties/UnitForm';

// Simple replacements for icons
const HomeIcon = () => (
  <svg className="inline w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M3 9.75V19a2 2 0 002 2h3v-7h4v7h3a2 2 0 002-2V9.75M9 22V12h6v10" />
  </svg>
);
const BuildIcon = () => (
  <svg className="inline w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M21 13.255V21a1 1 0 01-1 1h-7.745a1 1 0 01-.707-1.707l7.745-7.745a1 1 0 011.707.707z" />
    <path d="M16.5 7.5a4 4 0 11-5.657-5.657 4 4 0 015.657 5.657z" />
  </svg>
);
const PlusIcon = () => (
  <svg className="inline w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M12 4v16m8-8H4" />
  </svg>
);

const fetchBuildings = async () => {
  const res = await axios.get(`/api/apartment-buildings?_t=${Date.now()}`);
  return res.data;
};

const fetchManagers = async () => {
  const res = await axios.get('/api/users?role=manager');
  return res.data;
};

const Properties = () => {
  const queryClient = useQueryClient();

  // React Query for buildings and managers
  const { data: buildings = [], isLoading: loadingBuildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: fetchBuildings,
  });

  const { data: managers = [], isLoading: loadingManagers } = useQuery({
    queryKey: ['managers'],
    queryFn: fetchManagers,
  });

  // Mutations for deleting a building
  const deleteBuildingMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/apartment-buildings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });

  // UI state for forms and tabs
  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [activeTab, setActiveTab] = useState('buildings');

  // Handlers
  const handleDeleteBuilding = async (id) => {
    try {
      await deleteBuildingMutation.mutateAsync(id);
      alert('Building deleted');
    } catch {
      alert('Failed to delete building');
    }
  };

  const handleEditBuilding = (building) => {
    setEditingBuilding(building);
    setShowBuildingForm(true);
  };

  const handleViewBuildingUnits = (buildingId) => {
    setSelectedBuilding(buildingId);
    setActiveTab('units');
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setShowUnitForm(true);
  };

  // Render the appropriate view based on state
  if (showBuildingForm) {
    return (
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
      />
    );
  }

  if (showUnitForm) {
    return (
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
      />
    );
  }

  // Main tabbed view
  return (
    <>
      <Helmet>
        <title>Properties | Kidega Apartments</title>
      </Helmet>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Properties</h2>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => {
              if (activeTab === 'buildings') {
                setShowBuildingForm(true);
              } else {
                setShowUnitForm(true);
              }
            }}
          >
            <PlusIcon />
            Add New {activeTab === 'buildings' ? 'Building' : 'Unit'}
          </button>
        </div>

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
          <BuildingsList
            buildings={buildings}
            managers={managers}
            loading={loadingBuildings || loadingManagers}
            onEdit={handleEditBuilding}
            onDelete={handleDeleteBuilding}
            onViewUnits={handleViewBuildingUnits}
          />
        ) : (
          <UnitsList
            buildings={buildings}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={setSelectedBuilding}
            onEdit={handleEditUnit}
            onAddNew={() => setShowUnitForm(true)}
          />
        )}
      </div>
    </>
  );
};

export default Properties;