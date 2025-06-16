const axios = require('axios');

async function loginAsAdmin() {
  try {
    console.log('Attempting to login as admin...');
    
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin', // or admin@example.com if that's your admin email
      password: 'Admin123'
    });
    
    console.log('\n✅ Login successful!');
    console.log('\n📋 Auth Token Details:');
    console.log('=====================');
    console.log(`Token: ${response.data.token}`);
    console.log(`User ID: ${response.data.user.userId || response.data.user._id}`);
    console.log(`Role: ${response.data.user.role}`);
    
    console.log('\n📋 Copy this for your test:');
    console.log('=====================');
    console.log(`const token = '${response.data.token}';`);
    
    return response.data.token;
  } catch (error) {
    console.error('\n❌ Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Check if your credentials are correct');
      console.log('- Username might be an email (e.g., admin@example.com)');
      console.log('- Password might be case-sensitive');
    }
  }
}

loginAsAdmin();