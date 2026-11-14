import axios from 'axios';

// Live Base URLs:
// axios.defaults.baseURL = 'https://api.nowaybroker.com';
// axios.defaults.baseURL = 'https://api.truloapp.com/';
// axios.defaults.baseURL = 'http://13.127.244.70:4444';

// Local Base URL:
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export default axios;
