// API Configuration
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : window.location.origin;

console.log('API URL:', API_URL);
