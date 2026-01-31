import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from './ui/Button';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            const timer = setTimeout(() => setIsInstalled(true), 0);
            return () => clearTimeout(timer);
        }

        // Check if user dismissed the prompt recently
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed, 10);
            const threeDays = 3 * 24 * 60 * 60 * 1000;
            if (Date.now() - dismissedTime < threeDays) {
                return;
            }
        }

        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt after a short delay for better UX
            setTimeout(() => setShowPrompt(true), 2000);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    if (isInstalled || !showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
                role="dialog"
                aria-labelledby="install-prompt-title"
                aria-describedby="install-prompt-desc"
            >
                <div className="glass-panel p-4 bg-gradient-to-br from-violet-900/90 to-indigo-900/90 border-violet-500/30 shadow-2xl shadow-violet-500/20">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                        aria-label="Dismiss install prompt"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-violet-500/20 text-violet-300">
                            <Smartphone size={28} />
                        </div>
                        <div className="flex-1 pr-6">
                            <h3 id="install-prompt-title" className="font-bold text-white mb-1">
                                Install French Game
                            </h3>
                            <p id="install-prompt-desc" className="text-sm text-slate-300 mb-3">
                                Add to your home screen for quick access and offline learning!
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleInstall}
                                    className="flex-1"
                                >
                                    <Download size={16} />
                                    Install
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleDismiss}
                                >
                                    Not now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InstallPrompt;
