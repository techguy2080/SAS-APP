import axios from 'axios';

// Optionally, set the base URL for your API
// axios.defaults.baseURL = 'http://localhost:5001';

axios.defaults.withCredentials = true;

// Add a request interceptor to attach the JWT token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Or wherever you store your JWT
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Replaced message.error with alert
      alert('Your session has expired. Please login again.');
      localStorage.removeItem('token');
      // Redirect to login page
      window.location.href = '/login'; // Adjust path if your login route is different
    }
    return Promise.reject(error);
  }
);

export default axios;