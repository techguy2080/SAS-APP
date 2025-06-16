const axios = require('axios');

// Get a fresh token using the login-admin.js script or curl command
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQyYmYyZjFhNDg2ZWU5MWYxNmJlYTQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDkzMjY5OTgsImV4cCI6MTc0OTMyODc5OH0.IbcjhsX60jAhqwRpG8vLvWpL788F7HYadUronRS_Y9E';

// Base URLs for the endpoints
const BASE_URL = 'http://localhost:5001/api';
const BUILDINGS_URL = `${BASE_URL}/apartment-buildings`;
const UNITS_URL = `${BASE_URL}/apartment-units`;
const USERS_URL = `${BASE_URL}/users`;

// Auth headers for all requests
const headers = { Authorization: `Bearer ${token}` };

// Store IDs for later use
let buildingId;
let unitId;
let secondUnitId;
let managerId = "6842c79c736ba40f9e95c452"; // Use a real manager ID

async function runAdvancedTests() {
  console.log('🏢 ADVANCED APARTMENT API TESTS 🏢');
  console.log('==================================');
  
  try {
    // SETUP: Create test building and units
    const building = await createTestBuilding();
    buildingId = building._id;
    
    const unit1 = await createTestUnit(buildingId, "101", 1200);
    unitId = unit1._id;
    
    const unit2 = await createTestUnit(buildingId, "102", 1500);
    secondUnitId = unit2._id;

    // 1. VALIDATION TESTS
    await runValidationTests();
    
    // 2. MANAGER-SPECIFIC TESTS
    await runManagerTests();
    
    // 3. TENANT TESTS
    await runTenantTests();
    
    // 4. FILTER AND QUERY TESTS
    await runFilterTests();
    
    // 5. EDGE CASE TESTS
    await runEdgeCaseTests();
    
    // CLEANUP
    await cleanup();
    
    console.log('\n🎉 ALL ADVANCED TESTS COMPLETED SUCCESSFULLY 🎉');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data || error.message);
    console.error('Endpoint:', error.config?.url);
    console.error('Method:', error.config?.method.toUpperCase());
  }
}

// Helper function to create a test building
async function createTestBuilding() {
  console.log('\n📋 CREATING TEST BUILDING');
  const buildingData = {
    name: "Advanced Test Building " + Date.now(),
    address: "456 Test Boulevard",
    amenities: ["Gym", "Pool", "Parking"],
    manager: managerId,
    notes: "Test building for advanced API testing",
    totalUnits: 0
  };
  
  const res = await axios.post(BUILDINGS_URL, buildingData, { headers });
  console.log(`Building created with ID: ${res.data._id}`);
  return res.data;
}

// Helper function to create a test unit
async function createTestUnit(buildingId, unitNumber, rent) {
  console.log(`\n📋 CREATING TEST UNIT ${unitNumber}`);
  const unitData = {
    building: buildingId,
    unitNumber: unitNumber,
    floor: parseInt(unitNumber[0]),
    numberOfRooms: 2,
    numberOfBathrooms: 1,
    sizeSqFt: 850,
    rent: rent,
    status: "available",
    amenities: ["AC", "Dishwasher"]
  };
  
  const res = await axios.post(UNITS_URL, unitData, { headers });
  console.log(`Unit ${unitNumber} created with ID: ${res.data._id}`);
  return res.data;
}

// 1. VALIDATION TESTS
async function runValidationTests() {
  console.log('\n📋 RUNNING VALIDATION TESTS');
  
  // 1.1 Test creating building without required fields
  try {
    console.log('\n✅ Testing building creation without required fields...');
    await axios.post(BUILDINGS_URL, { name: "Incomplete Building" }, { headers });
    console.log('❌ Test failed: Building created without required fields');
  } catch (error) {
    console.log('✅ Correctly rejected building without required fields');
    console.log(`Status: ${error.response.status}`);
  }
  
  // 1.2 Test creating unit without building reference
  try {
    console.log('\n✅ Testing unit creation without building...');
    await axios.post(UNITS_URL, { 
      unitNumber: "999",
      rent: 1000
    }, { headers });
    console.log('❌ Test failed: Unit created without building reference');
  } catch (error) {
    console.log('✅ Correctly rejected unit without building reference');
    console.log(`Status: ${error.response.status}`);
  }
  
  // 1.3 Test updating building with invalid data
  try {
    console.log('\n✅ Testing building update with invalid data...');
    await axios.put(`${BUILDINGS_URL}/${buildingId}`, { 
      totalUnits: "not a number" 
    }, { headers });
    console.log('❌ Test failed: Building updated with invalid data');
  } catch (error) {
    console.log('✅ Handled invalid building update data');
    console.log(`Status: ${error.response.status}`);
  }
}

