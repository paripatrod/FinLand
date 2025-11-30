import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      // Auto-hide after 3 seconds when back online
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      setDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    if (!navigator.onLine) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner || dismissed) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 
        ${isOnline 
          ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
          : 'bg-gradient-to-r from-amber-500 to-orange-500'
        } 
        text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3
        animate-in slide-in-from-bottom-4 duration-300`}
    >
      <div className={`p-2 rounded-lg ${isOnline ? 'bg-emerald-600' : 'bg-amber-600'}`}>
        {isOnline ? (
          <Wifi className="w-5 h-5" />
        ) : (
          <WifiOff className="w-5 h-5" />
        )}
      </div>
      
      <div className="flex-1">
        <p className="font-medium text-sm">
          {isOnline 
            ? (t('offlineBackOnline') || 'กลับมาออนไลน์แล้ว!') 
            : (t('offlineMode') || 'ออฟไลน์โหมด')
          }
        </p>
        <p className="text-xs opacity-90">
          {isOnline 
            ? (t('offlineBackOnlineDesc') || 'การเชื่อมต่ออินเทอร์เน็ตกลับมาแล้ว')
            : (t('offlineModeDesc') || 'การคำนวณพื้นฐานยังใช้งานได้')
          }
        </p>
      </div>

      {!isOnline && (
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="ปิด"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
