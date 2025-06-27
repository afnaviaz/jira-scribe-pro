// frontend/src/services/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
});

export default apiClient;