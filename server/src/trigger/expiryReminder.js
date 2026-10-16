import LicenseRepository from '../licenses/LicenseRepository.js';
import NotificationRepository from '../notifications/NotificationRepository.js';
import NotificationFactory from '../notifications/NotificationFactory.js';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export async function checkExpiryReminders() {
  const licenses = await LicenseRepository.findDueForExpiryReminder(TWENTY_FOUR_HOURS_MS);

  for (const license of licenses) {
    const notice = NotificationFactory.create('expiring', {
      userId: license.user,
      softwareName: license.assigned_software?.software_name,
    });
    await NotificationRepository.create(notice);
    await LicenseRepository.markExpiryReminderSent(license._id);
  }

  if (licenses.length) {
    console.log(`Sent ${licenses.length} license expiry reminder(s).`);
  }
}
