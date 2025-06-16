import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosConfig';
import Card from '../../../components/layouts/shared/Card';
import Button from '../../../components/layouts/shared/Button';
import LoadingSpinner from '../../../components/layouts/shared/LoadingSpinner';
import Grids, { GridCol } from '../../../components/layouts/shared/Grids';

const BuildingForm = ({
  initialValues = null,
  onCancel,
  onSuccess,
  onSubmitStart,
  onSubmitEnd
}) => {
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [fileList, setFileList] = useState([]);
  const [form, setForm] = useState({
    name: initialValues?.name || '',
    totalUnits: initialValues?.totalUnits || '',
    address: initialValues?.address || '',
    manager: initialValues?.manager?._id || '',
    amenities: initialValues?.amenities || [],
    notes: initialValues?.notes || '',
    images: []
  });

  const isEditing = !!initialValues;

  useEffect(() => {
    const fetchManagers = async () => {
      setLoadingManagers(true);
      try {
        const response = await axios.get('/api/users?role=manager');
        setManagers(response.data);
      } catch {
        alert('Failed to load managers');
      } finally {
        setLoadingManagers(false);
      }
    };
    fetchManagers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenitiesChange = (e) => {
    setForm(prev => ({ ...prev, amenities: e.target.value.split(',').map(a => a.trim()) }));
  };

  const handleFileChange = (e) => {
    setFileList(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (onSubmitStart) onSubmitStart();

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key !== 'images') {
          formData.append(key, form[key]);
        }
      });
      fileList.forEach(file => {
        formData.append('images', file);
      });

      if (isEditing) {
        await axios.put(`/api/apartment-buildings/${initialValues._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Building updated successfully');
      } else {
        await axios.post('/api/apartment-buildings', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Building created successfully');
      }
      onSuccess();
    } catch (error) {
      alert(`Failed to ${isEditing ? 'update' : 'create'} building: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
      if (onSubmitEnd) onSubmitEnd();
    }
  };

  if (loadingManagers && !managers.length) {
    return (
      <Card>
        <LoadingSpinner text="Loading managers data..." />
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <h2>{isEditing ? 'Edit Building' : 'Add New Building'}</h2>
        <div>
          <label>Building Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleInputChange}
            required
            placeholder="Enter building name"
          />
        </div>
        <div>
          <label>Total Units</label>
          <input
            name="totalUnits"
            type="number"
            min={1}
            value={form.totalUnits}
            onChange={handleInputChange}
            required
            placeholder="Enter total units"
          />
        </div>
        <div>
          <label>Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleInputChange}
            required
            placeholder="Enter address"
          />
        </div>
        <div>
          <label>Manager</label>
          <select
            name="manager"
            value={form.manager}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a manager</option>
            {managers.map(manager => (
              <option key={manager._id} value={manager._id}>
                {manager.first_name} {manager.last_name} ({manager.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Amenities (comma separated)</label>
          <input
            name="amenities"
            value={form.amenities.join(', ')}
            onChange={handleAmenitiesChange}
            placeholder="Enter amenities"
          />
        </div>
        <div>
          <label>Building Images</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
          />
        </div>
        <div>
          <label>Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleInputChange}
            rows={4}
            placeholder="Enter additional notes"
          />
        </div>
        <div>
          <Button type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit" loading={loading}>
            {isEditing ? 'Update Building' : 'Create Building'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default BuildingForm;