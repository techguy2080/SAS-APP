const axios = require('axios');

async function generateAdminToken() {
  try {
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin',     // Lowercase admin username
      password: 'Admin123'  // The admin password you provided
    });
    
    console.log('New token:', response.data.token);
    console.log('User info:', response.data.user);
  } catch (error) {
    console.error('Failed to generate token:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

generateAdminToken();