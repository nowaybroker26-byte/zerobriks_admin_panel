import { API_BASE_URL } from './endpoints';
import axios from 'axios';

// Live Base URLs:
// axios.defaults.baseURL = 'https://api.nowaybroker.com';
// axios.defaults.baseURL = 'https://api.truloapp.com/';
// axios.defaults.baseURL = 'http://13.127.244.70:4444';

// Local Base URL:
axios.defaults.baseURL = API_BASE_URL;

export default axios;
