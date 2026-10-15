import cron from 'node-cron';
import { checkExpiryReminders } from './expiryReminder.js';

export function startTriggers() {
  cron.schedule('0 * * * *', () => {
    checkExpiryReminders().catch((err) => {
      console.error('Expiry reminder failed.', err.message);
    });
  });

  checkExpiryReminders().catch((err) => {
    console.error('Expiry reminder failed.', err.message);
  });
}
