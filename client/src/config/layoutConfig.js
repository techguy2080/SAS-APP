export const layoutConfig = {
  admin: {
    navigation: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/admin/users', label: 'Users', icon: 'users' },
      { path: '/admin/properties', label: 'Properties', icon: 'properties' },
      { path: '/admin/documents', label: 'Documents', icon: 'documents' },
      { path: '/admin/payments', label: 'Payments', icon: 'payments' }
    ]
  },
  manager: {
    navigation: [
      { path: '/manager/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/manager/tenants', label: 'Tenants', icon: 'users' },
      { path: '/manager/maintenance', label: 'Maintenance', icon: 'maintenance' },
      { path: '/manager/documents', label: 'Documents', icon: 'documents' },
      { path: '/manager/payments', label: 'Payments', icon: 'payments' }
    ]
  },
  tenant: {
    navigation: [
      { path: '/tenant/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/tenant/payments', label: 'Payments', icon: 'payments' },
      { path: '/tenant/maintenance', label: 'Maintenance', icon: 'maintenance' },
      { path: '/tenant/documents', label: 'Documents', icon: 'documents' }
    ]
  }
};