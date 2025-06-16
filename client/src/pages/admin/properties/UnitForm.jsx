import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../../utils/axiosConfig';

// Import shared components
import Card from '../../../components/layouts/shared/Card';
import Button from '../../../components/layouts/shared/Button';
import LoadingSpinner from '../../../components/layouts/shared/LoadingSpinner';
import Grids, { GridCol } from '../../../components/layouts/shared/Grids';

const UnitForm = ({ 
  initialValues = null, 
  selectedBuilding = null,
  onCancel, 
  onSuccess,
  onSubmitStart,
  onSubmitEnd
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialValues;

  // Form state
  const [form, setForm] = useState({
    building: initialValues?.building?._id || initialValues?.building || selectedBuilding || '',
    unitNumber: initialValues?.unitNumber || '',
    floor: initialValues?.floor || '',
    numberOfRooms: initialValues?.numberOfRooms || '',
    numberOfBathrooms: initialValues?.numberOfBathrooms || '',
    sizeSqFt: initialValues?.sizeSqFt || '',
    rent: initialValues?.rent || '',
    status: initialValues?.status || 'available',
    amenities: initialValues?.amenities || [],
    description: initialValues?.description || '',
  });
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch buildings with React Query
  const { data: buildings = [], isLoading: loadingBuildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const res = await axios.get('/api/apartment-buildings');
      return res.data;
    },
  });

  // Set initial file list if editing
  useEffect(() => {
    if (initialValues && initialValues.images && initialValues.images.length > 0) {
      setFileList(
        initialValues.images.map((img, idx) => ({
          uid: `-${idx}`,
          name: `image-${idx}.jpg`,
          status: 'done',
          url: img,
        }))
      );
    }
  }, [initialValues]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e) => {
    setForm((prev) => ({ ...prev, status: e.target.value }));
  };

  const handleAmenitiesChange = (e) => {
    setForm((prev) => ({
      ...prev,
      amenities: e.target.value.split(',').map((a) => a.trim()),
    }));
  };

  const handleFileChange = (e) => {
    setFileList(Array.from(e.target.files));
  };

  // Mutation for create/update
  const unitMutation = useMutation({
    mutationFn: async (formData) => {
      if (isEditing) {
        return axios.put(`/api/apartment-units/${initialValues._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        return axios.post('/api/apartment-units', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      if (onSuccess) onSuccess();
    },
    onSettled: () => {
      setLoading(false);
      if (onSubmitEnd) onSubmitEnd();
    },
    onError: (error) => {
      alert(
        `Failed to ${isEditing ? 'update' : 'create'} unit: ${
          error.response?.data?.message || error.message
        }`
      );
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (onSubmitStart) onSubmitStart();

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === 'amenities') {
          formData.append(key, JSON.stringify(form[key]));
        } else {
          formData.append(key, form[key]);
        }
      });
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        } else if (file instanceof File) {
          formData.append('images', file);
        }
      });
      unitMutation.mutate(formData);
    } catch (error) {
      setLoading(false);
      alert(
        `Failed to ${isEditing ? 'update' : 'create'} unit: ${
          error.response?.data?.message || error.message
        }`
      );
      if (onSubmitEnd) onSubmitEnd();
    }
  };

  // Show loading spinner when fetching buildings
  if (loadingBuildings && !buildings.length) {
    return (
      <Card>
        <LoadingSpinner text="Loading buildings data..." />
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? 'Edit Apartment Unit' : 'Add New Apartment Unit'}
        </h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Building</label>
          <select
            name="building"
            value={form.building}
            onChange={handleInputChange}
            required
            disabled={!!selectedBuilding}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Select building</option>
            {buildings.map((building) => (
              <option key={building._id} value={building._id}>
                {building.name}
              </option>
            ))}
          </select>
        </div>
        <Grids gutter={24}>
          <GridCol xs={24} sm={12}>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Unit Number</label>
              <input
                name="unitNumber"
                value={form.unitNumber}
                onChange={handleInputChange}
                required
                placeholder="e.g. 101"
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </GridCol>
          <GridCol xs={24} sm={12}>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Floor</label>
              <input
                name="floor"
                type="number"
                min={0}
                value={form.floor}
                onChange={handleInputChange}
                required
                placeholder="e.g. 1"
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </GridCol>
        </Grids>
        <Grids gutter={24}>
          <GridCol xs={24} sm={8}>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Number of Bedrooms</label>
              <input
                name="numberOfRooms"
                type="number"
                min={0}
                value={form.numberOfRooms}
                onChange={handleInputChange}
                required
                placeholder="e.g. 2"
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </GridCol>
          <GridCol xs={24} sm={8}>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Number of Bathrooms</label>
              <input
                name="numberOfBathrooms"
                type="number"
                min={0}
                step={0.5}
                value={form.numberOfBathrooms}
                onChange={handleInputChange}
                required
                placeholder="e.g. 1.5"
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </GridCol>
          <GridCol xs={24} sm={8}>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Size (sq ft)</label>
              <input
                name="sizeSqFt"
                type="number"
                min={0}
                value={form.sizeSqFt}
                onChange={handleInputChange}
                required
                placeholder="e.g. 850"
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </GridCol>
        </Grids>
        <Grids gutter={24}>
          <GridCol xs={24} sm={12}>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Monthly Rent ($)</label>
              <input
                name="rent"
                type="number"
                min={0}
                value={form.rent}
                onChange={handleInputChange}
                required
                placeholder="e.g. 1200"
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </GridCol>
          <GridCol xs={24} sm={12}>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleSelectChange}
                required
                className="w-full border rounded px-2 py-1"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </GridCol>
        </Grids>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Amenities (comma separated)</label>
          <input
            name="amenities"
            value={form.amenities.join(', ')}
            onChange={handleAmenitiesChange}
            placeholder="Enter unit amenities"
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Unit Images</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Enter unit description"
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit" loading={loading}>
            {isEditing ? 'Update Unit' : 'Create Unit'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UnitForm;