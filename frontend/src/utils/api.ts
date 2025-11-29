// API Configuration
const API_BASE_URL = 'https://finland-ilb5.onrender.com';

export const apiClient = {
  async post(endpoint: string, data: any) {
    const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }
    
    return response;
  },

  async get(endpoint: string) {
    const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
    const response = await fetch(url, {
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }
    
    return response;
  }
};
