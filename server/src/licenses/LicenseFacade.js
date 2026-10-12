import LicenseRepository from './LicenseRepository.js';
import SoftwareRepository from '../software/SoftwareRepository.js';
import VersionRepository from '../versions/VersionRepository.js';
import UserRepository from '../users/UserRepository.js';
import NotificationRepository from '../notifications/NotificationRepository.js';
import NotificationFactory from '../notifications/NotificationFactory.js';
import { createError } from '../middleware/ErrorMiddleware.js';

class LicenseFacade {
  async request(user, body) {
    const reason = String(body.reason || '').trim();
    const softwareId = body.assigned_software;
    const versionId = body.version_number;

    if (!softwareId) throw createError('Software is required.');
    if (!reason) throw createError('Business reason is required.');
    if (reason.length > 500) throw createError('Reason must be 500 characters or fewer.');

    const software = await SoftwareRepository.findActiveById(softwareId);
    if (!software) throw createError('Software not found.', 404);

    let version = null;
    if (versionId) {
      version = await VersionRepository.findByIdAndSoftware(versionId, software._id);
      if (!version) throw createError('Version does not belong to this software.');
    }

    const existing = await LicenseRepository.findOpenForUserAndSoftware(user._id, software._id);
    if (existing) throw createError('You already have a pending or active license for this software.');

    const license = await LicenseRepository.create({
      user: user._id,
      assigned_software: software._id,
      version_number: version ? version._id : undefined,
      reason,
      status: 'Pending',
    });

    const admins = await UserRepository.findActiveAdmins();
    if (admins.length) {
      await NotificationRepository.insertMany(
        admins.map((admin) => NotificationFactory.create('request', {
          userId: admin._id,
          fullName: user.full_name,
          softwareName: software.software_name,
        }))
      );
    }

    return LicenseRepository.findByIdWithDetails(license._id);
  }

  async review(id, status) {
    if (!['Approved', 'Rejected', 'Expired'].includes(status)) throw createError('Invalid status.');

    const license = await LicenseRepository.findByIdWithSoftware(id);
    if (!license) throw createError('License not found.', 404);

    if ((status === 'Approved' || status === 'Rejected') && license.status !== 'Pending') {
      throw createError('Only pending requests can be approved or rejected.');
    }
    if (status === 'Expired' && license.status !== 'Approved') {
      throw createError('Only an active license can be revoked.');
    }

    license.status = status;
    license.reviewed_at = new Date();
    if (status === 'Approved') {
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      license.expires_at = expires;
    }
    if (status === 'Expired') license.expires_at = new Date();
    await LicenseRepository.save(license);

    const notice = NotificationFactory.create(status, {
      userId: license.user,
      softwareName: license.assigned_software?.software_name,
    });
    await NotificationRepository.create(notice);
    return LicenseRepository.findByIdWithDetails(license._id);
  }

  async cancel(id, user) {
    const license = await LicenseRepository.findOneForUser(id, user._id);
    if (!license) throw createError('License not found.', 404);
    if (license.status !== 'Approved') throw createError('Only active licenses can be cancelled.');

    license.status = 'Expired';
    license.expires_at = new Date();
    await LicenseRepository.save(license);

    await NotificationRepository.create(NotificationFactory.create('cancelled', {
      userId: user._id,
      softwareName: license.assigned_software?.software_name,
    }));
    return LicenseRepository.findByIdWithDetails(license._id);
  }
}

export default new LicenseFacade();
