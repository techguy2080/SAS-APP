import React from 'react';
import { Helmet } from 'react-helmet-async';
import DynamicDashboard from '../../components/dashboard/DashboardComponent';

const TenantDashboard = () => {
  return (
    <>
      <Helmet>
        <title>Tenant Portal | Kidega Apartments</title>
        <meta name="description" content="Tenant portal for Kidega Apartments residents" />
      </Helmet>

      <DynamicDashboard />
    </>
  );
};

export default TenantDashboard;