'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { X, Check } from 'lucide-react';
import { listenForDonationAlert } from '@/lib/events';

const COOLDOWN_PERIOD = 3 * 60 * 1000; // 3 minutes

export function DonationAlert() {
  const [showAlert, setShowAlert] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem('donationAlertLastShown');
    const now = Date.now();
    
    // Check if cooldown period has passed
    if (!lastShown || (now - parseInt(lastShown)) > COOLDOWN_PERIOD) {
      const alertChance = process.env.NEXT_PUBLIC_DONATION_ALERT_CHANCE 
        ? parseFloat(process.env.NEXT_PUBLIC_DONATION_ALERT_CHANCE) 
        : 0.5;
      
      const shouldShow = Math.random() < alertChance;
      if (shouldShow) {
        setShowAlert(true);
        localStorage.setItem('donationAlertLastShown', now.toString());
      }
    }

    // Listen for donation alert triggers
    const cleanup = listenForDonationAlert(() => {
      const now = Date.now();
      const lastShown = localStorage.getItem('donationAlertLastShown');
      
      if (!lastShown || (now - parseInt(lastShown)) > COOLDOWN_PERIOD) {
        setShowAlert(true);
        localStorage.setItem('donationAlertLastShown', now.toString());
      }
    });

    return cleanup;
  }, []);

  const handleCopyAddress = async () => {
    const walletAddress = process.env.NEXT_PUBLIC_DONATION_WALLET_ADDRESS || '0x1234...5678';
    await navigator.clipboard.writeText(walletAddress);
    setShowCopySuccess(true);
    
    // Hide success message and alert after 2 seconds
    setTimeout(() => {
      setShowCopySuccess(false);
      setShowAlert(false);
    }, 2000);
  };

  if (!showAlert) return null;

  const walletAddress = process.env.NEXT_PUBLIC_DONATION_WALLET_ADDRESS || '0x1234...5678';

  return (
    <Alert className="fixed bottom-0 left-0 right-0 w-full bg-background border-t border-primary/20 shadow-lg z-50 md:bottom-4 md:left-auto md:right-4 md:w-96 md:rounded-lg">
      <div className="flex justify-between items-start p-4">
        <div className="flex-1">
          <AlertTitle>Support VeilVid</AlertTitle>
          <AlertDescription className="mt-2">
            Help us keep improving VeilVid by making a donation to our crypto wallet.
          </AlertDescription>
          <div className="mt-4 space-y-2">
            <p className="text-sm font-mono bg-muted p-2 rounded break-all">
              ETH: {walletAddress}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopyAddress}
              disabled={showCopySuccess}
            >
              {showCopySuccess ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Copied!
                </span>
              ) : (
                'Copy Address'
              )}
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-4"
          onClick={() => setShowAlert(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
} 