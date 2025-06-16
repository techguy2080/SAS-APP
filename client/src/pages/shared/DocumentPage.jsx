import React, { useState } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import PageLayout from '../../components/layouts/shared/PageLayoutComponent';
import SearchFilter from '../../components/layouts/shared/SearchFilterComponent';
import ConfirmDialog from '../../components/layouts/shared/ConfirmDialog';
import FormComponent from '../../components/layouts/shared/forms/FormComponent';
import LoadingSpinner from '../../components/layouts/shared/LoadingSpinner';
import FileUploadComponent from '../../components/layouts/shared/FileUploadComponent';
import { useAuth } from '../../context/AuthContext';

import { HiDocumentText, HiDownload, HiPencil, HiTrash, HiUpload } from 'react-icons/hi';

const DOCUMENT_CATEGORIES = [
  { value: 'property_deed', label: 'Property Deed' },
  { value: 'lease', label: 'Lease Agreement' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'maintenance', label: 'Maintenance Report' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'tax', label: 'Tax Document' },
  { value: 'other', label: 'Other' }
];

const DOCUMENT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
  { value: 'expired', label: 'Expired' }
];

const getFileIcon = (fileType) => {
  if (fileType?.includes('pdf')) return <span className="text-red-500">PDF</span>;
  if (fileType?.includes('excel') || fileType?.includes('sheet') || fileType?.includes('csv')) return <span className="text-green-500">XLS</span>;
  if (fileType?.includes('image') || fileType?.includes('png') || fileType?.includes('jpg')) return <span className="text-blue-500">IMG</span>;
  return <span className="text-gray-400">FILE</span>;
};

