const mongoose = require('mongoose');

const softwareSchema = new mongoose.Schema({
  software_name: { type: String, required: true, trim: true },
  created_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

module.exports = mongoose.model('software', softwareSchema);
