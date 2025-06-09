export const DONATION_ALERT_EVENT = 'donation-alert-trigger';

export function triggerDonationAlert() {
  window.dispatchEvent(new CustomEvent(DONATION_ALERT_EVENT));
}

export function listenForDonationAlert(callback: () => void) {
  const handler = () => callback();
  window.addEventListener(DONATION_ALERT_EVENT, handler);
  return () => window.removeEventListener(DONATION_ALERT_EVENT, handler);
} 