import mongoose  from 'mongoose';

const licenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Expired'], default: 'Pending' },
  assigned_software: { type: mongoose.Schema.Types.ObjectId, ref: 'software' },
  requested_at: { type: Date, default: Date.now },
  reviewed_at: { type: Date, default: null },
  expires_at: {
    type: Date,
    required: [
      function expiresWhenApproved() {
        return this.status === 'Approved';
      },
      'Approved licenses require an expiry date.',
    ],
  },
  version_number: { type: mongoose.Schema.Types.ObjectId, ref: 'software_version' },
});

export default mongoose.model('license', licenseSchema);
