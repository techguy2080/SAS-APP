const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Check if this is the correct port for your backend API
// Try 5000 instead of 5173 - Node servers typically run on 5000, 3000, etc.
const API = 'http://localhost:5001/api';

async function main() {
  console.log('🧪 Starting document upload E2E test...');

  try {
    // 1. Login as admin
    console.log('👤 Attempting to login as admin...');
    const adminLogin = await axios.post(`${API}/auth/login`, {
      // Update with your actual admin credentials
      username: 'admin',
      password: 'Admin123'
    });
    
    console.log('Login response structure:', Object.keys(adminLogin.data));
    const adminToken = adminLogin.data.token;
    if (!adminToken) {
      throw new Error('No token received in login response. Check response format: ' + 
                      JSON.stringify(adminLogin.data));
    }
    console.log('✅ Admin logged in successfully.');
    
    // Continue with the rest of the test
    // 2. Create test managers
    console.log('👥 Creating test managers...');
    const timestamp = Date.now();
    const manager1Username = `manager${timestamp}`;
    const manager2Username = `manager${timestamp + 1}`;
    
    const manager1Res = await axios.post(`${API}/users/admin-create`, {
      username: manager1Username,
      password: 'ManagerPass123',
      email: `manager${timestamp}@example.com`,
      role: 'manager',
      first_name: 'Manager',
      last_name: 'One',
      phone_number: '0700000001'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const manager1Id = manager1Res.data._id || manager1Res.data.id;
    
    const manager2Res = await axios.post(`${API}/users/admin-create`, {
      username: manager2Username,
      password: 'ManagerPass123',
      email: `manager${timestamp+1}@example.com`,
      role: 'manager',
      first_name: 'Manager',
      last_name: 'Two',
      phone_number: '0700000002'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const manager2Id = manager2Res.data._id || manager2Res.data.id;
    console.log('✅ Managers created:', manager1Id, manager2Id);

    // 3. Create buildings for each manager
    console.log('🏢 Creating buildings...');
    const building1Res = await axios.post(`${API}/apartment-buildings`, {
      name: `Sunset Apartments ${timestamp}`,
      address: '123 Main St',
      manager: manager1Id
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const building1Id = building1Res.data._id || building1Res.data.id;

    const building2Res = await axios.post(`${API}/apartment-buildings`, {
      name: `Ocean View Apartments ${timestamp}`,
      address: '456 Beach Rd',
      manager: manager2Id
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const building2Id = building2Res.data._id || building2Res.data.id;
    console.log('✅ Buildings created:', building1Id, building2Id);

    // 4. Create test document file
    console.log('📄 Creating test document...');
    const testFilePath = path.join(__dirname, 'test-document.txt');
    fs.writeFileSync(testFilePath, 'This is a test document for document upload API testing.');
    console.log('✅ Test document created.');

    // 5. Upload document as admin
    console.log('📤 Uploading document as admin...');
    const adminFormData = new FormData();
    adminFormData.append('category', 'property_deed');
    adminFormData.append('description', 'Admin test document');
    adminFormData.append('building', building1Id);
    adminFormData.append('file', fs.createReadStream(testFilePath)); // only ONCE, and LAST!

    const adminDocRes = await axios.post(`${API}/documents`, adminFormData, {
      headers: { 
        Authorization: `Bearer ${adminToken}`,
        ...adminFormData.getHeaders()
      }
    });
    const adminDocId = adminDocRes.data.document._id || adminDocRes.data.document.id;
    console.log('✅ Admin document uploaded:', adminDocId);

    // 6. Login as manager 1
    console.log('👤 Logging in as manager 1...');
    const manager1Login = await axios.post(`${API}/auth/login`, {
      username: manager1Username,
      password: 'ManagerPass123'
    });
    const manager1Token = manager1Login.data.token;
    console.log('✅ Manager 1 logged in successfully.');

    // 7. Upload document as manager 1 for their building
    console.log('📤 Uploading document as manager 1...');
    const manager1FormData = new FormData();
    manager1FormData.append('category', 'lease');
    manager1FormData.append('description', 'Manager 1 test document');
    manager1FormData.append('building', building1Id);
    manager1FormData.append('file', fs.createReadStream(testFilePath));

    const manager1DocRes = await axios.post(`${API}/documents`, manager1FormData, {
      headers: { 
        Authorization: `Bearer ${manager1Token}`,
        ...manager1FormData.getHeaders()
      }
    });
    const manager1DocId = manager1DocRes.data.document._id || manager1DocRes.data.document.id;
    console.log('✅ Manager 1 document uploaded:', manager1DocId);

    // 8. Try to upload document as manager 1 for building 2 (should fail)
    console.log('🧪 Testing access restriction - manager 1 uploads to building 2...');
    const restrictionFormData = new FormData();
    restrictionFormData.append('category', 'lease');
    restrictionFormData.append('description', 'Manager 1 unauthorized document');
    restrictionFormData.append('building', building2Id);
    restrictionFormData.append('file', fs.createReadStream(testFilePath));

    try {
      // This should fail with 403
      await axios.post(`${API}/documents`, restrictionFormData, {
        headers: {
          Authorization: `Bearer ${manager1Token}`,
          ...restrictionFormData.getHeaders()
        }
      });
      throw new Error('Security test failed: Should not allow upload to unauthorized building');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ Correctly received 403 Forbidden when uploading to unauthorized building');
      } else {
        throw error; // Re-throw if it's a different error
      }
    }

    // 9. Login as manager 2
    console.log('👤 Logging in as manager 2...');
    const manager2Login = await axios.post(`${API}/auth/login`, {
      username: manager2Username,
      password: 'ManagerPass123'
    });
    const manager2Token = manager2Login.data.token;
    console.log('✅ Manager 2 logged in successfully.');

    // 10. Verify manager 1 can see only their documents
    console.log('🔍 Verifying manager 1 can only see their documents...');
    const manager1Docs = await axios.get(`${API}/documents`, {
      headers: { Authorization: `Bearer ${manager1Token}` }
    });
    
    // Check if manager 1 can see documents for building 1 (should be 2 - admin's and their own)
    const building1Docs = manager1Docs.data.filter(doc => doc.building && doc.building._id === building1Id);
    console.log(`Found ${building1Docs.length} documents for building 1`);
    
    // Check if manager 1 can see documents for building 2 (should be 0)
    const building2Docs = manager1Docs.data.filter(doc => doc.building && doc.building._id === building2Id);
    console.log(`Found ${building2Docs.length} documents for building 2`);
    
    if (building1Docs.length !== 2 || building2Docs.length !== 0) {
      throw new Error('Document access control test failed: Manager 1 should see only documents for building 1');
    }
    console.log('✅ Manager 1 can correctly see only their documents');

    // 11. Verify manager 2 can only see their documents (should be 0 for now)
    console.log('🔍 Verifying manager 2 can only see their documents...');
    const manager2Docs = await axios.get(`${API}/documents`, {
      headers: { Authorization: `Bearer ${manager2Token}` }
    });
    
    // Check if manager 2 can see documents for building 1 (should be 0)
    const manager2Building1Docs = manager2Docs.data.filter(doc => doc.building && doc.building._id === building1Id);
    
    if (manager2Building1Docs.length !== 0) {
      throw new Error('Document access control test failed: Manager 2 should not see documents for building 1');
    }
    console.log('✅ Manager 2 correctly cannot see documents for building 1');

    // 12. Verify admin can see all documents
    console.log('🔍 Verifying admin can see all documents...');
    const adminDocs = await axios.get(`${API}/documents`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    // Admin should see at least the 2 documents we uploaded
    if (adminDocs.data.length < 2) {
      throw new Error('Document access control test failed: Admin should see all documents');
    }
    console.log('✅ Admin can correctly see all documents');

    // 13. Test document download
    console.log('📥 Testing document download...');
    const downloadRes = await axios.get(`${API}/documents/download/${manager1DocId}`, {
      headers: { Authorization: `Bearer ${manager1Token}` },
      responseType: 'stream'
    });
    
    const downloadPath = path.join(__dirname, 'downloaded-test.txt');
    const writer = fs.createWriteStream(downloadPath);
    downloadRes.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    const downloadedContent = fs.readFileSync(downloadPath, 'utf8');
    if (downloadedContent !== 'This is a test document for document upload API testing.') {
      throw new Error('Document download test failed: Content mismatch');
    }
    console.log('✅ Document download successful');

    // 14. Test document update
    console.log('📝 Testing document update...');
    await axios.put(`${API}/documents/${manager1DocId}`, {
      description: 'Updated test document'
    }, {
      headers: { Authorization: `Bearer ${manager1Token}` }
    });
    
    const updatedDoc = await axios.get(`${API}/documents/${manager1DocId}`, {
      headers: { Authorization: `Bearer ${manager1Token}` }
    });
    
    if (updatedDoc.data.description !== 'Updated test document') {
      throw new Error('Document update test failed: Description not updated');
    }
    console.log('✅ Document update successful');

    // 15. Clean up
    console.log('🧹 Cleaning up test files...');
    fs.unlinkSync(testFilePath);
    fs.unlinkSync(downloadPath);
    
    console.log('🎉 Document upload E2E test completed successfully!');
  } catch (error) {
    console.error('❌ E2E test failed:');
    if (error.response) {
      // The request was made and the server responded with an error
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Is the server running?');
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }
}

main();