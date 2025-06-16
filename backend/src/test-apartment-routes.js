const axios = require('axios');

// Use the fresh token you just obtained
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQyYmYyZjFhNDg2ZWU5MWYxNmJlYTQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDkzMjY5OTgsImV4cCI6MTc0OTMyODc5OH0.IbcjhsX60jAhqwRpG8vLvWpL788F7HYadUronRS_Y9E';

// Base URLs for the new endpoints
const BASE_URL = 'http://localhost:5001/api';
const BUILDINGS_URL = `${BASE_URL}/apartment-buildings`;
const UNITS_URL = `${BASE_URL}/apartment-units`;

// Auth headers for all requests
const headers = { Authorization: `Bearer ${token}` };

// Store IDs for later use
let buildingId;
let unitId;

async function testApartmentRoutes() {
  console.log('🏢 TESTING APARTMENT ROUTES 🏢');
  console.log('===========================');
  
  try {
    // 1. TEST BUILDING ROUTES
    console.log('\n📋 TESTING BUILDING ROUTES:');
    
    // 1.1 Create a new building
    console.log('\n✅ Creating a new building...');
    const buildingData = {
      name: "Test Building " + Date.now(),
      address: "123 Test Avenue",
      amenities: ["Gym", "Pool"],
      manager: "6842c79c736ba40f9e95c452",  // Replace with a real manager ID
      notes: "Test building for API verification"
    };
    
    const buildingRes = await axios.post(BUILDINGS_URL, buildingData, { headers });
    buildingId = buildingRes.data._id;
    console.log(`Building created with ID: ${buildingId}`);
    console.log(`Status: ${buildingRes.status}`);
    
    // 1.2 Get all buildings
    console.log('\n✅ Fetching all buildings...');
    const allBuildingsRes = await axios.get(BUILDINGS_URL, { headers });
    console.log(`Found ${allBuildingsRes.data.length} buildings`);
    console.log(`Status: ${allBuildingsRes.status}`);
    
    // 1.3 Get single building
    console.log('\n✅ Fetching single building...');
    const singleBuildingRes = await axios.get(`${BUILDINGS_URL}/${buildingId}`, { headers });
    console.log(`Building name: ${singleBuildingRes.data.name}`);
    console.log(`Status: ${singleBuildingRes.status}`);
    
    // 1.4 Update building
    console.log('\n✅ Updating building...');
    const updateRes = await axios.put(`${BUILDINGS_URL}/${buildingId}`, 
      { notes: "Updated test notes" }, 
      { headers }
    );
    console.log(`Updated building notes: ${updateRes.data.notes}`);
    console.log(`Status: ${updateRes.status}`);
    
    // 2. TEST UNIT ROUTES
    console.log('\n📋 TESTING APARTMENT UNIT ROUTES:');
    
    // 2.1 Create a new unit
    console.log('\n✅ Creating a new apartment unit...');
    const unitData = {
      building: buildingId,  // Link to the building we just created
      unitNumber: "101",
      floor: 1,
      numberOfRooms: 2,
      numberOfBathrooms: 1,
      sizeSqFt: 850,
      rent: 1200,
      status: "available",
      amenities: ["AC", "Dishwasher"]
    };
    
    const unitRes = await axios.post(UNITS_URL, unitData, { headers });
    unitId = unitRes.data._id;
    console.log(`Unit created with ID: ${unitId}`);
    console.log(`Status: ${unitRes.status}`);
    
    // 2.2 Get all units
    console.log('\n✅ Fetching all apartment units...');
    const allUnitsRes = await axios.get(UNITS_URL, { headers });
    console.log(`Found ${allUnitsRes.data.length} units`);
    console.log(`Status: ${allUnitsRes.status}`);
    
    // 2.3 Update unit
    console.log('\n✅ Updating apartment unit...');
    const updateUnitRes = await axios.put(`${UNITS_URL}/${unitId}`, 
      { rent: 1300 }, 
      { headers }
    );
    console.log(`Updated unit rent: ${updateUnitRes.data.rent}`);
    console.log(`Status: ${updateUnitRes.status}`);
    
    // 3. VERIFY RELATIONSHIPS
    console.log('\n📋 VERIFYING RELATIONSHIPS:');
    
    // 3.1 Check that unit has building reference
    console.log('\n✅ Checking unit references building...');
    const unitDetailsRes = await axios.get(`${UNITS_URL}/${unitId}`, { headers });
    const unitBuilding = unitDetailsRes.data.building;
    console.log(`Unit belongs to building: ${unitBuilding}`);
    console.log(`Match expected building: ${unitBuilding === buildingId}`);
    
    // 4. CLEANUP (optional - comment out if you want to keep the test data)
    console.log('\n📋 CLEANUP:');
    
    // 4.1 Delete unit
    console.log('\n✅ Deleting apartment unit...');
    const deleteUnitRes = await axios.delete(`${UNITS_URL}/${unitId}`, { headers });
    console.log(`Delete unit status: ${deleteUnitRes.status}`);
    console.log(`Message: ${JSON.stringify(deleteUnitRes.data)}`);
    
    // 4.2 Delete building
    console.log('\n✅ Deleting building...');
    const deleteBuildingRes = await axios.delete(`${BUILDINGS_URL}/${buildingId}`, { headers });
    console.log(`Delete building status: ${deleteBuildingRes.status}`);
    console.log(`Message: ${JSON.stringify(deleteBuildingRes.data)}`);
    
    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY 🎉');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data || error.message);
    console.error('Endpoint:', error.config?.url);
    console.error('Method:', error.config?.method.toUpperCase());
  }
}

testApartmentRoutes();