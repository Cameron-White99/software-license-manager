import mongoose from 'mongoose';

const softwareVersionSchema = new mongoose.Schema({
  version_number: { type: String, required: true, unique: true, trim: true },
  release_notes: { type: String, required: true },
  release_date: { type: Date, default: Date.now },
  software: { type: mongoose.Schema.Types.ObjectId, ref: 'software', required: true },
});

export default mongoose.model('software_version', softwareVersionSchema);