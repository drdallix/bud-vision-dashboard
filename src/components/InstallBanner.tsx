
import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const InstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowBanner(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('installBannerDismissed', 'true');
  };

  // Don't show if dismissed previously
  useEffect(() => {
    const dismissed = localStorage.getItem('installBannerDismissed');
    if (dismissed) {
      setShowBanner(false);
    }
  }, []);

  if (!showBanner || !deferredPrompt) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg border-green-200 bg-gradient-to-r from-green-50 to-green-100">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Install Bud Vision</h3>
              <p className="text-sm text-green-700">Get the full app experience on your device</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleInstall} size="sm" className="bg-green-600 hover:bg-green-700">
              Install
            </Button>
            <Button onClick={handleDismiss} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallBanner;
