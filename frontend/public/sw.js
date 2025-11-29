// Service Worker for PWA - Offline Support & Advanced Caching
const CACHE_VERSION = 'v3.1.0';
const CACHE_NAME = `fincalc-${CACHE_VERSION}`;
const API_CACHE = `fincalc-api-${CACHE_VERSION}`;
const CALCULATION_CACHE = `fincalc-calc-${CACHE_VERSION}`;

// Assets to cache on install (basic shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/Pedro.png'
];

// API endpoints that should be cached for offline use
const CACHEABLE_API_ROUTES = [
  '/api/health',
  '/api/calculate/credit-card',
  '/api/calculate/student-loan',
  '/api/predict'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first with cache fallback (for API)
  networkFirst: async (request, cacheName) => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(cacheName);
        // Clone the response before caching
        const clonedResponse = response.clone();
        cache.put(request, clonedResponse);
      }
      return response;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('📦 Serving from cache:', request.url);
        return cachedResponse;
      }
      throw error;
    }
  },
  
  // Stale while revalidate (for static assets)
  staleWhileRevalidate: async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(() => null);
    
    return cachedResponse || fetchPromise;
  },
  
  // Cache first (for immutable assets like fonts, icons)
  cacheFirst: async (request, cacheName) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  }
};

// Offline calculation fallback
const OFFLINE_CALCULATIONS = {
  '/api/calculate/credit-card': (data) => {
    const { balance, apr, monthly_payment } = data;
    const monthlyRate = (apr / 100) / 12;
    let currentBalance = balance;
    let months = 0;
    let totalInterest = 0;
    const schedule = [];
    
    while (currentBalance > 0 && months < 600) {
      months++;
      const interest = currentBalance * monthlyRate;
      const principal = Math.min(monthly_payment - interest, currentBalance);
      
      if (principal <= 0) {
        return { error: 'ยอดจ่ายต่ำเกินไป' };
      }
      
      currentBalance -= principal;
      totalInterest += interest;
      
      schedule.push({
        month: months,
        payment: Math.round((interest + principal) * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        principal: Math.round(principal * 100) / 100,
        remaining: Math.round(Math.max(0, currentBalance) * 100) / 100
      });
    }
    
    return {
      success: true,
      months,
      total_paid: Math.round((balance + totalInterest) * 100) / 100,
      total_interest: Math.round(totalInterest * 100) / 100,
      schedule,
      offline: true
    };
  },
  
  '/api/calculate/student-loan': (data) => {
    const { loan_amount, interest_rate, term_months } = data;
    const monthlyRate = (interest_rate / 100) / 12;
    
    let monthlyPayment;
    if (monthlyRate > 0) {
      monthlyPayment = loan_amount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -term_months));
    } else {
      monthlyPayment = loan_amount / term_months;
    }
    
    let currentBalance = loan_amount;
    let totalInterest = 0;
    const schedule = [];
    
    for (let month = 1; month <= term_months; month++) {
      const interest = currentBalance * monthlyRate;
      const principal = monthlyPayment - interest;
      currentBalance -= principal;
      totalInterest += interest;
      
      schedule.push({
        month,
        payment: Math.round(monthlyPayment * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        principal: Math.round(principal * 100) / 100,
        remaining: Math.round(Math.max(0, currentBalance) * 100) / 100
      });
    }
    
    return {
      success: true,
      monthly_payment: Math.round(monthlyPayment * 100) / 100,
      total_paid: Math.round(monthlyPayment * term_months * 100) / 100,
      total_interest: Math.round(totalInterest * 100) / 100,
      schedule,
      offline: true
    };
  }
};

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker v3.1.0 installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker v3.1.0 activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('fincalc-') && 
                          name !== CACHE_NAME && 
                          name !== API_CACHE && 
                          name !== CALCULATION_CACHE)
            .map(name => {
              console.log('🗑️ Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch handler with different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests (except our API)
  if (url.origin !== location.origin && !url.href.includes('finland')) {
    return;
  }

  // API requests - Network first with offline calculation fallback
  if (url.pathname.startsWith('/api/') || url.href.includes('/api/')) {
    event.respondWith(
      (async () => {
        try {
          // Try network first
          const response = await fetch(request.clone());
          
          if (response.ok) {
            // Cache successful responses
            const cache = await caches.open(API_CACHE);
            cache.put(request, response.clone());
            return response;
          }
          
          throw new Error(`HTTP ${response.status}`);
        } catch (error) {
          console.log('🔄 Network failed, trying cache/offline calculation...');
          
          // Try cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            console.log('📦 Returning cached response');
            return cachedResponse;
          }
          
          // Try offline calculation for POST requests
          if (request.method === 'POST') {
            const requestData = await request.clone().json();
            const endpoint = url.pathname;
            
            if (OFFLINE_CALCULATIONS[endpoint]) {
              console.log('🧮 Performing offline calculation');
              const result = OFFLINE_CALCULATIONS[endpoint](requestData);
              
              return new Response(JSON.stringify(result), {
                status: 200,
                headers: { 
                  'Content-Type': 'application/json',
                  'X-Offline-Mode': 'true'
                }
              });
            }
          }
          
          // Return offline error
          return new Response(
            JSON.stringify({ 
              error: 'คุณกำลังออฟไลน์ - ไม่สามารถเชื่อมต่อ API ได้',
              offline: true 
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      })()
    );
    return;
  }

  // Static assets - Stale while revalidate (cache JS/CSS with hash names)
  if (request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'image' ||
      url.pathname.includes('/assets/') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        
        const fetchPromise = fetch(request).then(response => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => {
          console.log('📦 Serving asset from cache:', request.url);
          return cachedResponse;
        });
        
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Fonts and icons - Cache first
  if (request.destination === 'font' || url.pathname.endsWith('.ico')) {
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request, CACHE_NAME));
    return;
  }

  // HTML navigation - Network first with SPA fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
            // Also cache the index.html specifically
            cache.put('/index.html', response.clone());
          }
          return response;
        } catch (error) {
          console.log('📦 Serving offline page from cache');
          const cachedResponse = await cache.match(request) || await cache.match('/index.html');
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return a basic offline page if nothing is cached
          return new Response(
            `<!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>FinLand - Offline</title>
              <style>
                body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
                .container { text-align: center; padding: 2rem; }
                h1 { font-size: 2rem; margin-bottom: 1rem; }
                p { opacity: 0.9; margin-bottom: 2rem; }
                button { background: white; color: #10b981; border: none; padding: 1rem 2rem; border-radius: 0.5rem; font-size: 1rem; cursor: pointer; }
                button:hover { transform: scale(1.05); }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>📴 คุณกำลังออฟไลน์</h1>
                <p>กรุณาเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง</p>
                <button onclick="location.reload()">🔄 ลองใหม่</button>
              </div>
            </body>
            </html>`,
            {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
          );
        }
      })
    );
    return;
  }

  // Default - Network with cache fallback
  event.respondWith(CACHE_STRATEGIES.networkFirst(request, CACHE_NAME));
});

// Background sync for pending calculations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-calculations') {
    console.log('🔄 Background sync: Processing pending calculations');
    event.waitUntil(syncPendingCalculations());
  }
});

async function syncPendingCalculations() {
  // Get pending calculations from IndexedDB or localStorage
  const pendingCalcs = await getPendingCalculations();
  
  for (const calc of pendingCalcs) {
    try {
      const response = await fetch(calc.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calc.data)
      });
      
      if (response.ok) {
        await removePendingCalculation(calc.id);
        console.log('✅ Synced calculation:', calc.id);
      }
    } catch (error) {
      console.log('❌ Failed to sync:', calc.id);
    }
  }
}

async function getPendingCalculations() {
  // Placeholder - implement with IndexedDB
  return [];
}

async function removePendingCalculation(id) {
  // Placeholder - implement with IndexedDB
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: data.tag || 'default',
        data: data.url
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

// Message handler for cache updates
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_CALCULATION') {
    caches.open(CALCULATION_CACHE).then(cache => {
      cache.put(
        new Request(event.data.key),
        new Response(JSON.stringify(event.data.value))
      );
    });
  }
});
