// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none'
      });
      
      console.log('✅ Service Worker registered:', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 New Service Worker available, refreshing...');
              // Notify user or auto-refresh
              if (confirm('มีเวอร์ชันใหม่พร้อมใช้งาน ต้องการรีเฟรชหน้าเว็บหรือไม่?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
      // Periodic update check
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  });
}

// Listen for online/offline events
window.addEventListener('online', () => {
  console.log('🌐 Back online');
  document.body.classList.remove('offline-mode');
});

window.addEventListener('offline', () => {
  console.log('📴 Gone offline');
  document.body.classList.add('offline-mode');
});