const DocumentPage = ({ role }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State variables
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    category: undefined,
    status: undefined,
    building: undefined
  });
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search filters for the filter bar
  const searchFilters = [
    {
      name: 'category',
      placeholder: 'Category',
      options: DOCUMENT_CATEGORIES,
    },
    {
      name: 'status',
      placeholder: 'Status',
      options: DOCUMENT_STATUSES,
    },
  ];

  // Form fields for the upload/edit form
  const formFields = [
    {
      type: 'text',
      name: 'name',
      label: 'Document Name',
      rules: [{ required: true, message: 'Please enter document name' }],
      placeholder: 'Enter document name',
    },
    {
      type: 'textarea',
      name: 'description',
      label: 'Description',
      placeholder: 'Enter document description',
      rows: 4,
    },
    {
      type: 'select',
      name: 'category',
      label: 'Category',
      rules: [{ required: true, message: 'Please select a category' }],
      options: DOCUMENT_CATEGORIES,
    },
    {
      type: 'select',
      name: 'status',
      label: 'Status',
      options: DOCUMENT_STATUSES,
      defaultValue: 'active',
    },
    {
      type: 'custom',
      name: 'file',
      label: 'Document File',
      rules: [{ required: formMode === 'create', message: 'Please upload a document' }],
      valuePropName: 'fileList',
      getValueFromEvent: (e) => (Array.isArray(e) ? e : e && e.fileList),
      render: () => (
        <FileUploadComponent
          buttonText="Select File"
          icon={<HiUpload />}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
          listType="text"
          maxCount={1}
        />
      ),
    },
  ];

  // Dynamic endpoints based on role
  const getDocumentsEndpoint = () => {
    return '/api/documents';
  };

  // Fetch documents with React Query
  const { data: documents = [], isLoading: loading } = useQuery({
    queryKey: ['documents', role, user?._id],
    queryFn: async () => {
      const response = await axios.get(getDocumentsEndpoint());
      return response.data;
    },
    enabled: !!role && !!user?._id
  });

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchText || doc.name.toLowerCase().includes(searchText.toLowerCase()) || doc.description?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = !filters.category || doc.category === filters.category;
    const matchesStatus = !filters.status || doc.status === filters.status;
    const matchesBuilding = !filters.building || doc.building?._id === filters.building;
    return matchesSearch && matchesCategory && matchesStatus && matchesBuilding;
  });

  // Upload or update document mutation
  const documentMutation = useMutation({
    mutationFn: async ({ values, formMode, selectedDocument }) => {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'file') {
          if (values.file && values.file[0]) {
            formData.append('file', values.file[0].originFileObj);
          }
        } else if (values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });

      if (formMode === 'create') {
        await axios.post(getDocumentsEndpoint(), formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.put(`${getDocumentsEndpoint()}/${selectedDocument._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowForm(false);
    },
    onError: (error) => {
      alert(`Failed to ${formMode === 'create' ? 'upload' : 'update'} document`);
      console.error(error);
    }
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (docId) => {
      await axios.delete(`${getDocumentsEndpoint()}/${docId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowDeleteDialog(false);
      setSelectedDocument(null);
    },
    onError: () => {
      alert('Failed to delete document');
    },
    onSettled: () => setDeleteLoading(false)
  });

  // Download endpoint
  const getDownloadEndpoint = (doc) => `/api/documents/download/${doc._id}`;

  // Handle document download
  const handleDownloadDocument = async (doc) => {
    try {
      const response = await axios.get(getDownloadEndpoint(doc), {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.name);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download document');
      console.error(error);
    }
  };

  // Open edit form with selected document data
  const openEditForm = (document) => {
    setSelectedDocument(document);
    setFormMode('edit');
    setShowForm(true);
  };

  // Empty state content
  const emptyState = (
    <div className="text-center py-10">
      <HiDocumentText className="mx-auto text-5xl text-gray-300" />
      <h4 className="text-lg font-semibold mt-4">No Documents Found</h4>
      <p className="text-gray-500 mb-6">Upload new documents or adjust your search filters.</p>
      <button
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => {
          setFormMode('create');
          setSelectedDocument(null);
          setShowForm(true);
        }}
      >
        <HiUpload className="mr-2" /> Upload Document
      </button>
    </div>
  );

  return (
    <PageLayout
      title={role === 'admin' ? 'Document Management' : 'Manage Documents'}
      actionButton={
        <button
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            setFormMode('create');
            setSelectedDocument(null);
            setShowForm(true);
          }}
        >
          <HiUpload className="mr-2" /> Upload Document
        </button>
      }
      search={
        <SearchFilter
          searchText={searchText}
          onSearchChange={setSearchText}
          placeholder="Search documents by name or description..."
          filters={searchFilters}
          filterValues={filters}
          onFilterChange={(name, value) => setFilters(prev => ({ ...prev, [name]: value }))}
        />
      }
      loading={loading && <LoadingSpinner text="Loading documents..." />}
      empty={documents.length === 0 && !loading && emptyState}
    >
      {/* Table using Tailwind */}
      {!loading && documents.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Document</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Uploaded</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc._id} className="border-t">
                  <td className="px-4 py-2 flex items-center space-x-2">
                    {getFileIcon(doc.fileType)}
                    <span className="font-semibold">{doc.name}</span>
                    {doc.category && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">
                        {DOCUMENT_CATEGORIES.find(c => c.value === doc.category)?.label || doc.category}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">{doc.description}</td>
                  <td className="px-4 py-2">
                    <span className={
                      doc.status === 'active'
                        ? 'bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs'
                        : doc.status === 'archived'
                        ? 'bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs'
                        : 'bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs'
                    }>
                      {doc.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-2">{doc.uploadedAt ? dayjs(doc.uploadedAt).format('MMM D, YYYY') : '-'}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => handleDownloadDocument(doc)}
                      title="Download"
                    >
                      <HiDownload />
                    </button>
                    <button
                      className="text-yellow-600 hover:underline"
                      onClick={() => openEditForm(doc)}
                      title="Edit"
                      disabled={role === 'manager' && !doc.canEdit}
                    >
                      <HiPencil />
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => {
                        setSelectedDocument(doc);
                        setShowDeleteDialog(true);
                      }}
                      title="Delete"
                      disabled={role === 'manager' && !doc.canDelete}
                    >
                      <HiTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload/Edit Form Modal */}
      {showForm && (
        <FormComponent
          fields={formFields}
          initialValues={formMode === 'edit' ? {
            name: selectedDocument.name,
            description: selectedDocument.description,
            category: selectedDocument.category,
            status: selectedDocument.status || 'active',
          } : {
            status: 'active',
          }}
          onSubmit={(values) => documentMutation.mutate({ values, formMode, selectedDocument })}
          onCancel={() => setShowForm(false)}
          submitText={formMode === 'create' ? 'Upload Document' : 'Update Document'}
          cancelText="Cancel"
          loading={documentMutation.isLoading}
          showCancelButton={true}
          layout="vertical"
          title={formMode === 'create' ? 'Upload New Document' : 'Edit Document'}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          setDeleteLoading(true);
          deleteDocumentMutation.mutate(selectedDocument._id);
        }}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        itemName={selectedDocument?.name}
        loading={deleteLoading}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </PageLayout>
  );
};

export default DocumentPage;