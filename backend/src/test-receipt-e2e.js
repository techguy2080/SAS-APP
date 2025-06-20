const axios = require('axios');
const fs = require('fs');

const API = 'http://localhost:5001/api';

async function main() {
  try {
    // 1. Login as admin
    const adminLogin = await axios.post(`${API}/auth/login`, {
      username: 'admin',
      password: 'Admin123'
    });
    const adminToken = adminLogin.data.token;

    // 2. Create a manager, building, apartment unit, tenant, and payment
    const timestamp = Date.now();
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

    const buildingRes = await axios.post(`${API}/apartment-buildings`, {
      name: `Test Building ${timestamp}`,
      address: '123 Test St',
      manager: managerId
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    const buildingId = buildingRes.data._id || buildingRes.data.id;

    // Create apartment unit (not just "unit")
    const apartmentUnitRes = await axios.post(`${API}/apartment-units`, {
      building: buildingId,
      unitNumber: `A-${timestamp.toString().slice(-3)}`,
      floor: 1,
      numberOfRooms: 2,
      rent: 10000,
      createdBy: managerId
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    const apartmentUnitId = apartmentUnitRes.data._id || apartmentUnitRes.data.id;

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

    // Create payment using apartmentUnit
    const paymentRes = await axios.post(`${API}/payments`, {
      tenant: tenantId,
      apartmentUnit: apartmentUnitId, // use apartmentUnit, not unit
      type: 'rent',
      amount: 10000,
      status: 'completed',
      paidAt: new Date().toISOString(),
      paymentMethod: 'cash',
      notes: 'June rent'
    }, { headers: { Authorization: `Bearer ${managerToken}` } });
    const paymentId = paymentRes.data._id || paymentRes.data.id;
    console.log('✅ Payment recorded by manager:', paymentId);

    // 3. Manager generates a receipt for the payment
    const receiptRes = await axios.post(`${API}/receipts`, {
      paymentId,
      notes: 'Receipt for June rent'
    }, { headers: { Authorization: `Bearer ${managerToken}` } });
    const receiptId = receiptRes.data._id || receiptRes.data.id;
    console.log('✅ Receipt generated by manager:', receiptId);

    // 4. Admin fetches the receipt
    const adminReceipt = await axios.get(`${API}/receipts/${receiptId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin can fetch receipt:', adminReceipt.data.receiptNumber);

    // 5. Manager fetches the receipt
    const managerReceipt = await axios.get(`${API}/receipts/${receiptId}`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    console.log('✅ Manager can fetch receipt:', managerReceipt.data.receiptNumber);

    // 6. Tenant fetches the receipt
    const tenantReceipt = await axios.get(`${API}/receipts/${receiptId}`, {
      headers: { Authorization: `Bearer ${tenantToken}` }
    });
    console.log('✅ Tenant can fetch receipt:', tenantReceipt.data.receiptNumber);

    // 7. Download the receipt as PDF (as tenant)
    const pdfRes = await axios.get(`${API}/receipts/${receiptId}/download`, {
      headers: { Authorization: `Bearer ${tenantToken}` },
      responseType: 'arraybuffer'
    });
    fs.writeFileSync(`receipt-${receiptId}.pdf`, pdfRes.data);
    console.log('✅ Tenant downloaded receipt PDF:', `receipt-${receiptId}.pdf`);

    console.log('🎉 All receipt E2E tests passed!');
  } catch (error) {
    console.error('❌ Receipt E2E test failed:');
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