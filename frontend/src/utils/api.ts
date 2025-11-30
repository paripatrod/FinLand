// API Configuration
const API_BASE_URL = 'https://finland-ilb5.onrender.com';

export const apiClient = {
  async post(endpoint: string, data: any) {
    const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
    
    // Add timeout for slow server wake-up (Render free tier)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
        mode: 'cors',
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Return response as-is, let caller handle errors with full JSON data
      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('⏳ เซิร์ฟเวอร์กำลังเริ่มต้น กรุณารอสักครู่แล้วลองใหม่');
      }
      throw err;
    }
  },

  async get(endpoint: string) {
    const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
    const response = await fetch(url, {
      mode: 'cors',
      cache: 'no-cache'
    });
    
    return response;
  }
};
