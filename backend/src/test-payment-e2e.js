const axios = require('axios');

const API = 'http://localhost:5001/api';

async function main() {
  try {
    // 1. Login as admin
    const adminLogin = await axios.post(`${API}/auth/login`, {
      username: 'admin',
      password: 'Admin123'
    });
    const adminToken = adminLogin.data.token;

    // 2. Create a manager
    const timestamp = Date.now();
    console.log('Creating manager with data:', {
      username: `manager${timestamp}`,
      password: 'ManagerPass123',
      email: `manager${timestamp}@example.com`,
      role: 'manager',
      first_name: 'Manager',
      last_name: 'Test',
      phone_number: `+254712${timestamp.toString().slice(-6)}`
    });
    const managerRes = await axios.post(`${API}/users/admin-create`, {
      username: `manager${timestamp}`,
      password: 'ManagerPass123',
      email: `manager${timestamp}@example.com`,
      role: 'manager',
      first_name: 'Manager',
      last_name: 'Test',
      phone_number: `+254712${timestamp.toString().slice(-6)}`
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    const managerId = managerRes.data._id || managerRes.data.id;

    // 3. Create a building (before tenant)
    const buildingRes = await axios.post(`${API}/apartment-buildings`, {
      name: `Test Building ${timestamp}`,
      address: '123 Test St',
      manager: managerId
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    const buildingId = buildingRes.data._id || buildingRes.data.id;

    // 4. Create an apartment unit
    const unitRes = await axios.post(`${API}/apartment-units`, {
      building: buildingId,
      unitNumber: `A-${timestamp.toString().slice(-3)}`,
      floor: 1,
      numberOfRooms: 2,
      rent: 10000,
      createdBy: managerId
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    const unitId = unitRes.data._id || unitRes.data.id;

    // 5. Create a tenant
    const tenantRes = await axios.post(`${API}/users/admin-create`, {
      username: `tenant${timestamp}`,
      password: 'TenantPass123',
      email: `tenant${timestamp}@example.com`,
      role: 'tenant',
      first_name: 'Tenant',
      last_name: 'Test',
      phone_number: `+254722${timestamp.toString().slice(-6)}`,
      apartment: buildingId
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    const tenantId = tenantRes.data._id || tenantRes.data.id;

    // 6. Login as manager and tenant
    const managerLogin = await axios.post(`${API}/auth/login`, {
      username: `manager${timestamp}`,
      password: 'ManagerPass123'
    });
    const managerToken = managerLogin.data.token;

    const tenantLogin = await axios.post(`${API}/auth/login`, {
      username: `tenant${timestamp}`,
      password: 'TenantPass123'
    });
    const tenantToken = tenantLogin.data.token;

    // 7. Manager records a payment
    const paymentRes = await axios.post(`${API}/payments`, {
      tenant: tenantId,
      unit: unitId, // Use the created unit's ID
      type: 'rent',
      amount: 10000,
      status: 'completed',
      paidAt: new Date().toISOString(),
      paymentMethod: 'cash',
      notes: 'June rent'
    }, { headers: { Authorization: `Bearer ${managerToken}` } });
    const paymentId = paymentRes.data._id || paymentRes.data.id;
    console.log('✅ Payment recorded by manager:', paymentId);

    // 8. Admin views all payments
    const adminPayments = await axios.get(`${API}/payments`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin can view payments:', adminPayments.data.length);

    // 9. Manager views payments (should see their building/unit)
    const managerPayments = await axios.get(`${API}/payments`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    console.log('✅ Manager can view payments:', managerPayments.data.length);

    // 10. Tenant views payments (should see only their own)
    const tenantPayments = await axios.get(`${API}/payments`, {
      headers: { Authorization: `Bearer ${tenantToken}` }
    });
    console.log('✅ Tenant can view payments:', tenantPayments.data.length);

    // 11. Manager updates payment
    await axios.put(`${API}/payments/${paymentId}`, {
      notes: 'Updated by manager'
    }, { headers: { Authorization: `Bearer ${managerToken}` } });
    console.log('✅ Manager updated payment');

    // 12. Tenant tries to create payment (should fail)
    try {
      await axios.post(`${API}/payments`, {
        tenant: tenantId,
        unit: unitId,
        type: 'rent',
        amount: 10000
      }, { headers: { Authorization: `Bearer ${tenantToken}` } });
      throw new Error('❌ Tenant should not be able to create payment');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Tenant forbidden from creating payment');
      } else {
        throw err;
      }
    }

    // 13. Admin tries to update payment (should fail)
    try {
      await axios.put(`${API}/payments/${paymentId}`, {
        notes: 'Admin update attempt'
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      throw new Error('❌ Admin should not be able to update payment');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Admin forbidden from updating payment');
      } else {
        throw err;
      }
    }

    console.log('🎉 All payment E2E tests passed!');
  } catch (error) {
    console.error('❌ Payment E2E test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

main();