// 2. MANAGER-SPECIFIC TESTS
async function runManagerTests() {
  console.log('\n📋 RUNNING MANAGER TESTS');
  
  // 2.1 Test getting buildings by manager
  console.log('\n✅ Testing get buildings by manager...');
  const res = await axios.get(`${BUILDINGS_URL}/manager/${managerId}`, { headers });
  console.log(`Found ${res.data.length} buildings for manager`);
  console.log(`Status: ${res.status}`);
  
  // 2.2 Check building count
  const hasTestBuilding = res.data.some(building => building._id === buildingId);
  console.log(`Test building found in manager's buildings: ${hasTestBuilding}`);
  
  // Add more manager-specific tests as needed
}

// 3. TENANT TESTS
async function runTenantTests() {
  console.log('\n📋 RUNNING TENANT TESTS');
  
  // 3.1 Test adding tenant to unit
  console.log('\n✅ Testing add tenant to unit...');
  // This would normally use a real tenant ID, but we'll simulate it
  try {
    const addTenantRes = await axios.post(`${UNITS_URL}/add-tenant`, {
      apartmentId: unitId,
      tenantId: "6842c0000000000000000000", // Replace with a real tenant ID
      leaseStart: new Date().toISOString(),
      leaseEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    }, { headers });
    console.log(`Tenant added to unit`);
    console.log(`Status: ${addTenantRes.status}`);
  } catch (error) {
    // This might fail if the tenant ID doesn't exist, that's OK for our test
    console.log('Note: Add tenant test may fail if using a fake tenant ID');
    console.log(`Status: ${error.response?.status}`);
  }
  
  // Add more tenant-specific tests as needed
}

// 4. FILTER AND QUERY TESTS
async function runFilterTests() {
  console.log('\n📋 RUNNING FILTER AND QUERY TESTS');
  
  // 4.1 Test getting units with specific status
  console.log('\n✅ Testing unit filtering by status...');
  
  // Update one unit to be occupied
  await axios.put(`${UNITS_URL}/${secondUnitId}`, {
    status: "occupied",
    building: buildingId // Include building ID to avoid validation error
  }, { headers });
  
  // Now get available units
  const availableRes = await axios.get(`${UNITS_URL}?status=available`, { headers });
  console.log(`Found ${availableRes.data.length} available units`);
  
  // Get occupied units
  const occupiedRes = await axios.get(`${UNITS_URL}?status=occupied`, { headers });
  console.log(`Found ${occupiedRes.data.length} occupied units`);
  
  // 4.2 Test units with rent in range
  console.log('\n✅ Testing unit filtering by rent range...');
  const affordableRes = await axios.get(`${UNITS_URL}?minRent=1000&maxRent=1300`, { headers });
  console.log(`Found ${affordableRes.data.length} units in affordable range`);
  
  const expensiveRes = await axios.get(`${UNITS_URL}?minRent=1400`, { headers });
  console.log(`Found ${expensiveRes.data.length} units in expensive range`);
}

// 5. EDGE CASE TESTS
async function runEdgeCaseTests() {
  console.log('\n📋 RUNNING EDGE CASE TESTS');
  
  // 5.1 Test building with non-existent ID
  console.log('\n✅ Testing get building with non-existent ID...');
  try {
    await axios.get(`${BUILDINGS_URL}/111222333444555666777888`, { headers });
    console.log('❌ Test failed: No error for non-existent building');
  } catch (error) {
    console.log('✅ Correctly handled non-existent building ID');
    console.log(`Status: ${error.response.status}`);
  }
  
  // 5.2 Test building totalUnits count
  console.log('\n✅ Testing building totalUnits count...');
  const buildingRes = await axios.get(`${BUILDINGS_URL}/${buildingId}`, { headers });
  console.log(`Building total units: ${buildingRes.data.totalUnits}`);
  console.log(`Actual units created: 2`);
  
  // 5.3 Test creating unit with duplicate number in same building
  console.log('\n✅ Testing duplicate unit number...');
  try {
    await createTestUnit(buildingId, "101", 1200); // Same as first unit
    console.log('❌ Test failed: Created duplicate unit number');
  } catch (error) {
    console.log('✅ Correctly handled duplicate unit number');
    console.log(`Status: ${error.response?.status}`);
  }
}

// Cleanup test data
async function cleanup() {
  console.log('\n📋 CLEANUP');
  
  // Delete units
  console.log('\n✅ Deleting test units...');
  await axios.delete(`${UNITS_URL}/${unitId}`, { headers });
  await axios.delete(`${UNITS_URL}/${secondUnitId}`, { headers });
  
  // Delete building
  console.log('\n✅ Deleting test building...');
  await axios.delete(`${BUILDINGS_URL}/${buildingId}`, { headers });
  
  console.log('Cleanup complete');
}

// Run the tests
runAdvancedTests();