/**
 * API Client for KrishiCred Backend
 * Handles all HTTP communication with the FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888';
const API_PREFIX = '/api/v1';

/**
 * Generic fetch wrapper with error handling
 */
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.detail || error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Fire Watch API
 */
export const fireWatchAPI = {
  // Get all fire alerts with optional filtering
  getAlerts: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    if (params.status) queryParams.append('status', params.status);
    if (params.min_confidence) queryParams.append('min_confidence', params.min_confidence);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    return apiCall(`/firewatch/alerts?${queryParams}`);
  },

  // Get fire statistics
  getStats: (days = 30) => apiCall(`/firewatch/stats?days=${days}`),

  // Get specific alert
  getAlert: (alertId) => apiCall(`/firewatch/alerts/${alertId}`),

  // Send WhatsApp alerts for a fire
  sendAlert: (alertId) => apiCall(`/firewatch/alerts/${alertId}/send`, { method: 'POST' }),

  // Record farmer response to alert
  recordResponse: (alertId, data) =>
    apiCall(`/firewatch/alerts/${alertId}/respond`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Trigger satellite processing
  processSatellite: (hoursBack = 6) =>
    apiCall(`/firewatch/process-satellite?hours_back=${hoursBack}`, { method: 'POST' }),

  // Get task status
  getTaskStatus: (taskId) => apiCall(`/firewatch/tasks/${taskId}`),
};

/**
 * Stubble Routes API
 */
export const stubbleAPI = {
  // Get all routes
  getRoutes: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    if (params.status) queryParams.append('status', params.status);
    if (params.plant_id) queryParams.append('plant_id', params.plant_id);
    if (params.farmer_id) queryParams.append('farmer_id', params.farmer_id);

    return apiCall(`/stubble/routes?${queryParams}`);
  },

  // Create new route
  createRoute: (data) => apiCall('/stubble/routes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Get specific route
  getRoute: (routeId) => apiCall(`/stubble/routes/${routeId}`),

  // Update route
  updateRoute: (routeId, data) => apiCall(`/stubble/routes/${routeId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Dispatch route
  dispatchRoute: (routeId, data) => apiCall(`/stubble/routes/${routeId}/dispatch`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Complete route
  completeRoute: (routeId, data) => apiCall(`/stubble/routes/${routeId}/complete`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Optimize routes
  optimizeRoutes: (data) => apiCall('/stubble/optimize', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Get nearby farms with stubble
  getNearbyFarms: (plantId, radius = 50, minStubble = 1.0) =>
    apiCall(`/stubble/nearby-farms?plant_id=${plantId}&radius_km=${radius}&min_stubble_tons=${minStubble}`),

  // Get route statistics
  getStats: (days = 30) => apiCall(`/stubble/stats?days=${days}`),

  // Get plant capacity
  getPlantCapacity: (plantId) => apiCall(`/stubble/plants/${plantId}/capacity`),
};

/**
 * Carbon Credits API
 */
export const carbonAPI = {
  // Calculate credits from stubble
  calculate: (data) => apiCall('/carbon/calculate', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Get all credits
  getCredits: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    if (params.status) queryParams.append('status', params.status);
    if (params.plant_id) queryParams.append('plant_id', params.plant_id);
    if (params.verification_level) queryParams.append('verification_level', params.verification_level);

    return apiCall(`/carbon/credits?${queryParams}`);
  },

  // Get specific credit
  getCredit: (creditId) => apiCall(`/carbon/credits/${creditId}`),

  // Create credit
  createCredit: (data) => apiCall('/carbon/credits', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Verify credit
  verifyCredit: (creditId, data) => apiCall(`/carbon/credits/${creditId}/verify`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Certify credit
  certifyCredit: (creditId, data) => apiCall(`/carbon/credits/${creditId}/certify`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Sell credit
  sellCredit: (creditId, data) => apiCall(`/carbon/credits/${creditId}/sell`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Get transactions
  getTransactions: (creditId = null, limit = 50) => {
    let url = `/carbon/transactions?limit=${limit}`;
    if (creditId) url += `&credit_id=${creditId}`;
    return apiCall(url);
  },

  // Get carbon statistics
  getStats: (days = 30) => apiCall(`/carbon/stats?days=${days}`),

  // Get credits for a plant
  getPlantCredits: (plantId, status = null) => {
    let url = `/carbon/plants/${plantId}/credits`;
    if (status) url += `?status=${status}`;
    return apiCall(url);
  },

  // Get credit for a route
  getRouteCredit: (routeId) => apiCall(`/carbon/routes/${routeId}/credit`),
};

/**
 * Farmers API
 */
export const farmersAPI = {
  // Get all farmers
  getFarmers: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    if (params.village) queryParams.append('village', params.village);
    if (params.district) queryParams.append('district', params.district);

    return apiCall(`/farmers?${queryParams}`);
  },

  // Get specific farmer
  getFarmer: (farmerId) => apiCall(`/farmers/${farmerId}`),

  // Register farmer
  register: (data) => apiCall('/farmers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Update farmer
  updateFarmer: (farmerId, data) => apiCall(`/farmers/${farmerId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Update farmer location
  updateLocation: (farmerId, data) => apiCall(`/farmers/${farmerId}/location`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Find nearby farmers
  getNearby: (latitude, longitude, radius = 10) =>
    apiCall(`/farmers/nearby?lat=${latitude}&lon=${longitude}&radius_km=${radius}`),

  // Get farmer alerts
  getAlerts: (farmerId) => apiCall(`/farmers/${farmerId}/alerts`),

  // Get farmer statistics
  getStats: () => apiCall('/farmers/stats'),
};

/**
 * Biogas Plants API
 */
export const plantsAPI = {
  // Get all plants
  getPlants: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    if (params.status) queryParams.append('status', params.status);

    return apiCall(`/plants?${queryParams}`);
  },

  // Get specific plant
  getPlant: (plantId) => apiCall(`/plants/${plantId}`),

  // Register plant
  register: (data) => apiCall('/plants', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Update plant
  updatePlant: (plantId, data) => apiCall(`/plants/${plantId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Update plant stock
  updateStock: (plantId, data) => apiCall(`/plants/${plantId}/stock`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Get plant routes
  getRoutes: (plantId) => apiCall(`/plants/${plantId}/routes`),

  // Get nearby plants
  getNearby: (latitude, longitude, radius = 50) =>
    apiCall(`/plants/nearby?lat=${latitude}&lon=${longitude}&radius_km=${radius}`),

  // Get plant statistics
  getStats: () => apiCall('/plants/stats'),
};

/**
 * Health Check
 */
export const healthCheck = () => fetch(`${API_BASE_URL}/health`)
  .then(r => r.ok ? r.json() : Promise.reject(r.statusText));

/**
 * Combined API object
 */
export const api = {
  fireWatch: fireWatchAPI,
  stubble: stubbleAPI,
  carbon: carbonAPI,
  farmers: farmersAPI,
  plants: plantsAPI,
  health: healthCheck,
};

export default api;
