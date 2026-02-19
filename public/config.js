// API Configuration
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : window.location.origin;

console.log('API URL:', API_URL);
console.log('Hostname:', window.location.hostname);
