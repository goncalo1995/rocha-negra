import { useState, useEffect } from 'react';
import { WifiOff, ServerCrash, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export function OfflineBanner() {
    const [isBrowserOffline, setIsBrowserOffline] = useState(!navigator.onLine);
    const [isBackendOffline, setIsBackendOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsBrowserOffline(false);
        const handleOffline = () => setIsBrowserOffline(true);
        const handleBackendOnline = () => setIsBackendOffline(false);
        const handleBackendOffline = () => setIsBackendOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('backend-online', handleBackendOnline);
        window.addEventListener('backend-offline', handleBackendOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('backend-online', handleBackendOnline);
            window.removeEventListener('backend-offline', handleBackendOffline);
        };
    }, []);

    if (!isBrowserOffline && !isBackendOffline) return null;

    return (
        <div className="fixed top-4 left-0 right-0 z-[100] animate-in slide-in-from-top-4 flex justify-center p-2 pointer-events-none">
            <div className={cn(
                "pointer-events-auto rounded-full shadow-2xl border px-4 py-2 flex items-center gap-3 backdrop-blur-xl text-sm font-medium transition-all shadow-black/50",
                isBrowserOffline 
                    ? "bg-red-500/10 border-red-500/30 text-red-500 glow-destructive"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-500"
            )}>
                {isBrowserOffline ? (
                    <>
                        <WifiOff className="w-4 h-4 ml-1" />
                        <span className="mr-1">You are offline. Viewing cached data.</span>
                    </>
                ) : (
                    <>
                        <ServerCrash className="w-4 h-4 ml-1" />
                        <span>Server is unreachable. Viewing cached data.</span>
                        <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 px-2 ml-1 hover:bg-amber-500/20 text-amber-500 rounded-full"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw className="w-3 h-3 mr-1" /> Retry
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
