const axios = require('axios');

const API = 'http://localhost:5173/api';

async function main() {
  // 1. Login as admin
  const adminLogin = await axios.post(`${API}/auth/login`, {
    username: 'admin',
    password: 'Admin123'
  });
  const adminToken = adminLogin.data.token;
  console.log('Admin logged in.');

  // 2. Create manager
  const unique = Date.now();
  const managerUsername = `manager${unique}`;
  const managerRes = await axios.post(`${API}/users/admin-create`, {
    username: managerUsername,
    password: 'ManagerPass123',
    email: 'manager1@example.com',
    role: 'manager',
    first_name: 'Manager',
    last_name: 'One',
    phone_number: '0700000000'
  }, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const managerId = managerRes.data._id || managerRes.data.id;
  console.log('Manager created:', managerId);

  // 3. Create building and assign manager
  const buildingRes = await axios.post(`${API}/apartment-buildings`, {
    name: 'Sunset Apartments',
    address: '123 Main St',
    manager: managerId
  }, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const buildingId = buildingRes.data._id || buildingRes.data.id;
  console.log('Building created:', buildingId);

  // 4. Create unit in building
  const unitRes = await axios.post(`${API}/apartment-units`, {
    building: buildingId,
    unitNumber: '101',
    floor: 1,
    numberOfRooms: 2,
    rent: 1200,
    createdBy: managerId
  }, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const unitId = unitRes.data._id || unitRes.data.id;
  console.log('Unit created:', unitId);

  // 5. Login as manager
  const managerLogin = await axios.post(`${API}/auth/login`, {
    username: managerUsername,
    password: 'ManagerPass123'
  });
  const managerToken = managerLogin.data.token;
  console.log('Manager logged in.');

  // 6. Create tenant for the unit
  const tenantRes = await axios.post(`${API}/users`, {
    username: 'tenantuser101',
    password: 'securepassword',
    email: 'tenant101@example.com',
    role: 'tenant',
    first_name: 'Jane',
    last_name: 'Doe',
    phone_number: '1234567890',
    unit: unitId
  }, {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  const tenantId = tenantRes.data._id || tenantRes.data.id;
  console.log('Tenant created:', tenantId);

  // 7. Fetch tenants for manager
  const tenantsRes = await axios.get(`${API}/users/manager-tenants`, {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  console.log('Manager tenants:', tenantsRes.data);

  // Verify the unit's building
  const verifyUnit = await axios.get(`${API}/apartment-units/${unitId}`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('DEBUG: Unit building:', verifyUnit.data.building, 'Expected:', buildingId);

  console.log('E2E test completed successfully!');
}

main().catch(e => {
  console.error('E2E test failed:', e.response?.data || e.message);
  process.exit(1);
});